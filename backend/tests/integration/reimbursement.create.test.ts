/// <reference types="jest" />
import { request, loginAs } from '../helpers/app';
import { resetAndSeed } from '../helpers/prisma';

describe('Reimbursement create validations', () => {
  beforeAll(async () => {
    await resetAndSeed();
  });

  test('create without authentication returns 401', async () => {
    const res = await request.post('/reimbursements').send({
      categoriaId: '00000000-0000-0000-0000-000000000000',
      descricao: 'Test',
      valor: 10.0,
      dataDespesa: new Date().toISOString(),
    });

    expect(res.status).toBe(401);
  });

  test('create with valor <= 0 returns 400', async () => {
    const { cookie } = await loginAs('colaborador@exemplo.com', 'admin123');
    expect(cookie).toBeDefined();

    const categoriesRes = await request.get('/categories').set('Cookie', cookie || '');
    expect(categoriesRes.status).toBe(200);
    const categoriaId = categoriesRes.body.items && categoriesRes.body.items[0] ? categoriesRes.body.items[0].id : undefined;
    expect(categoriaId).toBeDefined();

    const res = await request
      .post('/reimbursements')
      .set('Cookie', cookie || '')
      .send({ categoriaId, descricao: 'Invalid valor', valor: 0, dataDespesa: new Date().toISOString() });

    expect(res.status).toBe(400);
  });

  test('create with negative valor returns 400', async () => {
    const { cookie } = await loginAs('colaborador@exemplo.com', 'admin123');
    expect(cookie).toBeDefined();

    const categoriesRes = await request.get('/categories').set('Cookie', cookie || '');
    expect(categoriesRes.status).toBe(200);
    const categoriaId = categoriesRes.body.items && categoriesRes.body.items[0] ? categoriesRes.body.items[0].id : undefined;
    expect(categoriaId).toBeDefined();

    const res = await request
      .post('/reimbursements')
      .set('Cookie', cookie || '')
      .send({ categoriaId, descricao: 'Negative valor', valor: -5.0, dataDespesa: new Date().toISOString() });

    expect(res.status).toBe(400);
  });

  test('create without dataDespesa returns 400', async () => {
    const { cookie } = await loginAs('colaborador@exemplo.com', 'admin123');
    expect(cookie).toBeDefined();

    const categoriesRes = await request.get('/categories').set('Cookie', cookie || '');
    expect(categoriesRes.status).toBe(200);
    const categoriaId = categoriesRes.body.items && categoriesRes.body.items[0] ? categoriesRes.body.items[0].id : undefined;
    expect(categoriaId).toBeDefined();

    const res = await request
      .post('/reimbursements')
      .set('Cookie', cookie || '')
      .send({ categoriaId, descricao: 'Missing date', valor: 10.0 });

    expect(res.status).toBe(400);
  });

  test('create without descricao returns 400', async () => {
    const { cookie } = await loginAs('colaborador@exemplo.com', 'admin123');
    expect(cookie).toBeDefined();

    const categoriesRes = await request.get('/categories').set('Cookie', cookie || '');
    expect(categoriesRes.status).toBe(200);
    const categoriaId = categoriesRes.body.items && categoriesRes.body.items[0] ? categoriesRes.body.items[0].id : undefined;
    expect(categoriaId).toBeDefined();

    const res = await request
      .post('/reimbursements')
      .set('Cookie', cookie || '')
      .send({ categoriaId, descricao: '', valor: 10.0, dataDespesa: new Date().toISOString() });

    expect(res.status).toBe(400);
  });

  test('create with nonexistent categoria returns 400', async () => {
    const { cookie } = await loginAs('colaborador@exemplo.com', 'admin123');
    expect(cookie).toBeDefined();

    const nonexistentCategoriaId = '00000000-0000-0000-0000-000000000000';
    const res = await request
      .post('/reimbursements')
      .set('Cookie', cookie || '')
      .send({ categoriaId: nonexistentCategoriaId, descricao: 'Test', valor: 10.0, dataDespesa: new Date().toISOString() });

    expect(res.status).toBe(400);
  });

  test('create with valid data succeeds', async () => {
    const { cookie } = await loginAs('colaborador@exemplo.com', 'admin123');
    expect(cookie).toBeDefined();

    const categoriesRes = await request.get('/categories').set('Cookie', cookie || '');
    expect(categoriesRes.status).toBe(200);
    const categoriaId = categoriesRes.body.items && categoriesRes.body.items[0] ? categoriesRes.body.items[0].id : undefined;
    expect(categoriaId).toBeDefined();

    const res = await request
      .post('/reimbursements')
      .set('Cookie', cookie || '')
      .send({ categoriaId, descricao: 'Valid reimbursement', valor: 50.0, dataDespesa: new Date().toISOString() });

    expect([200, 201]).toContain(res.status);
    expect(res.body).toHaveProperty('id');
    expect(res.body.status).toBe('RASCUNHO');
  });
});
