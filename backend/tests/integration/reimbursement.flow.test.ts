/// <reference types="jest" />
import { request, loginAs } from '../helpers/app';
import { resetAndSeed } from '../helpers/prisma';

describe('Reimbursement flow', () => {
  beforeAll(async () => {
    await resetAndSeed();
  });

  test('colaborador can create a draft reimbursement and submit it', async () => {
    const { cookie } = await loginAs('colaborador@exemplo.com', 'admin123');
    expect(cookie).toBeDefined();

    // get a category id
    const categoriesRes = await request.get('/categories').set('Cookie', cookie || '');
    expect(categoriesRes.status).toBe(200);
    const categoriaId =
      categoriesRes.body.items && categoriesRes.body.items[0] ? categoriesRes.body.items[0].id : undefined;
    expect(categoriaId).toBeDefined();

    // create reimbursement (draft)
    const createRes = await request
      .post('/reimbursements')
      .set('Cookie', cookie || '')
      .send({ categoriaId, descricao: 'Teste rascunho', valor: 50.0, dataDespesa: new Date().toISOString() });

    expect([200,201]).toContain(createRes.status);
    const created = createRes.body;
    expect(created).toHaveProperty('id');
    expect(created.status).toBe('RASCUNHO');

    // submit
    const submitRes = await request.post(`/reimbursements/${created.id}/submit`).set('Cookie', cookie || '');
    expect(submitRes.status).toBe(200);
    expect(submitRes.body.status).toBe('ENVIADO');
  });
});
