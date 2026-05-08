# Backend - Sistema de Reembolsos

Este é o servidor do Sistema de Gestão de Reembolsos Financeiros, construído com Node.js, Express e TypeScript. O sistema gerencia o ciclo de vida de solicitações de reembolso, garantindo integridade via máquina de estados e segurança baseada em perfis de usuário.

## Tecnologias Utilizadas

- **Node.js & TypeScript**: Ambiente de execução e linguagem com tipagem estática.
- **Express**: Framework web para criação de rotas e middlewares.
- **Prisma ORM**: Gerenciamento do banco de dados PostgreSQL.
- **JWT (JSON Web Token)**: Autenticação stateless de usuários.
- **Bcryptjs**: Criptografia de senhas para armazenamento seguro.
- **Zod**: Validação de esquemas e dados de entrada (Runtime Type Safety).
- **Jest & Supertest**: Testes automatizados de integração.

## Arquitetura e Organização

O projeto segue uma estrutura baseada em camadas para separação de responsabilidades:

- `/src/controllers`: Gerenciamento das requisições HTTP e respostas.
- `/src/services`: Camada de lógica de negócio centralizada.
- `/src/middlewares`: Filtros globais (Autenticação, Tratamento de Erros, Validação Zod, Controle de Acesso).
- `/src/validators`: Definição de regras de validação para cada entidade.
- `/src/utils`: Utilitários e a lógica da **Máquina de Estados**.
- `/prisma`: Esquemas do banco de dados e scripts de semente (seed).

## Segurança e Regras de Negócio

### Controle de Acesso (RBAC)
O sistema utiliza quatro perfis de usuário com permissões distintas:
- **COLABORADOR**: Cria e visualiza seus próprios reembolsos.
- **GESTOR**: Visualiza, aprova ou rejeita solicitações pendentes.
- **FINANCEIRO**: Visualiza solicitações aprovadas e registra o pagamento.
- **ADMIN**: Gestão total de usuários, categorias e acesso a relatórios financeiros.

### Máquina de Estados (Workflow)
As transições de status (Rascunho -> Enviado -> Aprovado -> Pago) são rigorosamente controladas no backend. Mesmo que um usuário tente burlar a interface, o serviço valida se o status atual permite a mudança solicitada, garantindo a integridade dos dados.

## Como Executar

1.  **Instalação**:
    ```bash
    npm install
    ```

2.  **Variáveis de Ambiente**:
    Crie um arquivo `.env` baseado no `.env.example` com as credenciais do seu banco PostgreSQL e a chave secreta do JWT.

3.  **Banco de Dados**:
    ```bash
    npx prisma migrate dev
    npx prisma db seed
    ```

4.  **Desenvolvimento**:
    ```bash
    npm run dev
    ```

## Testes

Para rodar a suíte de testes de integração:
```bash
npm test
```

---
*Este backend foi projetado seguindo as melhores práticas de API REST, com respostas HTTP coerentes e tratamento global de erros.*
