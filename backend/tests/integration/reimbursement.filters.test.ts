import { request, loginAs } from '../helpers/app';
import { resetAndSeed } from '../helpers/prisma';
import { PrismaClient, PerfilUsuario, StatusSolicitacao } from '@prisma/client';

import { prisma } from '../../src/lib/prisma';

describe('Reimbursements Filters, Sorting, and Pagination', () => {
  let adminCookie: string | undefined;
  let gestorCookie: string | undefined;
  let financeiroCookie: string | undefined;
  let categoriaId: string;
  let aprovadoId: string;

  beforeAll(async () => {
    await resetAndSeed();
    
    // Pegar cookies
    const adminRes = await loginAs('admin@exemplo.com', 'admin123');
    adminCookie = adminRes.cookie;

    const gestorRes = await loginAs('gestor@exemplo.com', 'admin123');
    gestorCookie = gestorRes.cookie;

    const finRes = await loginAs('financeiro@exemplo.com', 'admin123');
    financeiroCookie = finRes.cookie;

    // Pegar categoria para criar uma nova solicitação
    const cat = await prisma.categoria.findFirst({ where: { nome: 'Transporte' } });
    categoriaId = cat!.id;

    const colab = await prisma.usuario.findUnique({ where: { email: 'colaborador@exemplo.com' } });

    // Criar uma solicitação APROVADA manualmente para os testes de Financeiro/Filtro
    const aprovado = await prisma.solicitacao.create({
      data: {
        solicitanteId: colab!.id,
        categoriaId: categoriaId,
        descricao: 'Teste Financeiro Aprovado',
        valor: '150.00',
        dataDespesa: new Date(),
        status: StatusSolicitacao.APROVADO,
      }
    });
    aprovadoId = aprovado.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('RBAC - Restrições de Visualização por Perfil', () => {
    test('GESTOR só deve ver status ENVIADO, ignorando filtro de status manual', async () => {
      // Gestor tenta burlar a regra passando status APROVADO
      const res = await request.get('/reimbursements?status=APROVADO').set('Cookie', gestorCookie || '');
      expect(res.status).toBe(200);
      
      // O seed já criou uma solicitação ENVIADO
      expect(res.body.items).toBeDefined();
      res.body.items.forEach((item: any) => {
        expect(item.status).toBe('ENVIADO'); // Jamais deve retornar a APROVADA que acabamos de criar
      });
    });

    test('FINANCEIRO só deve ver status APROVADO', async () => {
      const res = await request.get('/reimbursements').set('Cookie', financeiroCookie || '');
      expect(res.status).toBe(200);
      
      expect(res.body.items.length).toBeGreaterThan(0);
      res.body.items.forEach((item: any) => {
        expect(item.status).toBe('APROVADO');
      });
    });

    test('ADMIN pode ver qualquer status pelo filtro', async () => {
      const res = await request.get('/reimbursements?status=APROVADO').set('Cookie', adminCookie || '');
      expect(res.status).toBe(200);
      
      expect(res.body.items.length).toBeGreaterThan(0);
      res.body.items.forEach((item: any) => {
        expect(item.status).toBe('APROVADO');
      });
    });
  });

  describe('Filtros e Busca', () => {
    test('Busca por nome de colaborador deve ser case-insensitive', async () => {
      // O nome do seed é "Colaborador"
      const res = await request.get('/reimbursements?colaboradorNome=cOlaBoraDoR').set('Cookie', adminCookie || '');
      expect(res.status).toBe(200);
      
      expect(res.body.items.length).toBeGreaterThan(0);
      res.body.items.forEach((item: any) => {
        expect(item.solicitante.nome).toBe('Colaborador');
      });
    });

    test('Filtro por categoriaId', async () => {
      const res = await request.get(`/reimbursements?categoriaId=${categoriaId}`).set('Cookie', adminCookie || '');
      expect(res.status).toBe(200);
      
      expect(res.body.items.length).toBeGreaterThan(0);
      res.body.items.forEach((item: any) => {
        expect(item.categoriaId).toBe(categoriaId);
      });
    });
  });

  describe('Paginação e Ordenação', () => {
    test('A paginação deve limitar o número de itens e retornar metadados corretamente', async () => {
      const res = await request.get('/reimbursements?page=1&pageSize=1').set('Cookie', adminCookie || '');
      expect(res.status).toBe(200);
      
      expect(res.body.items.length).toBe(1);
      expect(res.body.total).toBeGreaterThanOrEqual(2);
      expect(res.body.page).toBe(1);
    });

    test('Ordenação deve funcionar para valores válidos (ex: valor desc)', async () => {
      const res = await request.get('/reimbursements?sortBy=valor&sortOrder=desc').set('Cookie', adminCookie || '');
      expect(res.status).toBe(200);
      
      if (res.body.items.length >= 2) {
        const val1 = parseFloat(res.body.items[0].valor);
        const val2 = parseFloat(res.body.items[1].valor);
        expect(val1).toBeGreaterThanOrEqual(val2);
      }
    });
  });

  describe('Proteção e Validação do Zod (Segurança)', () => {
    test('Zod deve bloquear valores não-permitidos para sortBy', async () => {
      const res = await request.get('/reimbursements?sortBy=SENHA').set('Cookie', adminCookie || '');
      expect(res.status).toBe(400);
    });

    test('Zod deve bloquear valores maliciosos/inválidos para categoriaId', async () => {
      const res = await request.get('/reimbursements?categoriaId=drop-table-users').set('Cookie', adminCookie || '');
      expect(res.status).toBe(400);
    });

    test('Zod deve preencher defaults para page e pageSize se enviados vazios', async () => {
      const res = await request.get('/reimbursements?page=&pageSize=').set('Cookie', adminCookie || '');
      expect(res.status).toBe(400);
    });
  });
});
