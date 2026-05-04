# Descricao dos Testes de Integracao

Este diretório contém testes de integração para as rotas principais do backend. Cada arquivo testa um aspecto específico da API.

## Arquivos de Teste

### auth.test.ts
Testes de autenticação (rotas de login)

- ✅ Login com credenciais válidas → 200, retorna cookie JWT
- ✅ Login com senha incorreta → 401

**Cobertura:** Validação de credenciais, geração de token JWT, cookie httpOnly

---

### reimbursement.create.test.ts
Testes de validação ao criar solicitações de reembolso

- ✅ Criar sem autenticação → 401
- ✅ Criar com valor = 0 → 400
- ✅ Criar com valor negativo → 400
- ✅ Criar sem dataDespesa → 400
- ✅ Criar sem descricao → 400
- ✅ Criar com categoria inexistente → 400
- ✅ Criar com dados válidos → 200/201, status RASCUNHO

**Cobertura:** Validação de regras de negócio (valor > 0, data obrigatória, categoria válida), permissões (401 sem auth)

---

### reimbursement.flow.test.ts
Testes de fluxo completo de solicitação

- ✅ Colaborador cria solicitação em RASCUNHO
- ✅ Colaborador submete solicitação → muda para ENVIADO

**Cobertura:** Fluxo happy path básico (RASCUNHO → ENVIADO), geração de histórico

---

### reimbursement.cancel.test.ts
Testes de cancelamento de solicitações

- ✅ Colaborador cancela solicitação em RASCUNHO → 200, status CANCELADO
- ✅ Colaborador cancela solicitação em ENVIADO → 200, status CANCELADO
- ✅ Outro usuário tenta cancelar solicitação → 403 Forbidden
- ✅ Tentar cancelar solicitação PAGA (transição inválida) → 400
- ✅ Cancelar solicitação inexistente → 404

**Cobertura:** Validação de ownership, transições de status, tratamento de não-encontrado

---

### reimbursement.approve.test.ts
Testes de aprovação de solicitações

- ✅ Gestor aprova solicitação enviada → 200, status APROVADO
- ✅ Colaborador tenta aprovar → 403 Forbidden
- ✅ Aprovar solicitação em status inválido → 400
- ✅ Aprovar solicitação inexistente → 404

**Cobertura:** Permissão por perfil, validação de status e tratamento de not found

---

### reimbursement.reject.test.ts
Testes de rejeição de solicitações

- ✅ Gestor rejeita solicitação enviada com justificativa → 200, status REJEITADO
- ✅ Rejeitar sem justificativa → 400
- ✅ Colaborador tenta rejeitar → 403 Forbidden
- ✅ Rejeitar solicitação em status inválido → 400
- ✅ Rejeitar solicitação inexistente → 404

**Cobertura:** Regra de justificativa obrigatória, permissões e validação de status

---

### reimbursement.pay.test.ts
Testes de marcação de pagamento

- ✅ Financeiro marca solicitação aprovada como paga → 200, status PAGO
- ✅ Gestor tenta pagar → 403 Forbidden
- ✅ Pagar solicitação em status inválido → 400
- ✅ Pagar solicitação inexistente → 404

**Cobertura:** Fluxo de pagamento, permissão por perfil e transição de status

---

### reimbursement.history.test.ts
Testes de listagem de histórico da solicitação

- ✅ Listar histórico da própria solicitação → 200
- ✅ Validar ações registradas no fluxo → CREATE, SUBMIT, APPROVE
- ✅ Histórico de solicitação inexistente → 404
- ✅ Sem autenticação → 401

**Cobertura:** Registro e leitura do histórico, integração do fluxo completo

---

### reimbursement.attachments.test.ts
Testes de anexos da solicitação

- ✅ Criar anexo em solicitação → 201
- ✅ Criar anexo com tipo inválido → 400
- ✅ Listar anexos da solicitação → 200
- ✅ Anexar em solicitação inexistente → 404
- ✅ Sem autenticação → 401

**Cobertura:** Upload/listagem simples de anexos, validação de tipo e autenticação

---

### users.test.ts
Testes de usuários, restritos a ADMIN

- ✅ Admin lista usuários → 200
- ✅ Admin cria usuário → 201
- ✅ Email duplicado ao criar usuário → 400
- ✅ Não-admin tenta listar usuários → 403

**Cobertura:** CRUD básico de usuários, criação com senha hash, controle de acesso por perfil

---

### categories.test.ts
Testes de categorias, com leitura pública e escrita restrita a ADMIN

- ✅ Listar categorias sem autenticação → 200
- ✅ Admin cria categoria → 201
- ✅ Categoria com nome duplicado → 400
- ✅ Não-admin tenta criar categoria → 403
- ✅ Admin atualiza categoria → 200
- ✅ Atualizar categoria inexistente → 404

**Cobertura:** Listagem pública, criação e edição por ADMIN, validação de duplicidade e not found

---

### permissions.test.ts
Testes de validação de permissões por perfil

- ✅ Colaborador não pode criar usuário (403)
- ✅ Gestor não pode listar usuários (403)
- ✅ Usuário não-autenticado pode listar categorias (200)
- ✅ Financeiro não pode criar categoria (403)
- ✅ Gestor não pode criar reimbursement (403)
- ✅ Colaborador não pode aprovar reimbursement (403)
- ✅ Gestor não pode pagar reimbursement (403)
- ✅ Financeiro não pode rejeitar reimbursement (403)
- ✅ Usuário não-autenticado recebe 401 em rotas protegidas

**Cobertura:** Validação de permissões por perfil (ADMIN, GESTOR, FINANCEIRO, COLABORADOR), transições de status e regras de negócio

---

## Status Final

✅ **Todos os testes implementados e passando:** 56 testes em 12 suites de integração.

## Rodando os Testes

```bash
# Rodar todos os testes de integração
npm test

# Rodar arquivo específico
npm test -- reimbursement.cancel.test.ts

# Rodar com detectOpenHandles (diagnóstico)
npm test -- --detectOpenHandles --forceExit
```

## Estrutura de um Teste

Cada teste segue este padrão:

1. **Setup:** `beforeAll()` reseta e seedeia o banco
2. **Autenticação:** `loginAs()` faz login como um perfil específico
3. **Request:** chama o endpoint via `request`
4. **Assertions:** valida status HTTP, response shape, dados

Exemplo:
```typescript
test('exemplo', async () => {
  const { cookie } = await loginAs('colaborador@exemplo.com', 'admin123');
  const res = await request.post('/endpoint').set('Cookie', cookie);
  expect(res.status).toBe(200);
  expect(res.body).toHaveProperty('id');
});
```

## Usuários de Seed

Todos os testes usam estes usuários pré-criados (senha: `admin123`):

- `admin@exemplo.com` (ADMIN)
- `gestor@exemplo.com` (GESTOR)
- `financeiro@exemplo.com` (FINANCEIRO)
- `colaborador@exemplo.com` (COLABORADOR)
