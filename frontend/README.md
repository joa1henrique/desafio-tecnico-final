# Frontend - Sistema de Reembolsos

Esta é a interface do usuário do Sistema de Reembolsos, desenvolvida com React e focada em uma experiência moderna, rápida e intuitiva para o gerenciamento de despesas corporativas.

## Tecnologias Utilizadas

- **React 19**: Biblioteca core para construção da interface.
- **Vite**: Ferramenta de build e dev server extremamente rápido.
- **TypeScript**: Garantia de tipos em todo o fluxo de dados.
- **TanStack Router**: Roteamento tipado e eficiente para Single Page Applications (SPA).
- **SWR**: Estratégia de cache e revalidação para consumo de dados da API.
- **Tailwind CSS**: Estilização baseada em utilitários para design responsivo e consistente.
- **React Hook Form & Zod**: Gestão de formulários complexos com validação robusta no lado do cliente.
- **React Toastify**: Sistema de notificações visuais para feedback imediato ao usuário.

## Design e UX

A interface foi projetada seguindo padrões modernos de acessibilidade e usabilidade:

- **Feedback Visual**: Uso intensivo de Toasts e mensagens de erro contextuais.
- **Estados de Interface**: Tratamento explícito de estados de carregamento (Loading), erro e listas vazias.
- **Proteção de Rotas**: Redirecionamento inteligente baseado no status de autenticação.
- **Responsividade**: Layout adaptável para diferentes tamanhos de tela.

## Estrutura de Pastas

- `/src/components`: Componentes reutilizáveis divididos em `ui` (base) e `layout`.
- `/src/pages`: Componentes de página que representam as rotas principais.
- `/src/services`: Camada de comunicação com a API usando Axios.
- `/src/contexts`: Gerenciamento de estado global (Autenticação).
- `/src/hooks`: Hooks customizados para lógica compartilhada.
- `/src/routes`: Configuração e definição das rotas do sistema.
- `/src/utils`: Funções utilitárias (formatação de moeda, datas, etc.).

## Como Executar

1.  **Instalação**:
    ```bash
    npm install
    ```

2.  **Configuração**:
    Crie um arquivo `.env` com a URL do seu backend:
    ```env
    VITE_API_URL=http://localhost:3000
    ```

3.  **Desenvolvimento**:
    ```bash
    npm run dev
    ```

4.  **Build de Produção**:
    ```bash
    npm run build
    ```

## Testes

Para executar os testes de componentes:
```bash
npm test
```

---
*A interface se comunica com o backend via JSON, utilizando tokens JWT armazenados de forma segura para manter a sessão do usuário.*
