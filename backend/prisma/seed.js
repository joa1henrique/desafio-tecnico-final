const {
  PrismaClient,
  PerfilUsuario,
  StatusSolicitacao,
  AcaoSolicitacao,
} = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");

require("dotenv").config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash("admin123", 10);

  const admin = await prisma.usuario.upsert({
    where: { email: "admin@exemplo.com" },
    update: {},
    create: {
      nome: "Admin",
      email: "admin@exemplo.com",
      senha: passwordHash,
      perfil: PerfilUsuario.ADMIN,
    },
  });

  const gestor = await prisma.usuario.upsert({
    where: { email: "gestor@exemplo.com" },
    update: {},
    create: {
      nome: "Gestor",
      email: "gestor@exemplo.com",
      senha: passwordHash,
      perfil: PerfilUsuario.GESTOR,
    },
  });

  const financeiro = await prisma.usuario.upsert({
    where: { email: "financeiro@exemplo.com" },
    update: {},
    create: {
      nome: "Financeiro",
      email: "financeiro@exemplo.com",
      senha: passwordHash,
      perfil: PerfilUsuario.FINANCEIRO,
    },
  });

  const colaborador = await prisma.usuario.upsert({
    where: { email: "colaborador@exemplo.com" },
    update: {},
    create: {
      nome: "Colaborador",
      email: "colaborador@exemplo.com",
      senha: passwordHash,
      perfil: PerfilUsuario.COLABORADOR,
    },
  });

  const categories = [
    "Transporte",
    "Alimentacao",
    "Hospedagem",
    "Material",
    "Outros",
  ];

  for (const nome of categories) {
    await prisma.categoria.upsert({
      where: { nome },
      update: {},
      create: { nome },
    });
  }

  const categoria = await prisma.categoria.findFirst({
    where: { nome: "Transporte" },
  });

  if (!categoria) {
    throw new Error("Categoria de seed nao encontrada");
  }

  const existingDraft = await prisma.solicitacao.findFirst({
    where: {
      solicitanteId: colaborador.id,
      descricao: "Taxi aeroporto",
    },
  });

  if (!existingDraft) {
    const draft = await prisma.solicitacao.create({
      data: {
        solicitanteId: colaborador.id,
        categoriaId: categoria.id,
        descricao: "Taxi aeroporto",
        valor: "85.90",
        dataDespesa: new Date(),
        status: StatusSolicitacao.RASCUNHO,
      },
    });

    await prisma.historicoSolicitacao.create({
      data: {
        solicitacaoId: draft.id,
        usuarioId: colaborador.id,
        acao: AcaoSolicitacao.CRIADO,
        observacao: "Solicitacao criada",
      },
    });
  }

  const existingSent = await prisma.solicitacao.findFirst({
    where: {
      solicitanteId: colaborador.id,
      descricao: "Hospedagem congresso",
    },
  });

  if (!existingSent) {
    const sent = await prisma.solicitacao.create({
      data: {
        solicitanteId: colaborador.id,
        categoriaId: categoria.id,
        descricao: "Hospedagem congresso",
        valor: "420.00",
        dataDespesa: new Date(),
        status: StatusSolicitacao.ENVIADO,
      },
    });

    await prisma.historicoSolicitacao.createMany({
      data: [
        {
          solicitacaoId: sent.id,
          usuarioId: colaborador.id,
          acao: AcaoSolicitacao.CRIADO,
          observacao: "Solicitacao criada",
        },
        {
          solicitacaoId: sent.id,
          usuarioId: colaborador.id,
          acao: AcaoSolicitacao.ENVIADO,
          observacao: "Solicitacao enviada para analise",
        },
      ],
    });

    await prisma.anexo.create({
      data: {
        solicitacaoId: sent.id,
        nomeArquivo: "recibo-hotel.pdf",
        urlArquivo: "https://exemplo.com/recibo-hotel.pdf",
        tipoArquivo: "PDF",
      },
    });
  }

  void admin;
  void gestor;
  void financeiro;
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
