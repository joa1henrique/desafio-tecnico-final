/// <reference types="jest" />
import { request, loginAs } from '../helpers/app';
import { resetAndSeed } from '../helpers/prisma';

describe('Reimbursement pay', () => {
  beforeAll(async () => {
    await resetAndSeed();
  });

  test('financeiro can pay an approved reimbursement', async () => {
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
      .send({ categoriaId, descricao: 'To pay', valor: 150.0, dataDespesa: new Date().toISOString() });

    expect([200, 201]).toContain(createRes.status);
    const created = createRes.body;
    expect(created).toHaveProperty('id');

    const submitRes = await request.post(`/reimbursements/${created.id}/submit`).set('Cookie', colabCookie || '');
    expect(submitRes.status).toBe(200);

    // Gestor approves
    const { cookie: gestorCookie } = await loginAs('gestor@exemplo.com', 'admin123');
    const approveRes = await request.post(`/reimbursements/${created.id}/approve`).set('Cookie', gestorCookie || '');
    expect(approveRes.status).toBe(200);
    expect(approveRes.body.status).toBe('APROVADO');

    // Financeiro pays
    const { cookie: financeiroCookie } = await loginAs('financeiro@exemplo.com', 'admin123');
    const payRes = await request.post(`/reimbursements/${created.id}/pay`).set('Cookie', financeiroCookie || '');
    expect(payRes.status).toBe(200);
    expect(payRes.body.status).toBe('PAGO');
  });

  test('non-financeiro cannot pay reimbursement', async () => {
    // Colaborador creates, submits; Gestor approves
    const { cookie: colabCookie } = await loginAs('colaborador@exemplo.com', 'admin123');
    expect(colabCookie).toBeDefined();

    const categoriesRes = await request.get('/categories').set('Cookie', colabCookie || '');
    expect(categoriesRes.status).toBe(200);
    const categoriaId = categoriesRes.body.items && categoriesRes.body.items[0] ? categoriesRes.body.items[0].id : undefined;
    expect(categoriaId).toBeDefined();

    const createRes = await request
      .post('/reimbursements')
      .set('Cookie', colabCookie || '')
      .send({ categoriaId, descricao: 'To try pay', valor: 150.0, dataDespesa: new Date().toISOString() });

    expect([200, 201]).toContain(createRes.status);
    const created = createRes.body;

    const submitRes = await request.post(`/reimbursements/${created.id}/submit`).set('Cookie', colabCookie || '');
    expect(submitRes.status).toBe(200);

    const { cookie: gestorCookie } = await loginAs('gestor@exemplo.com', 'admin123');
    const approveRes = await request.post(`/reimbursements/${created.id}/approve`).set('Cookie', gestorCookie || '');
    expect(approveRes.status).toBe(200);

    // Gestor tries to pay (should fail)
    const payRes = await request.post(`/reimbursements/${created.id}/pay`).set('Cookie', gestorCookie || '');
    expect(payRes.status).toBe(403);
  });

  test('cannot pay reimbursement not in APROVADO status', async () => {
    // Colaborador creates and submits but doesn't get approved
    const { cookie: colabCookie } = await loginAs('colaborador@exemplo.com', 'admin123');
    expect(colabCookie).toBeDefined();

    const categoriesRes = await request.get('/categories').set('Cookie', colabCookie || '');
    expect(categoriesRes.status).toBe(200);
    const categoriaId = categoriesRes.body.items && categoriesRes.body.items[0] ? categoriesRes.body.items[0].id : undefined;
    expect(categoriaId).toBeDefined();

    const createRes = await request
      .post('/reimbursements')
      .set('Cookie', colabCookie || '')
      .send({ categoriaId, descricao: 'Invalid transition', valor: 150.0, dataDespesa: new Date().toISOString() });

    expect([200, 201]).toContain(createRes.status);
    const created = createRes.body;

    const submitRes = await request.post(`/reimbursements/${created.id}/submit`).set('Cookie', colabCookie || '');
    expect(submitRes.status).toBe(200);

    // Financeiro tries to pay ENVIADO (should fail)
    const { cookie: financeiroCookie } = await loginAs('financeiro@exemplo.com', 'admin123');
    const payRes = await request.post(`/reimbursements/${created.id}/pay`).set('Cookie', financeiroCookie || '');
    expect(payRes.status).toBe(400);
  });

  test('pay nonexistent reimbursement returns 404', async () => {
    const { cookie: financeiroCookie } = await loginAs('financeiro@exemplo.com', 'admin123');
    expect(financeiroCookie).toBeDefined();

    const nonexistentUUID = '00000000-0000-0000-0000-000000000000';
    const payRes = await request.post(`/reimbursements/${nonexistentUUID}/pay`).set('Cookie', financeiroCookie || '');
    expect(payRes.status).toBe(404);
  });
});
