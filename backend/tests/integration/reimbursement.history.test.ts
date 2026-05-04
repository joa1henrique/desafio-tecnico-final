/// <reference types="jest" />
import { request, loginAs } from '../helpers/app';
import { resetAndSeed } from '../helpers/prisma';

describe('Reimbursement history', () => {
  beforeAll(async () => {
    await resetAndSeed();
  });

  test('can list history of reimbursement (after creating and submitting)', async () => {
    // Colaborador creates, submits (generates history)
    const { cookie: colabCookie } = await loginAs('colaborador@exemplo.com', 'admin123');
    expect(colabCookie).toBeDefined();

    const categoriesRes = await request.get('/categories').set('Cookie', colabCookie || '');
    expect(categoriesRes.status).toBe(200);
    const categoriaId = categoriesRes.body.items && categoriesRes.body.items[0] ? categoriesRes.body.items[0].id : undefined;
    expect(categoriaId).toBeDefined();

    const createRes = await request
      .post('/reimbursements')
      .set('Cookie', colabCookie || '')
      .send({ categoriaId, descricao: 'For history', valor: 200.0, dataDespesa: new Date().toISOString() });

    expect([200, 201]).toContain(createRes.status);
    const created = createRes.body;
    expect(created).toHaveProperty('id');

    const submitRes = await request.post(`/reimbursements/${created.id}/submit`).set('Cookie', colabCookie || '');
    expect(submitRes.status).toBe(200);

    // List history
    const historyRes = await request.get(`/reimbursements/${created.id}/history`).set('Cookie', colabCookie || '');
    expect(historyRes.status).toBe(200);
    expect(Array.isArray(historyRes.body)).toBe(true);

    // Should have at least 2 records: CREATE and SUBMIT
    expect(historyRes.body.length).toBeGreaterThanOrEqual(2);

    // Verify structure
    historyRes.body.forEach((record: any) => {
      expect(record).toHaveProperty('id');
      expect(record).toHaveProperty('solicitacaoId', created.id);
      expect(record).toHaveProperty('usuarioId');
      expect(record).toHaveProperty('acao');
      expect(record).toHaveProperty('observacao');
      expect(record).toHaveProperty('criadoEm');
    });
  });

  test('can list complete workflow in history (create -> submit -> approve)', async () => {
    // Full workflow: create -> submit -> approve
    const { cookie: colabCookie } = await loginAs('colaborador@exemplo.com', 'admin123');
    const { cookie: gestorCookie } = await loginAs('gestor@exemplo.com', 'admin123');

    const categoriesRes = await request.get('/categories').set('Cookie', colabCookie || '');
    const categoriaId = categoriesRes.body.items && categoriesRes.body.items[0] ? categoriesRes.body.items[0].id : undefined;

    const createRes = await request
      .post('/reimbursements')
      .set('Cookie', colabCookie || '')
      .send({ categoriaId, descricao: 'For full history', valor: 250.0, dataDespesa: new Date().toISOString() });

    const created = createRes.body;

    const submitRes = await request.post(`/reimbursements/${created.id}/submit`).set('Cookie', colabCookie || '');
    expect(submitRes.status).toBe(200);

    const approveRes = await request.post(`/reimbursements/${created.id}/approve`).set('Cookie', gestorCookie || '');
    expect(approveRes.status).toBe(200);

    // List history after multiple actions
    const historyRes = await request.get(`/reimbursements/${created.id}/history`).set('Cookie', colabCookie || '');
    expect(historyRes.status).toBe(200);
    expect(Array.isArray(historyRes.body)).toBe(true);

    // Should have at least 3 records: CREATE, SUBMIT, APPROVE
    expect(historyRes.body.length).toBeGreaterThanOrEqual(3);

    // Verify actions exist
    const acoes = historyRes.body.map((h: any) => h.acao);
    expect(acoes).toContain('CRIADO');
    expect(acoes).toContain('ENVIADO');
    expect(acoes).toContain('APROVADO');
  });

  test('history nonexistent reimbursement returns 404', async () => {
    const { cookie: colabCookie } = await loginAs('colaborador@exemplo.com', 'admin123');
    expect(colabCookie).toBeDefined();

    const nonexistentUUID = '00000000-0000-0000-0000-000000000000';
    const historyRes = await request.get(`/reimbursements/${nonexistentUUID}/history`).set('Cookie', colabCookie || '');
    expect(historyRes.status).toBe(404);
  });

  test('history without authentication returns 401', async () => {
    const nonexistentUUID = '00000000-0000-0000-0000-000000000000';
    const historyRes = await request.get(`/reimbursements/${nonexistentUUID}/history`);
    expect(historyRes.status).toBe(401);
  });
});
