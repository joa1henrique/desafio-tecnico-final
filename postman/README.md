# Documentação da API - Postman Collection

Esta pasta contém a coleção de requisições do Postman para facilitar o teste e a integração com a API do Sistema de Reembolsos.

## Como Importar

1. Abra o **Postman**.
2. Clique no botão **Import** (ou use `Ctrl + O`).
3. Arraste e solte o arquivo `reimbursements-api.postman_collection.json` nesta pasta.
4. Clique em **Import**.

## Fluxo de Autenticação

A coleção já está configurada com variáveis e scripts automáticos:

1. **Login:** Vá na pasta `Auth` e execute a requisição `Login`.
   - As credenciais padrão são: `admin@exemplo.com` / `admin123`.
   - Ao executar o login com sucesso, o **token** será salvo automaticamente nas variáveis da coleção.
2. **Uso do Token:** Todas as outras requisições já estão configuradas para usar esse token via `Bearer Token`. Você não precisa colar o token manualmente em cada uma.

## Organização das Pastas

- **Auth:** Login, Logout e Verificação de Permissões.
- **Reembolsos:** Listagem, Criação, Fluxo de Aprovação (Aprovar, Rejeitar, Pagar) e Histórico.
- **Categorias:** Listagem e Criação de categorias.
- **Usuários:** Listagem e Criação de novos usuários (Apenas Admin).
- **Relatórios:** Relatório financeiro por período (Apenas Admin).

## Dicas de Uso

### Uso de IDs dinâmicos
Requisições que precisam de um ID específico (como **Detalhes**, **Aprovar**, **Pagar**, etc.) usam uma variável de caminho (Path Variable) chamada `:id`.
1. Execute a requisição **Listar Reembolsos**.
2. Copie o `id` (UUID) do reembolso desejado.
3. Na requisição que deseja testar, vá na aba **Params** e, na seção **Path Variables**, cole o ID na coluna **Value** da chave `id`.

### Teste de Diferentes Perfis
Para testar o comportamento da API com diferentes níveis de acesso (RBAC), altere o e-mail na requisição de Login:
- **Admin:** `admin@exemplo.com`
- **Gestor:** `gestor@exemplo.com`
- **Financeiro:** `financeiro@exemplo.com`
- **Colaborador:** `colaborador@exemplo.com`
*(A senha padrão para todos os usuários do seed é `admin123`)*

---
*Nota: Certifique-se de que o backend está rodando localmente em `http://localhost:3000`.*
