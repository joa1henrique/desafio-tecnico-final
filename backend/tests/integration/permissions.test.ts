/// <reference types="jest" />
import { request, loginAs } from '../helpers/app';
import { resetAndSeed } from '../helpers/prisma';

describe('Permissions validation', () => {
  beforeAll(async () => {
    await resetAndSeed();
  });

  // Users CRUD — only ADMIN
  test('colaborador cannot create user', async () => {
    const { cookie } = await loginAs('colaborador@exemplo.com', 'admin123');
    expect(cookie).toBeDefined();

    const res = await request
      .post('/users')
      .set('Cookie', cookie || '')
      .send({
        nome: 'New User',
        email: `test-${Date.now()}@exemplo.com`,
        senha: 'senha123',
        perfil: 'COLABORADOR',
      });

    expect(res.status).toBe(403);
  });

  test('gestor cannot list users', async () => {
    const { cookie } = await loginAs('gestor@exemplo.com', 'admin123');
    expect(cookie).toBeDefined();

    const res = await request.get('/users').set('Cookie', cookie || '');
    expect(res.status).toBe(403);
  });

  // Categories — list is public, create/update is ADMIN only
  test('non-authenticated user can list categories', async () => {
    const res = await request.get('/categories');
    expect(res.status).toBe(200);
  });

  test('financeiro cannot create category', async () => {
    const { cookie } = await loginAs('financeiro@exemplo.com', 'admin123');
    expect(cookie).toBeDefined();

    const res = await request
      .post('/categories')
      .set('Cookie', cookie || '')
      .send({
        nome: `Categoria ${Date.now()}`,
        ativo: true,
      });

    expect(res.status).toBe(403);
  });

  // Reimbursement flow — specific permissions per status
  test('gestor cannot create reimbursement', async () => {
    const { cookie: gestorCookie } = await loginAs('gestor@exemplo.com', 'admin123');
    const { cookie: colabCookie } = await loginAs('colaborador@exemplo.com', 'admin123');

    const categoriesRes = await request.get('/categories').set('Cookie', colabCookie || '');
    const categoriaId = categoriesRes.body.items && categoriesRes.body.items[0] ? categoriesRes.body.items[0].id : undefined;

    const res = await request
      .post('/reimbursements')
      .set('Cookie', gestorCookie || '')
      .send({
        categoriaId,
        descricao: 'Should fail',
        valor: 50.0,
        dataDespesa: new Date().toISOString(),
      });

    expect(res.status).toBe(403);
  });

  test('colaborador cannot approve reimbursement', async () => {
    // Create and submit as colab
    const { cookie: colabCookie } = await loginAs('colaborador@exemplo.com', 'admin123');

    const categoriesRes = await request.get('/categories').set('Cookie', colabCookie || '');
    const categoriaId = categoriesRes.body.items && categoriesRes.body.items[0] ? categoriesRes.body.items[0].id : undefined;

    const createRes = await request
      .post('/reimbursements')
      .set('Cookie', colabCookie || '')
      .send({ categoriaId, descricao: 'Test', valor: 50.0, dataDespesa: new Date().toISOString() });

    const created = createRes.body;

    const submitRes = await request.post(`/reimbursements/${created.id}/submit`).set('Cookie', colabCookie || '');
    expect(submitRes.status).toBe(200);

    // Try to approve as colaborador
    const approveRes = await request.post(`/reimbursements/${created.id}/approve`).set('Cookie', colabCookie || '');
    expect(approveRes.status).toBe(403);
  });

  test('gestor cannot pay reimbursement', async () => {
    // Create, submit, and approve as gestor/colab flow
    const { cookie: colabCookie } = await loginAs('colaborador@exemplo.com', 'admin123');
    const { cookie: gestorCookie } = await loginAs('gestor@exemplo.com', 'admin123');

    const categoriesRes = await request.get('/categories').set('Cookie', colabCookie || '');
    const categoriaId = categoriesRes.body.items && categoriesRes.body.items[0] ? categoriesRes.body.items[0].id : undefined;

    const createRes = await request
      .post('/reimbursements')
      .set('Cookie', colabCookie || '')
      .send({ categoriaId, descricao: 'Test', valor: 50.0, dataDespesa: new Date().toISOString() });

    const created = createRes.body;

    const submitRes = await request.post(`/reimbursements/${created.id}/submit`).set('Cookie', colabCookie || '');
    expect(submitRes.status).toBe(200);

    const approveRes = await request.post(`/reimbursements/${created.id}/approve`).set('Cookie', gestorCookie || '');
    expect(approveRes.status).toBe(200);

    // Try to pay as gestor
    const payRes = await request.post(`/reimbursements/${created.id}/pay`).set('Cookie', gestorCookie || '');
    expect(payRes.status).toBe(403);
  });

  test('financeiro cannot reject reimbursement', async () => {
    // Create and submit as colab
    const { cookie: colabCookie } = await loginAs('colaborador@exemplo.com', 'admin123');
    const { cookie: financeiroCookie } = await loginAs('financeiro@exemplo.com', 'admin123');

    const categoriesRes = await request.get('/categories').set('Cookie', colabCookie || '');
    const categoriaId = categoriesRes.body.items && categoriesRes.body.items[0] ? categoriesRes.body.items[0].id : undefined;

    const createRes = await request
      .post('/reimbursements')
      .set('Cookie', colabCookie || '')
      .send({ categoriaId, descricao: 'Test', valor: 50.0, dataDespesa: new Date().toISOString() });

    const created = createRes.body;

    const submitRes = await request.post(`/reimbursements/${created.id}/submit`).set('Cookie', colabCookie || '');
    expect(submitRes.status).toBe(200);

    // Try to reject as financeiro
    const rejectRes = await request
      .post(`/reimbursements/${created.id}/reject`)
      .set('Cookie', financeiroCookie || '')
      .send({ justificativaRejeicao: 'Should fail' });

    expect(rejectRes.status).toBe(403);
  });

  test('non-authenticated user cannot access protected routes', async () => {
    const nonAuthCookie = 'invalid-cookie';

    // Try users endpoint
    const usersRes = await request.get('/users').set('Cookie', nonAuthCookie);
    expect(usersRes.status).toBe(401);

    // Try create reimbursement
    const reimbRes = await request
      .post('/reimbursements')
      .set('Cookie', nonAuthCookie)
      .send({
        categoriaId: '00000000-0000-0000-0000-000000000000',
        descricao: 'Test',
        valor: 50.0,
        dataDespesa: new Date().toISOString(),
      });

    expect(reimbRes.status).toBe(401);
  });
});
