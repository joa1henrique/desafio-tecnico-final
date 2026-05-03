# Escopo do sistema

Objetivo: aplicar um fluxo de solicitacoes de reembolso com aprovacao e pagamento.

## Fluxo principal

1. Solicitacao
- Colaborador cria solicitacao com categoria, descricao, valor, data da despesa e anexos quando necessario.
2. Analise
- Gestor aprova ou rejeita. Rejeicao exige justificativa.
3. Pagamento
- Financeiro marca solicitacoes aprovadas como pagas. Pagas nao podem ser alteradas.

## Perfis e permissoes

- COLABORADOR
  - Cria solicitacoes, edita solicitacoes proprias quando permitido e visualiza apenas as proprias.
  - Nao pode aprovar, rejeitar, pagar ou ver solicitacoes de outros colaboradores.
- GESTOR
  - Visualiza solicitacoes enviadas, aprova e rejeita com justificativa.
  - Nao pode marcar como paga.
- FINANCEIRO
  - Visualiza solicitacoes aprovadas e marca como paga.
  - Nao pode aprovar, rejeitar ou editar solicitacoes.
- ADMIN
  - Gerencia usuarios e categorias e pode visualizar dados gerais do sistema.
  - Nao substitui automaticamente o papel operacional de gestor/financeiro.

## Entidades

- Usuario
  - id, nome, email, senha, perfil, criadoEm, atualizadoEm
- Categoria
  - id, nome, ativo, criadoEm, atualizadoEm
- Solicitacao
  - id, solicitanteId, categoriaId, descricao, valor, dataDespesa, status, justificativaRejeicao, criadoEm, atualizadoEm
- Anexo
  - id, solicitacaoId, nomeArquivo, urlArquivo, tipoArquivo, criadoEm
- Historico da Solicitacao
  - id, solicitacaoId, usuarioId, acao, observacao, criadoEm

## Status possiveis da solicitacao

- RASCUNHO
- ENVIADO
- APROVADO
- REJEITADO
- PAGO
- CANCELADO

## Historico

Toda acao relevante deve gerar um registro de historico com:
- quem fez
- qual acao foi realizada
- quando ocorreu
- observacao
