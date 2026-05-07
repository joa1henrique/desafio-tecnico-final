import 'dotenv/config'
import { PerfilUsuario, StatusSolicitacao } from '@prisma/client'
import { hash } from 'bcryptjs'
import { prisma } from '../src/lib/prisma'

async function main() {
  console.log('Limpando banco de dados...')
  await prisma.anexo.deleteMany()
  await prisma.historicoSolicitacao.deleteMany()
  await prisma.solicitacao.deleteMany()
  await prisma.categoria.deleteMany()
  await prisma.usuario.deleteMany()

  const passwordHash = await hash('admin123', 8)

  console.log('Criando categorias...')
  const transporte = await prisma.categoria.create({ data: { nome: 'Transporte' } })
  const alimentacao = await prisma.categoria.create({ data: { nome: 'Alimentação' } })
  const hospedagem = await prisma.categoria.create({ data: { nome: 'Hospedagem' } })
  const outros = await prisma.categoria.create({ data: { nome: 'Outros' } })
  
  const categorias = [transporte, alimentacao, hospedagem, outros]

  console.log('Criando usuários base...')
  const admin = await prisma.usuario.create({
    data: { nome: 'Admin', email: 'admin@exemplo.com', senha: passwordHash, perfil: PerfilUsuario.ADMIN },
  })
  const gestor = await prisma.usuario.create({
    data: { nome: 'Gestor', email: 'gestor@exemplo.com', senha: passwordHash, perfil: PerfilUsuario.GESTOR },
  })
  const colab1 = await prisma.usuario.create({
    data: { nome: 'Colaborador 1', email: 'colaborador@exemplo.com', senha: passwordHash, perfil: PerfilUsuario.COLABORADOR },
  })

  console.log('Adicionando novos colaboradores...')
  const colab2 = await prisma.usuario.create({
    data: { nome: 'Colaborador 2', email: 'colaborador2@email.com', senha: passwordHash, perfil: PerfilUsuario.COLABORADOR },
  })
  const colab3 = await prisma.usuario.create({
    data: { nome: 'Colaborador 3', email: 'colaborador3@email.com', senha: passwordHash, perfil: PerfilUsuario.COLABORADOR },
  })

  const usuarios = [colab1, colab2, colab3]

  console.log('Criando 25 solicitações...')
  
  const today = new Date()
  const tomorrow = new Date()
  tomorrow.setDate(today.getDate() + 1)
  const afterTomorrow = new Date()
  afterTomorrow.setDate(today.getDate() + 2)

  const dates = [today, tomorrow, afterTomorrow]
  const statuses = [StatusSolicitacao.ENVIADO, StatusSolicitacao.APROVADO, StatusSolicitacao.REJEITADO, StatusSolicitacao.PAGO]

  for (let i = 1; i <= 25; i++) {
    const userIndex = i % usuarios.length
    const dateIndex = i % dates.length
    const statusIndex = i % statuses.length
    const catIndex = i % categorias.length

    await prisma.solicitacao.create({
      data: {
        descricao: `Solicitação de Reembolso #${i.toString().padStart(2, '0')}`,
        valor: (Math.random() * 500 + 50).toFixed(2),
        status: statuses[statusIndex],
        dataDespesa: dates[dateIndex],
        solicitanteId: usuarios[userIndex].id,
        categoriaId: categorias[catIndex].id,
      },
    })
  }

  console.log('Seed finalizado com sucesso!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
