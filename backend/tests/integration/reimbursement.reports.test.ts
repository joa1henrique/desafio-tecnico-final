/// <reference types="jest" />
import { request, loginAs } from '../helpers/app';
import { resetAndSeed } from '../helpers/prisma';
import { prisma } from '../../src/lib/prisma';
import { StatusSolicitacao } from '@prisma/client';

describe('Financial Reports (GET /reimbursements/reports)', () => {
  let adminCookie: string | undefined;
  let gestorCookie: string | undefined;
  let colaboradorCookie: string | undefined;
  let categoriaId: string;

  beforeAll(async () => {
    await resetAndSeed();

    const adminRes = await loginAs('admin@exemplo.com', 'admin123');
    adminCookie = adminRes.cookie;

    const gestorRes = await loginAs('gestor@exemplo.com', 'admin123');
    gestorCookie = gestorRes.cookie;

    const colabRes = await loginAs('colaborador@exemplo.com', 'admin123');
    colaboradorCookie = colabRes.cookie;

    // Pegar categoria
    const cat = await prisma.categoria.findFirst({ where: { nome: 'Transporte' } });
    categoriaId = cat!.id;

    const colab = await prisma.usuario.findUnique({ where: { email: 'colaborador@exemplo.com' } });

    // Criar solicitação PAGA
    await prisma.solicitacao.create({
      data: {
        solicitanteId: colab!.id,
        categoriaId: categoriaId,
        descricao: 'Teste Pago',
        valor: '250.00',
        dataDespesa: new Date(),
        status: StatusSolicitacao.PAGO,
      },
    });

    // Criar solicitação APROVADA (a pagar)
    await prisma.solicitacao.create({
      data: {
        solicitanteId: colab!.id,
        categoriaId: categoriaId,
        descricao: 'Teste Aprovado',
        valor: '100.00',
        dataDespesa: new Date(),
        status: StatusSolicitacao.APROVADO,
      },
    });
  });

  describe('Controle de Acesso (RBAC)', () => {
    test('ADMIN deve conseguir acessar o relatório (200)', async () => {
      const res = await request.get('/reimbursements/reports').set('Cookie', adminCookie || '');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('pagos');
      expect(res.body).toHaveProperty('aPagar');
      expect(res.body.pagos).toHaveProperty('total');
      expect(res.body.pagos).toHaveProperty('count');
      expect(res.body.aPagar).toHaveProperty('total');
      expect(res.body.aPagar).toHaveProperty('count');
    });

    test('GESTOR não deve acessar o relatório (403)', async () => {
      const res = await request.get('/reimbursements/reports').set('Cookie', gestorCookie || '');
      expect(res.status).toBe(403);
    });

    test('COLABORADOR não deve acessar o relatório (403)', async () => {
      const res = await request.get('/reimbursements/reports').set('Cookie', colaboradorCookie || '');
      expect(res.status).toBe(403);
    });

    test('Sem autenticação deve retornar 401', async () => {
      const res = await request.get('/reimbursements/reports');
      expect(res.status).toBe(401);
    });
  });

  describe('Dados do Relatório', () => {
    test('Deve retornar totais corretos de pagos e a pagar', async () => {
      const res = await request.get('/reimbursements/reports').set('Cookie', adminCookie || '');
      expect(res.status).toBe(200);

      expect(parseFloat(res.body.pagos.total)).toBeGreaterThanOrEqual(250);
      expect(res.body.pagos.count).toBeGreaterThanOrEqual(1);
      expect(parseFloat(res.body.aPagar.total)).toBeGreaterThanOrEqual(100);
      expect(res.body.aPagar.count).toBeGreaterThanOrEqual(1);
    });

    test('Filtro por categoriaId deve funcionar', async () => {
      const res = await request
        .get(`/reimbursements/reports?categoriaId=${categoriaId}`)
        .set('Cookie', adminCookie || '');
      expect(res.status).toBe(200);
      expect(res.body.pagos.count).toBeGreaterThanOrEqual(1);
    });

    test('Filtro por intervalo de datas deve funcionar', async () => {
      const hoje = new Date().toISOString();
      const res = await request
        .get(`/reimbursements/reports?dataInicio=${hoje}&dataFim=${hoje}`)
        .set('Cookie', adminCookie || '');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('pagos');
      expect(res.body).toHaveProperty('aPagar');
    });
  });

  describe('Validação do Zod (Segurança)', () => {
    test('categoriaId inválida deve retornar 400', async () => {
      const res = await request
        .get('/reimbursements/reports?categoriaId=not-a-uuid')
        .set('Cookie', adminCookie || '');
      expect(res.status).toBe(400);
    });

    test('dataInicio com formato inválido deve retornar 400', async () => {
      const res = await request
        .get('/reimbursements/reports?dataInicio=abc-invalid')
        .set('Cookie', adminCookie || '');
      expect(res.status).toBe(400);
    });
  });
});
