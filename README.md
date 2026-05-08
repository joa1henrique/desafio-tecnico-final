# Sistema de Gestão de Reembolsos Financeiros

Este projeto é uma aplicação completa (Fullstack) para gerenciamento de reembolsos de despesas corporativas. O sistema permite que colaboradores enviem solicitações, gestores as analisem e o departamento financeiro processe os pagamentos, tudo com controle rigoroso de status e permissões.

## Estrutura do Projeto

O repositório está dividido em três partes principais:

- **backend/**: API REST construída com Node.js, Express e Prisma (PostgreSQL).
- **frontend/**: Interface do usuário moderna com React 19, Vite e Tailwind CSS.
- **postman/**: Coleção de requisições e documentação detalhada da API para testes.

## Pré-requisitos

Antes de começar, você precisará ter instalado:
- Node.js (v18 ou superior)
- npm ou yarn
- Docker e Docker Compose (opcional, para rodar o banco de dados)

## Como Instalar e Rodar

### 1. Clonar o Repositório
```bash
git clone https://github.com/seu-usuario/desafio-tecnico-final.git
cd desafio-tecnico-final
```

### 2. Configurar o Backend
Acesse a pasta do backend, instale as dependências e configure o banco de dados:
```bash
cd backend
npm install

# Configure o arquivo .env (veja .env.example)
# Se estiver usando Docker para o banco:
docker-compose up -d

# Execute as migrations e o seed (dados iniciais)
npx prisma migrate dev
npx prisma db seed

# Inicie o servidor em modo de desenvolvimento
npm run dev
```

### 3. Configurar o Frontend
Em um novo terminal, acesse a pasta do frontend e instale as dependências:
```bash
cd frontend
npm install

# Configure o arquivo .env (veja .env.example) com VITE_API_URL
# Inicie a interface
npm run dev
```

## Credenciais de Acesso (Dados de Teste)

O script de `seed` cria usuários de teste para cada perfil do sistema. A senha para todos é `admin123`.

| Perfil | E-mail |
| :--- | :--- |
| **Administrador** | admin@exemplo.com |
| **Gestor** | gestor@exemplo.com |
| **Financeiro** | financeiro@exemplo.com |
| **Colaborador** | colaborador@exemplo.com |

## Funcionalidades Principais

- **Fluxo de Aprovação**: Ciclo completo de vida de um reembolso (Rascunho -> Enviado -> Aprovado/Rejeitado -> Pago).
- **Controle de Acesso (RBAC)**: Permissões granulares baseadas no perfil do usuário conectado.
- **Relatórios Financeiros**: Painel administrativo com gráficos de valores pagos e a pagar.
- **Gestão de Categorias**: Cadastro e manutenção de categorias de despesa.
- **Documentação de API**: Coleção Postman pronta para uso para desenvolvedores.

## Documentação Detalhada

Para informações técnicas específicas de cada camada, consulte:
- [Documentação do Backend](./backend/README.md)
- [Documentação do Frontend](./frontend/README.md)
- [Guia da Coleção Postman](./postman/README.md)

---
*Este projeto foi desenvolvido como um desafio técnico final, focando em boas práticas de engenharia de software, segurança e experiência do usuário.*
