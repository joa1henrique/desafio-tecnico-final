/// <reference types="jest" />
import { request, loginAs } from '../helpers/app';
import { resetAndSeed } from '../helpers/prisma';

describe('Auth routes', () => {
  beforeAll(async () => {
    await resetAndSeed();
  });

  test('POST /auth/login should authenticate seeded admin', async () => {
    const { res, cookie } = await loginAs('admin@exemplo.com', 'admin123');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('user');
    expect(cookie).toBeDefined();
  });

  test('POST /auth/login with wrong password returns 401', async () => {
    const res = await request.post('/auth/login').send({ email: 'admin@exemplo.com', senha: 'wrong' });
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('message');
  });
});
