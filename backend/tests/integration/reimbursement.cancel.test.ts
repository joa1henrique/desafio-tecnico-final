/// <reference types="jest" />
import { request, loginAs } from '../helpers/app';
import { resetAndSeed } from '../helpers/prisma';

describe('Reimbursement cancel', () => {
  beforeAll(async () => {
    await resetAndSeed();
  });

  test('colaborador can cancel a draft reimbursement', async () => {
    const { cookie } = await loginAs('colaborador@exemplo.com', 'admin123');
    expect(cookie).toBeDefined();

    const categoriesRes = await request.get('/categories').set('Cookie', cookie || '');
    expect(categoriesRes.status).toBe(200);
    const categoriaId = categoriesRes.body.items && categoriesRes.body.items[0] ? categoriesRes.body.items[0].id : undefined;
    expect(categoriaId).toBeDefined();

    const createRes = await request
      .post('/reimbursements')
      .set('Cookie', cookie || '')
      .send({ categoriaId, descricao: 'To cancel', valor: 10.0, dataDespesa: new Date().toISOString() });

    expect([200,201]).toContain(createRes.status);
    const created = createRes.body;
    expect(created).toHaveProperty('id');
    expect(created.status).toBe('RASCUNHO');

    const cancelRes = await request.post(`/reimbursements/${created.id}/cancel`).set('Cookie', cookie || '');
    expect(cancelRes.status).toBe(200);
    expect(cancelRes.body.status).toBe('CANCELADO');
  });

  test('colaborador can cancel a submitted reimbursement', async () => {
    const { cookie } = await loginAs('colaborador@exemplo.com', 'admin123');
    expect(cookie).toBeDefined();

    const categoriesRes = await request.get('/categories').set('Cookie', cookie || '');
    expect(categoriesRes.status).toBe(200);
    const categoriaId = categoriesRes.body.items && categoriesRes.body.items[0] ? categoriesRes.body.items[0].id : undefined;
    expect(categoriaId).toBeDefined();

    const createRes = await request
      .post('/reimbursements')
      .set('Cookie', cookie || '')
      .send({ categoriaId, descricao: 'To cancel submitted', valor: 20.0, dataDespesa: new Date().toISOString() });

    expect([200,201]).toContain(createRes.status);
    const created = createRes.body;
    expect(created).toHaveProperty('id');

    const submitRes = await request.post(`/reimbursements/${created.id}/submit`).set('Cookie', cookie || '');
    expect(submitRes.status).toBe(200);
    expect(submitRes.body.status).toBe('ENVIADO');

    const cancelRes = await request.post(`/reimbursements/${created.id}/cancel`).set('Cookie', cookie || '');
    expect(cancelRes.status).toBe(200);
    expect(cancelRes.body.status).toBe('CANCELADO');
  });

  test('non-owner cannot cancel another colaborador reimbursement', async () => {
    // create and submit as colaborador 1
    const { cookie: cookie1 } = await loginAs('colaborador@exemplo.com', 'admin123');
    expect(cookie1).toBeDefined();

    const categoriesRes = await request.get('/categories').set('Cookie', cookie1 || '');
    expect(categoriesRes.status).toBe(200);
    const categoriaId = categoriesRes.body.items && categoriesRes.body.items[0] ? categoriesRes.body.items[0].id : undefined;
    expect(categoriaId).toBeDefined();

    const createRes = await request
      .post('/reimbursements')
      .set('Cookie', cookie1 || '')
      .send({ categoriaId, descricao: 'To be attempted cancel by another', valor: 15.0, dataDespesa: new Date().toISOString() });

    expect([200,201]).toContain(createRes.status);
    const created = createRes.body;
    expect(created).toHaveProperty('id');

    const submitRes = await request.post(`/reimbursements/${created.id}/submit`).set('Cookie', cookie1 || '');
    expect(submitRes.status).toBe(200);

    // attempt to cancel as admin (different user)
    const { cookie: adminCookie } = await loginAs('admin@exemplo.com', 'admin123');
    const cancelRes = await request.post(`/reimbursements/${created.id}/cancel`).set('Cookie', adminCookie || '');
    expect(cancelRes.status).toBe(403);
  });

  test('cannot cancel a paid reimbursement (invalid transition)', async () => {
    const { cookie } = await loginAs('colaborador@exemplo.com', 'admin123');
    expect(cookie).toBeDefined();

    const categoriesRes = await request.get('/categories').set('Cookie', cookie || '');
    expect(categoriesRes.status).toBe(200);
    const categoriaId = categoriesRes.body.items && categoriesRes.body.items[0] ? categoriesRes.body.items[0].id : undefined;
    expect(categoriaId).toBeDefined();

    // create, submit, approve, pay
    const createRes = await request
      .post('/reimbursements')
      .set('Cookie', cookie || '')
      .send({ categoriaId, descricao: 'To be paid', valor: 50.0, dataDespesa: new Date().toISOString() });

    expect([200,201]).toContain(createRes.status);
    const created = createRes.body;
    expect(created).toHaveProperty('id');

    const submitRes = await request.post(`/reimbursements/${created.id}/submit`).set('Cookie', cookie || '');
    expect(submitRes.status).toBe(200);

    // login as gestor and approve
    const { cookie: gestorCookie } = await loginAs('gestor@exemplo.com', 'admin123');
    const approveRes = await request.post(`/reimbursements/${created.id}/approve`).set('Cookie', gestorCookie || '');
    expect(approveRes.status).toBe(200);

    // login as financeiro and pay
    const { cookie: financeiroCookie } = await loginAs('financeiro@exemplo.com', 'admin123');
    const payRes = await request.post(`/reimbursements/${created.id}/pay`).set('Cookie', financeiroCookie || '');
    expect(payRes.status).toBe(200);

    // attempt to cancel as colaborador (owner)
    const cancelRes = await request.post(`/reimbursements/${created.id}/cancel`).set('Cookie', cookie || '');
    expect(cancelRes.status).toBe(400);
  });

  test('cancel nonexistent reimbursement returns 404', async () => {
    const { cookie } = await loginAs('colaborador@exemplo.com', 'admin123');
    expect(cookie).toBeDefined();

    // Use a valid UUID that doesn't exist in the database
    const nonexistentUUID = '00000000-0000-0000-0000-000000000000';
    const cancelRes = await request.post(`/reimbursements/${nonexistentUUID}/cancel`).set('Cookie', cookie || '');
    expect(cancelRes.status).toBe(404);
  });
});
