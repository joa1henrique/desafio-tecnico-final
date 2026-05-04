/// <reference types="jest" />
import { request, loginAs } from '../helpers/app';
import { resetAndSeed } from '../helpers/prisma';

describe('Reimbursement reject', () => {
  beforeAll(async () => {
    await resetAndSeed();
  });

  test('gestor can reject a submitted reimbursement with justification', async () => {
    // Colaborador creates and submits
    const { cookie: colabCookie } = await loginAs('colaborador@exemplo.com', 'admin123');
    expect(colabCookie).toBeDefined();

    const categoriesRes = await request.get('/categories').set('Cookie', colabCookie || '');
    expect(categoriesRes.status).toBe(200);
    const categoriaId = categoriesRes.body.items && categoriesRes.body.items[0] ? categoriesRes.body.items[0].id : undefined;
    expect(categoriaId).toBeDefined();

    const createRes = await request
      .post('/reimbursements')
      .set('Cookie', colabCookie || '')
      .send({ categoriaId, descricao: 'To reject', valor: 100.0, dataDespesa: new Date().toISOString() });

    expect([200, 201]).toContain(createRes.status);
    const created = createRes.body;
    expect(created).toHaveProperty('id');

    const submitRes = await request.post(`/reimbursements/${created.id}/submit`).set('Cookie', colabCookie || '');
    expect(submitRes.status).toBe(200);
    expect(submitRes.body.status).toBe('ENVIADO');

    // Gestor rejects with justification
    const { cookie: gestorCookie } = await loginAs('gestor@exemplo.com', 'admin123');
    const rejectRes = await request
      .post(`/reimbursements/${created.id}/reject`)
      .set('Cookie', gestorCookie || '')
      .send({ justificativaRejeicao: 'Documento inválido' });

    expect(rejectRes.status).toBe(200);
    expect(rejectRes.body.status).toBe('REJEITADO');
    expect(rejectRes.body.justificativaRejeicao).toBe('Documento inválido');
  });

  test('reject without justification returns 400', async () => {
    // Colaborador creates and submits
    const { cookie: colabCookie } = await loginAs('colaborador@exemplo.com', 'admin123');
    expect(colabCookie).toBeDefined();

    const categoriesRes = await request.get('/categories').set('Cookie', colabCookie || '');
    expect(categoriesRes.status).toBe(200);
    const categoriaId = categoriesRes.body.items && categoriesRes.body.items[0] ? categoriesRes.body.items[0].id : undefined;
    expect(categoriaId).toBeDefined();

    const createRes = await request
      .post('/reimbursements')
      .set('Cookie', colabCookie || '')
      .send({ categoriaId, descricao: 'To reject', valor: 100.0, dataDespesa: new Date().toISOString() });

    expect([200, 201]).toContain(createRes.status);
    const created = createRes.body;

    const submitRes = await request.post(`/reimbursements/${created.id}/submit`).set('Cookie', colabCookie || '');
    expect(submitRes.status).toBe(200);

    // Gestor tries to reject without justification
    const { cookie: gestorCookie } = await loginAs('gestor@exemplo.com', 'admin123');
    const rejectRes = await request
      .post(`/reimbursements/${created.id}/reject`)
      .set('Cookie', gestorCookie || '')
      .send({ justificativaRejeicao: '' });

    expect(rejectRes.status).toBe(400);
  });

  test('non-gestor cannot reject reimbursement', async () => {
    // Colaborador creates and submits
    const { cookie: colabCookie } = await loginAs('colaborador@exemplo.com', 'admin123');
    expect(colabCookie).toBeDefined();

    const categoriesRes = await request.get('/categories').set('Cookie', colabCookie || '');
    expect(categoriesRes.status).toBe(200);
    const categoriaId = categoriesRes.body.items && categoriesRes.body.items[0] ? categoriesRes.body.items[0].id : undefined;
    expect(categoriaId).toBeDefined();

    const createRes = await request
      .post('/reimbursements')
      .set('Cookie', colabCookie || '')
      .send({ categoriaId, descricao: 'To try reject', valor: 100.0, dataDespesa: new Date().toISOString() });

    expect([200, 201]).toContain(createRes.status);
    const created = createRes.body;

    const submitRes = await request.post(`/reimbursements/${created.id}/submit`).set('Cookie', colabCookie || '');
    expect(submitRes.status).toBe(200);

    // Colaborador tries to reject (should fail)
    const rejectRes = await request
      .post(`/reimbursements/${created.id}/reject`)
      .set('Cookie', colabCookie || '')
      .send({ justificativaRejeicao: 'Because I said so' });

    expect(rejectRes.status).toBe(403);
  });

  test('cannot reject reimbursement not in ENVIADO status', async () => {
    // Colaborador creates but doesn't submit (stays RASCUNHO)
    const { cookie: colabCookie } = await loginAs('colaborador@exemplo.com', 'admin123');
    expect(colabCookie).toBeDefined();

    const categoriesRes = await request.get('/categories').set('Cookie', colabCookie || '');
    expect(categoriesRes.status).toBe(200);
    const categoriaId = categoriesRes.body.items && categoriesRes.body.items[0] ? categoriesRes.body.items[0].id : undefined;
    expect(categoriaId).toBeDefined();

    const createRes = await request
      .post('/reimbursements')
      .set('Cookie', colabCookie || '')
      .send({ categoriaId, descricao: 'Invalid transition', valor: 100.0, dataDespesa: new Date().toISOString() });

    expect([200, 201]).toContain(createRes.status);
    const created = createRes.body;

    // Gestor tries to reject RASCUNHO (should fail)
    const { cookie: gestorCookie } = await loginAs('gestor@exemplo.com', 'admin123');
    const rejectRes = await request
      .post(`/reimbursements/${created.id}/reject`)
      .set('Cookie', gestorCookie || '')
      .send({ justificativaRejeicao: 'Invalid status' });

    expect(rejectRes.status).toBe(400);
  });

  test('reject nonexistent reimbursement returns 404', async () => {
    const { cookie: gestorCookie } = await loginAs('gestor@exemplo.com', 'admin123');
    expect(gestorCookie).toBeDefined();

    const nonexistentUUID = '00000000-0000-0000-0000-000000000000';
    const rejectRes = await request
      .post(`/reimbursements/${nonexistentUUID}/reject`)
      .set('Cookie', gestorCookie || '')
      .send({ justificativaRejeicao: 'Not found' });

    expect(rejectRes.status).toBe(404);
  });
});
