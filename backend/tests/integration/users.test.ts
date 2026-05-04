/// <reference types="jest" />
import { request, loginAs } from '../helpers/app';
import { resetAndSeed } from '../helpers/prisma';

describe('Users routes', () => {
  beforeAll(async () => {
    await resetAndSeed();
  });

  test('admin can list users', async () => {
    const { cookie } = await loginAs('admin@exemplo.com', 'admin123');
    expect(cookie).toBeDefined();

    const res = await request.get('/users').set('Cookie', cookie || '');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('items');
    expect(Array.isArray(res.body.items)).toBe(true);
    expect(res.body.total).toBeGreaterThanOrEqual(4);

    const emails = res.body.items.map((user: any) => user.email);
    expect(emails).toContain('admin@exemplo.com');
    expect(emails).toContain('colaborador@exemplo.com');
  });

  test('admin can create a new user', async () => {
    const { cookie } = await loginAs('admin@exemplo.com', 'admin123');
    expect(cookie).toBeDefined();

    const uniqueEmail = `user-${Date.now()}@exemplo.com`;
    const res = await request
      .post('/users')
      .set('Cookie', cookie || '')
      .send({
        nome: 'Novo Usuario',
        email: uniqueEmail,
        senha: 'senha123',
        perfil: 'COLABORADOR',
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.email).toBe(uniqueEmail);
    expect(res.body.nome).toBe('Novo Usuario');
    expect(res.body.perfil).toBe('COLABORADOR');
    expect(res.body).not.toHaveProperty('senha');
  });

  test('creating a user with existing email returns 400', async () => {
    const { cookie } = await loginAs('admin@exemplo.com', 'admin123');
    expect(cookie).toBeDefined();

    const res = await request
      .post('/users')
      .set('Cookie', cookie || '')
      .send({
        nome: 'Duplicado',
        email: 'colaborador@exemplo.com',
        senha: 'senha123',
        perfil: 'COLABORADOR',
      });

    expect(res.status).toBe(400);
  });

  test('non-admin cannot list users', async () => {
    const { cookie } = await loginAs('colaborador@exemplo.com', 'admin123');
    expect(cookie).toBeDefined();

    const res = await request.get('/users').set('Cookie', cookie || '');
    expect(res.status).toBe(403);
  });
});
