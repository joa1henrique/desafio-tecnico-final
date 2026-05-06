/// <reference types="jest" />
import { request, loginAs } from '../helpers/app';
import { resetAndSeed } from '../helpers/prisma';

describe('Get Reimbursements Details', () => {
  beforeAll(async () => {
    await resetAndSeed();
  });

  test('list and get endpoints should populate solicitante and categoria', async () => {
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
      .send({ categoriaId, descricao: 'Teste listagem com joins', valor: 75.0, dataDespesa: new Date().toISOString() });

    expect([200, 201]).toContain(createRes.status);
    const createdId = createRes.body.id;

    // test list endpoint
    const listRes = await request.get('/reimbursements').set('Cookie', cookie || '');
    expect(listRes.status).toBe(200);
    
    // find the one we created
    const foundInList = listRes.body.items.find((r: any) => r.id === createdId);
    expect(foundInList).toBeDefined();

    // assert that solicitante and categoria relations are populated
    expect(foundInList).toHaveProperty('solicitante');
    expect(foundInList.solicitante).toHaveProperty('id');
    expect(foundInList.solicitante).toHaveProperty('nome');
    expect(foundInList.solicitante).toHaveProperty('email');
    expect(foundInList.solicitante.email).toBe('colaborador@exemplo.com');

    expect(foundInList).toHaveProperty('categoria');
    expect(foundInList.categoria).toHaveProperty('id');
    expect(foundInList.categoria).toHaveProperty('nome');

    // test detail endpoint
    const detailRes = await request.get(`/reimbursements/${createdId}`).set('Cookie', cookie || '');
    expect(detailRes.status).toBe(200);

    const detailedItem = detailRes.body;
    expect(detailedItem.id).toBe(createdId);

    // assert that solicitante and categoria relations are populated
    expect(detailedItem).toHaveProperty('solicitante');
    expect(detailedItem.solicitante).toHaveProperty('id');
    expect(detailedItem.solicitante).toHaveProperty('nome');
    expect(detailedItem.solicitante).toHaveProperty('email');
    expect(detailedItem.solicitante.email).toBe('colaborador@exemplo.com');

    expect(detailedItem).toHaveProperty('categoria');
    expect(detailedItem.categoria).toHaveProperty('id');
    expect(detailedItem.categoria).toHaveProperty('nome');
  });
});
