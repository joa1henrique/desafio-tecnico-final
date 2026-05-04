import supertest from 'supertest';
import app from '../../src/app';

export const request = supertest(app);

export async function loginAs(email: string, senha: string) {
  const res = await request.post('/auth/login').send({ email, senha });
  const cookie = res.headers['set-cookie'] ? res.headers['set-cookie'][0] : undefined;
  return { res, cookie };
}
