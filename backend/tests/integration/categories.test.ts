/// <reference types="jest" />
import { request, loginAs } from '../helpers/app';
import { resetAndSeed } from '../helpers/prisma';

describe('Categories routes', () => {
  beforeAll(async () => {
    await resetAndSeed();
  });

  test('anyone can list categories', async () => {
    const res = await request.get('/categories');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('items');
    expect(Array.isArray(res.body.items)).toBe(true);
    expect(res.body.total).toBeGreaterThanOrEqual(1);

    const nomes = res.body.items.map((category: any) => category.nome);
    expect(nomes.length).toBeGreaterThan(0);
  });

  test('admin can create a category', async () => {
    const { cookie } = await loginAs('admin@exemplo.com', 'admin123');
    expect(cookie).toBeDefined();

    const uniqueName = `Categoria ${Date.now()}`;
    const res = await request
      .post('/categories')
      .set('Cookie', cookie || '')
      .send({
        nome: uniqueName,
        ativo: true,
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.nome).toBe(uniqueName);
    expect(res.body.ativo).toBe(true);
  });

  test('creating a category with duplicate name returns 400', async () => {
    const { cookie } = await loginAs('admin@exemplo.com', 'admin123');
    expect(cookie).toBeDefined();

    const duplicateName = `Categoria Duplicada ${Date.now()}`;

    const firstRes = await request
      .post('/categories')
      .set('Cookie', cookie || '')
      .send({
        nome: duplicateName,
        ativo: true,
      });

    expect(firstRes.status).toBe(201);

    const secondRes = await request
      .post('/categories')
      .set('Cookie', cookie || '')
      .send({
        nome: duplicateName,
        ativo: true,
      });

    expect(secondRes.status).toBe(400);
  });

  test('non-admin cannot create category', async () => {
    const { cookie } = await loginAs('colaborador@exemplo.com', 'admin123');
    expect(cookie).toBeDefined();

    const res = await request
      .post('/categories')
      .set('Cookie', cookie || '')
      .send({
        nome: `Categoria Bloqueada ${Date.now()}`,
        ativo: true,
      });

    expect(res.status).toBe(403);
  });

  test('admin can update category', async () => {
    const { cookie } = await loginAs('admin@exemplo.com', 'admin123');
    expect(cookie).toBeDefined();

    const categoriesRes = await request.get('/categories');
    const categoria = categoriesRes.body.items && categoriesRes.body.items[0] ? categoriesRes.body.items[0] : undefined;
    expect(categoria).toBeDefined();

    const uniqueName = `Categoria Atualizada ${Date.now()}`;
    const res = await request
      .put(`/categories/${categoria.id}`)
      .set('Cookie', cookie || '')
      .send({
        nome: uniqueName,
        ativo: false,
      });

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(categoria.id);
    expect(res.body.nome).toBe(uniqueName);
    expect(res.body.ativo).toBe(false);
  });

  test('updating nonexistent category returns 404', async () => {
    const { cookie } = await loginAs('admin@exemplo.com', 'admin123');
    expect(cookie).toBeDefined();

    const nonexistentUUID = '00000000-0000-0000-0000-000000000000';
    const res = await request
      .put(`/categories/${nonexistentUUID}`)
      .set('Cookie', cookie || '')
      .send({
        nome: 'Nao existe',
        ativo: true,
      });

    expect(res.status).toBe(404);
  });
});
