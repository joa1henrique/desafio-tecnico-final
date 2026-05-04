/// <reference types="jest" />
import { request, loginAs } from '../helpers/app';
import { resetAndSeed } from '../helpers/prisma';

describe('Reimbursement attachments', () => {
  beforeAll(async () => {
    await resetAndSeed();
  });

  test('can create attachment on reimbursement', async () => {
    const { cookie } = await loginAs('colaborador@exemplo.com', 'admin123');
    expect(cookie).toBeDefined();

    const categoriesRes = await request.get('/categories').set('Cookie', cookie || '');
    expect(categoriesRes.status).toBe(200);
    const categoriaId = categoriesRes.body.items && categoriesRes.body.items[0] ? categoriesRes.body.items[0].id : undefined;
    expect(categoriaId).toBeDefined();

    const createRes = await request
      .post('/reimbursements')
      .set('Cookie', cookie || '')
      .send({ categoriaId, descricao: 'With attachment', valor: 100.0, dataDespesa: new Date().toISOString() });

    expect([200, 201]).toContain(createRes.status);
    const created = createRes.body;
    expect(created).toHaveProperty('id');

    // Add attachment
    const attachmentRes = await request
      .post(`/reimbursements/${created.id}/attachments`)
      .set('Cookie', cookie || '')
      .send({
        nomeArquivo: 'receipt.pdf',
        urlArquivo: 'https://example.com/receipt.pdf',
        tipoArquivo: 'PDF',
      });

    expect(attachmentRes.status).toBe(201);
    expect(attachmentRes.body).toHaveProperty('id');
    expect(attachmentRes.body.nomeArquivo).toBe('receipt.pdf');
    expect(attachmentRes.body.tipoArquivo).toBe('PDF');
    expect(attachmentRes.body.solicitacaoId).toBe(created.id);
  });

  test('attachment with invalid file type returns 400', async () => {
    const { cookie } = await loginAs('colaborador@exemplo.com', 'admin123');

    const categoriesRes = await request.get('/categories').set('Cookie', cookie || '');
    const categoriaId = categoriesRes.body.items && categoriesRes.body.items[0] ? categoriesRes.body.items[0].id : undefined;

    const createRes = await request
      .post('/reimbursements')
      .set('Cookie', cookie || '')
      .send({ categoriaId, descricao: 'Invalid attachment', valor: 100.0, dataDespesa: new Date().toISOString() });

    expect([200, 201]).toContain(createRes.status);
    const created = createRes.body;

    // Try invalid file type
    const attachmentRes = await request
      .post(`/reimbursements/${created.id}/attachments`)
      .set('Cookie', cookie || '')
      .send({
        nomeArquivo: 'script.exe',
        urlArquivo: 'https://example.com/script.exe',
        tipoArquivo: 'EXE',
      });

    expect(attachmentRes.status).toBe(400);
  });

  test('can list attachments', async () => {
    const { cookie } = await loginAs('colaborador@exemplo.com', 'admin123');

    const categoriesRes = await request.get('/categories').set('Cookie', cookie || '');
    const categoriaId = categoriesRes.body.items && categoriesRes.body.items[0] ? categoriesRes.body.items[0].id : undefined;

    const createRes = await request
      .post('/reimbursements')
      .set('Cookie', cookie || '')
      .send({ categoriaId, descricao: 'Multiple attachments', valor: 100.0, dataDespesa: new Date().toISOString() });

    expect([200, 201]).toContain(createRes.status);
    const created = createRes.body;

    // Add first attachment
    const attach1 = await request
      .post(`/reimbursements/${created.id}/attachments`)
      .set('Cookie', cookie || '')
      .send({
        nomeArquivo: 'invoice.pdf',
        urlArquivo: 'https://example.com/invoice.pdf',
        tipoArquivo: 'PDF',
      });

    expect(attach1.status).toBe(201);

    // Add second attachment
    const attach2 = await request
      .post(`/reimbursements/${created.id}/attachments`)
      .set('Cookie', cookie || '')
      .send({
        nomeArquivo: 'photo.jpg',
        urlArquivo: 'https://example.com/photo.jpg',
        tipoArquivo: 'JPG',
      });

    expect(attach2.status).toBe(201);

    // List attachments
    const listRes = await request.get(`/reimbursements/${created.id}/attachments`).set('Cookie', cookie || '');
    expect(listRes.status).toBe(200);
    expect(Array.isArray(listRes.body)).toBe(true);
    expect(listRes.body.length).toBeGreaterThanOrEqual(2);

    // Verify structure
    listRes.body.forEach((att: any) => {
      expect(att).toHaveProperty('id');
      expect(att).toHaveProperty('nomeArquivo');
      expect(att).toHaveProperty('urlArquivo');
      expect(att).toHaveProperty('tipoArquivo');
      expect(att).toHaveProperty('criadoEm');
    });
  });

  test('attachment on nonexistent reimbursement returns 404', async () => {
    const { cookie } = await loginAs('colaborador@exemplo.com', 'admin123');

    const nonexistentUUID = '00000000-0000-0000-0000-000000000000';
    const attachmentRes = await request
      .post(`/reimbursements/${nonexistentUUID}/attachments`)
      .set('Cookie', cookie || '')
      .send({
        nomeArquivo: 'test.pdf',
        urlArquivo: 'https://example.com/test.pdf',
        tipoArquivo: 'PDF',
      });

    expect(attachmentRes.status).toBe(404);
  });

  test('attachment without authentication returns 401', async () => {
    const nonexistentUUID = '00000000-0000-0000-0000-000000000000';
    const attachmentRes = await request
      .post(`/reimbursements/${nonexistentUUID}/attachments`)
      .send({
        nomeArquivo: 'test.pdf',
        urlArquivo: 'https://example.com/test.pdf',
        tipoArquivo: 'PDF',
      });

    expect(attachmentRes.status).toBe(401);
  });
});
