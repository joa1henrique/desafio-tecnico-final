/// <reference types="jest" />
import { request, loginAs } from '../helpers/app';
import { resetAndSeed } from '../helpers/prisma';

describe('Reimbursement approve', () => {
  beforeAll(async () => {
    await resetAndSeed();
  });

  test('gestor can approve a submitted reimbursement', async () => {
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
      .send({ categoriaId, descricao: 'To approve', valor: 100.0, dataDespesa: new Date().toISOString() });

    expect([200, 201]).toContain(createRes.status);
    const created = createRes.body;
    expect(created).toHaveProperty('id');

    const submitRes = await request.post(`/reimbursements/${created.id}/submit`).set('Cookie', colabCookie || '');
    expect(submitRes.status).toBe(200);
    expect(submitRes.body.status).toBe('ENVIADO');

    // Gestor approves
    const { cookie: gestorCookie } = await loginAs('gestor@exemplo.com', 'admin123');
    const approveRes = await request.post(`/reimbursements/${created.id}/approve`).set('Cookie', gestorCookie || '');
    expect(approveRes.status).toBe(200);
    expect(approveRes.body.status).toBe('APROVADO');
  });

  test('non-gestor cannot approve reimbursement', async () => {
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
      .send({ categoriaId, descricao: 'To try approve', valor: 100.0, dataDespesa: new Date().toISOString() });

    expect([200, 201]).toContain(createRes.status);
    const created = createRes.body;

    const submitRes = await request.post(`/reimbursements/${created.id}/submit`).set('Cookie', colabCookie || '');
    expect(submitRes.status).toBe(200);

    // Colaborador tries to approve (should fail)
    const approveRes = await request.post(`/reimbursements/${created.id}/approve`).set('Cookie', colabCookie || '');
    expect(approveRes.status).toBe(403);
  });

  test('cannot approve reimbursement not in ENVIADO status', async () => {
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

    // Gestor tries to approve RASCUNHO (should fail)
    const { cookie: gestorCookie } = await loginAs('gestor@exemplo.com', 'admin123');
    const approveRes = await request.post(`/reimbursements/${created.id}/approve`).set('Cookie', gestorCookie || '');
    expect(approveRes.status).toBe(400);
  });

  test('approve nonexistent reimbursement returns 404', async () => {
    const { cookie: gestorCookie } = await loginAs('gestor@exemplo.com', 'admin123');
    expect(gestorCookie).toBeDefined();

    const nonexistentUUID = '00000000-0000-0000-0000-000000000000';
    const approveRes = await request.post(`/reimbursements/${nonexistentUUID}/approve`).set('Cookie', gestorCookie || '');
    expect(approveRes.status).toBe(404);
  });
});
