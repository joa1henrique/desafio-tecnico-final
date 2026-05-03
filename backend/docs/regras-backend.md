# Regras do backend

## Validacoes obrigatorias

- valor deve ser maior que zero
- dataDespesa e obrigatoria
- categoriaId deve ser valido
- status deve ser valido
- justificativaRejeicao e obrigatoria ao rejeitar
- usuario autenticado e obrigatorio para rotas privadas
- permissao adequada deve ser validada em cada acao
- anexos devem ter tipo de arquivo permitido
  - tipos permitidos: PDF, JPG, PNG
- transicoes invalidas de status devem ser bloqueadas
- email deve ter formato valido
- senha nao deve ser salva em texto puro
- ids inexistentes devem retornar 404

## Transicoes de status

Origem | Destino | Acao | Quem pode fazer
RASCUNHO | ENVIADO | Enviar para analise | COLABORADOR dono
ENVIADO | APROVADO | Aprovar | GESTOR
ENVIADO | REJEITADO | Rejeitar com justificativa | GESTOR
APROVADO | PAGO | Marcar como pago | FINANCEIRO
RASCUNHO | CANCELADO | Cancelar | COLABORADOR dono
ENVIADO | CANCELADO | Cancelar, se permitido pela regra implementada | COLABORADOR dono

## Tratamento de erros

Cenario | Status HTTP esperado | Exemplo
Campos invalidos | 400 Bad Request | Valor menor ou igual a zero, data vazia, categoria invalida, justificativa ausente
Usuario nao autenticado | 401 Unauthorized | Token JWT ausente, invalido ou expirado
Usuario sem permissao | 403 Forbidden | Colaborador tentando aprovar, gestor tentando pagar ou financeiro tentando rejeitar
Recurso nao encontrado | 404 Not Found | Solicitacao, usuario, categoria ou anexo inexistente
Transicao de status invalida | 400 Bad Request | Tentar pagar uma solicitacao ENVIADA ou rejeitar uma solicitacao PAGA
Erro inesperado | 500 Internal Server Error | Erro nao tratado no servidor

Formato sugerido de resposta de erro:
{
  "message": "Categoria nao encontrada ou inativa",
  "statusCode": 400,
  "error": "Bad Request"
}

## Funcionalidades obrigatorias do backend

- API RESTful com Node.js, Express.js e TypeScript
- Login com JWT
- Cadastro de usuario
- Middleware de autenticacao
- Middleware de permissao por perfil
- Validacao de body, params e query params com Zod
- CRUD de categorias
- CRUD de solicitacoes de reembolso
- Modelagem com Prisma
- Manipulacao de datas com DayJS ou Intl
- Upload/listagem simples de anexos, podendo ser simulado
- Envio da solicitacao
- Aprovacao de solicitacao
- Rejeicao com justificativa
- Marcacao como pago
- Listagem do historico da solicitacao
- Tratamento adequado de erros HTTP
- Testes de integracao com Jest e Supertest para rotas principais

## Seeds padrao

- admin@exemplo.com (ADMIN)
- gestor@exemplo.com (GESTOR)
- financeiro@exemplo.com (FINANCEIRO)
- colaborador@exemplo.com (COLABORADOR)

Senha inicial para todos: admin123

## Comportamento esperado no frontend

- Exibir mensagens de erro de forma visual e clara para o usuario
- Destacar campos invalidos nos formularios
- Exibir mensagens de sucesso apos acoes concluidas
- Impedir acoes nao permitidas na interface quando possivel
- Tratar estados de carregamento, erro e lista vazia
- Nao deixar erros tecnicos aparecerem de forma crua para o usuario final
- Redirecionar para login quando o token estiver ausente ou expirado
