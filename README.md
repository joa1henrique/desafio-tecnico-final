# Sistema de Gestão de Reembolsos Financeiros

Este sistema é uma solução completa para o gerenciamento de despesas corporativas, permitindo o controle total desde a criação de um rascunho de reembolso até a liquidação financeira.

## Estrutura e Setup Geral

### Arquitetura de Pastas
O repositório está organizado em uma estrutura de monorepo simplificado:
- **backend/**: Servidor API REST, lógica de negócio e integração com banco de dados.
- **frontend/**: Aplicação cliente (SPA) para interação do usuário.
- **postman/**: Coleção de requisições e guia de uso da API.

### Tecnologias Base e Infraestrutura
- **Banco de Dados**: PostgreSQL, escolhido para suportar múltiplas transações de status simultâneas e garantir a integridade da máquina de estados através de tipos nativos (Enums e UUIDs), superando os bloqueios de escrita e limitações de tipos do SQLite.
- **Docker**: Utilizado via Docker Compose para subir a instância do banco de dados de forma rápida e isolada.
- **Linguagem**: TypeScript utilizado em ambas as pontas para garantir consistência de tipos e segurança no desenvolvimento.

### Como Rodar o Projeto
1.  **Banco de Dados**: Na raiz ou na pasta backend, execute `docker-compose up -d` para subir o PostgreSQL.
2.  **Configuração**: Copie os arquivos `.env.example` para `.env` tanto no `/backend` quanto no `/frontend` e ajuste as variáveis se necessário.
3.  **Backend**: Acesse `/backend`, execute `npm install`, `npx prisma migrate dev`, `npx prisma db seed` e `npm run dev`.
4.  **Frontend**: Acesse `/frontend`, execute `npm install` e `npm run dev`.

### Usuários de Teste (Seed)
Após executar o comando de seed, você pode utilizar as seguintes credenciais para testar os diferentes fluxos (a senha para todos é `admin123`):
- **Administrador**: `admin@exemplo.com`
- **Gestor**: `gestor@exemplo.com`
- **Financeiro**: `financeiro@exemplo.com`
- **Colaborador 1**: `colaborador@exemplo.com`
- **Colaborador 2**: `colaborador2@exemplo.com`
- **Colaborador 3**: `colaborador3@exemplo.com`

## Decisões Técnicas e Arquitetura

### Máquina de Estados (Workflow)
A escolha de implementar uma máquina de estados no backend foi fundamental para garantir que as regras de negócio de um reembolso sejam invioláveis. Uma solicitação nunca pode "retroceder" de forma inválida ou pular etapas de aprovação, garantindo a integridade financeira do processo.

### Controle de Acesso (RBAC)
O sistema utiliza Role-Based Access Control tanto no backend (middlewares de autorização) quanto no frontend (proteção de rotas e visibilidade de componentes), garantindo que cada usuário interaja apenas com o que lhe é permitido.

### Componentização e UX
No frontend, priorizou-se o uso de componentes reutilizáveis e estados globais leves (via SWR), focando em uma interface que responda rapidamente e forneça feedback claro em português para todas as ações do usuário.

## Tecnologias Utilizadas (Ementa)

Este projeto foi desenvolvido utilizando as tecnologias propostas:
- **Linguagem**: TypeScript (tipagem estática em todo o projeto).
- **Backend**: Node.js com Framework Express.
- **ORM**: Prisma para modelagem e migração do banco de dados.
- **Banco de Dados**: PostgreSQL (executado via Docker).
- **Frontend**: React.js com Vite.
- **Estilização**: shadcn/ui e Tailwind CSS.
- **Roteamento**: TanStack Router.
- **Testes**: Jest e Supertest (Backend); Jest e React Testing Library (Frontend).


## Processos, Fluxos e Permissões

O sistema opera baseado em um controle de acesso rigoroso por perfis (RBAC), onde cada tipo de usuário possui responsabilidades e visibilidades específicas dentro do fluxo de trabalho.

### Perfis de Usuário
- **Colaborador**: É o autor das solicitações. Pode criar novos reembolsos, salvar rascunhos para edição posterior e enviar solicitações para análise. Sua visão é restrita apenas aos próprios reembolsos.
- **Gestor**: Responsável pela primeira etapa de aprovação. Visualiza a fila de solicitações enviadas e decide pela aprovação ou rejeição (exigindo justificativa em caso de negativa).
- **Financeiro**: Responsável pela liquidação do pagamento. Visualiza apenas solicitações que já foram aprovadas por um gestor e registra quando o pagamento foi efetivamente realizado.
- **Administrador**: Possui visão global do sistema. Visualiza a listagem de usuários do sistema, gerencia as categorias de despesa, acompanha o histórico completo de todas as solicitações e tem acesso ao relatório financeiro consolidado. Este relatório permite ao administrador analisar os valores aprovados (custos futuros no gráfico "A Pagar") e pagos (custos realizados no gráfico "Pagos"), fornecendo uma visão clara da saúde financeira e previsibilidade de gastos da empresa. Não pode aprovar solicitações nem pagar solicitações de reembolso.

### Fluxo da Solicitação
1.  **Rascunho**: A solicitação é criada pelo colaborador e pode ser editada.
2.  **Enviado**: O colaborador submete a solicitação, que entra na fila do gestor.
3.  **Aprovado/Rejeitado**: O gestor avalia a solicitação. Se rejeitada, o fluxo encerra. Se aprovada, segue para o financeiro.
4.  **Pago**: O departamento financeiro confirma o pagamento, finalizando o ciclo de vida da solicitação.

## Backend

O servidor é construído com Node.js, Express e TypeScript, utilizando o Prisma como ORM para persistência em banco de dados PostgreSQL.

### Máquina de Estados
A integridade do fluxo de solicitações é garantida por uma máquina de estados. Cada transição de status é validada programaticamente, impedindo que uma solicitação pule etapas (ex: ser paga sem antes ser aprovada) ou seja alterada após o envio.

### Características Técnicas
- Autenticação via JWT (JSON Web Token).
- Validação de dados de entrada com Zod.
- Arquitetura em camadas (Controllers, Services, Middlewares).
- Suíte de testes de integração com Jest e Supertest.

## Frontend

A interface do usuário é uma Single Page Application (SPA) moderna, desenvolvida com React 19 e Vite.

### Design e Experiência do Usuário
- **Interface Responsiva**: Desenvolvida com Tailwind CSS, adaptando-se a diferentes tamanhos de tela.
- **Gerenciamento de Estado e Cache**: Utiliza SWR para consumo eficiente de dados da API, garantindo rapidez e consistência.
- **Navegação Simplificada**: Utiliza o logotipo no canto superior esquerdo como atalho universal para retornar ao Dashboard principal de qualquer tela do sistema.
- **Roteamento Tipado**: Implementado com TanStack Router, prevenindo erros de navegação e garantindo proteção de rotas por perfil.
- **Feedback Constante**: Sistema de notificações (Toasts) e tratamentos de erro em português para garantir que o usuário compreenda cada interação.

## Documentação Detalhada
Guias detalhados de configuração e execução de cada módulo:
- [Documentação do Backend](./backend/README.md)
- [Documentação do Frontend](./frontend/README.md)
- [Guia da Coleção Postman](./postman/README.md)
