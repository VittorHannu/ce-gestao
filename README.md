# SGI Copa - Sistema de Gestão Integrada

Este projeto é uma aplicação web de Sistema de Gestão Integrada (SGI) desenvolvida para a Copa Energia. O foco principal da aplicação é o registro, gerenciamento e análise de relatos de segurança, além de funcionalidades administrativas para controle de usuários e permissões.

## ✨ Funcionalidades Principais

*   **Autenticação Segura**: Sistema de login com e-mail e senha, incluindo fluxo de redefinição de senha.
*   **Gestão de Relatos**:
    *   Criação de relatos detalhados, incluindo tipo, data, local e descrição.
    *   Possibilidade de anexar arquivos e fotos aos relatos.
    *   Criação de relatos de forma anônima.
    *   Fluxo de aprovação, reprovação e atribuição de responsáveis para cada relato.
    *   Sistema de comentários para discussão e acompanhamento.
*   **Dashboard e Estatísticas**:
    *   Visualização de dados consolidados sobre os relatos.
    *   Gráficos para análise de tipos de ocorrência (Pirâmide de Bird).
    *   Filtros por período para análise temporal.
*   **Administração de Usuários**:
    *   Painel de administração para criar, visualizar e gerenciar usuários.
    *   Controle de permissões de acesso baseado em roles (ex: `admin`, `user`).
*   **Gestão de Perfil**: Usuários podem atualizar suas próprias informações de perfil e senha.
*   **Notificações**: Sistema de notificações para manter os usuários informados sobre atualizações relevantes.

## 🚀 Stack de Tecnologias

*   **Frontend**:
    *   **Framework**: [React.js](https://reactjs.org/) com [Vite](https://vitejs.dev/)
    *   **Roteamento**: [React Router](https://reactrouter.com/)
    *   **Gerenciamento de Estado do Servidor**: [TanStack Query](https://tanstack.com/query/latest)
    *   **Estilização**: [Tailwind CSS](https://tailwindcss.com/)
    *   **Componentes UI**: [Radix UI](https://www.radix-ui.com/) e componentes customizados (`shadcn/ui` style).
    *   **Gráficos**: [Recharts](https://recharts.org/)
    *   **Formulários**: [React Hook Form](https://react-hook-form.com/) com [Zod](https://zod.dev/) para validação.
*   **Backend (BaaS)**:
    *   **Plataforma**: [Supabase](https://supabase.com/)
    *   **Banco de Dados**: PostgreSQL
    *   **Autenticação**: Supabase Auth
    *   **Armazenamento de Arquivos**: Supabase Storage
    *   **Funções de Backend**: Supabase Edge Functions (Deno)
*   **Ferramentas de Desenvolvimento**:
    *   **Gerenciador de Pacotes**: [pnpm](https://pnpm.io/)
    *   **Linting**: [ESLint](https://eslint.org/)
    *   **Testes**: [Vitest](https://vitest.dev/) com [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

## 📦 Pré-requisitos

*   [Node.js](https://nodejs.org/en/) (versão 18 ou superior)
*   [pnpm](https://pnpm.io/installation)
*   [Supabase CLI](https://supabase.com/docs/guides/cli)

## ⚙️ Instalação e Configuração Local

1.  **Clone o repositório:**
    ```bash
    git clone <URL_DO_REPOSITORIO>
    cd ce-gestao
    ```

2.  **Instale as dependências:**
    ```bash
    pnpm install
    ```

3.  **Configure as Variáveis de Ambiente:**
    Crie um arquivo `.env` na raiz do projeto. Você precisará das chaves de API do seu projeto Supabase.
    ```env
    VITE_SUPABASE_URL="https://<project_ref>.supabase.co"
    VITE_SUPABASE_ANON_KEY="<sua_anon_key>"
    ```

4.  **Inicie o ambiente local do Supabase:**
    Este comando irá iniciar o container Docker com o banco de dados e outros serviços do Supabase.
    ```bash
    supabase start
    ```

5.  **Execute a aplicação em modo de desenvolvimento:**
    A aplicação estará disponível em `http://localhost:5173`.
    ```bash
    pnpm dev
    ```

## 📜 Scripts Disponíveis

*   `pnpm dev`: Inicia o servidor de desenvolvimento.
*   `pnpm build`: Compila a aplicação para produção.
*   `pnpm lint`: Executa o linter (ESLint) para verificar e corrigir o código.
*   `pnpm test`: Executa os testes unitários com Vitest.

## 🗄️ Migrações e Povoamento do Banco (Seeding)

As alterações na estrutura do banco de dados e seu povoamento com dados de teste são processos separados.

### 1. Migrações (Estrutura do Banco)

Para alterar a ESTRUTURA do banco (criar tabelas, adicionar colunas, etc.), use as migrações.

- **Crie um novo arquivo de migração:**
  ```bash
  supabase migration new <nome_descritivo_da_mudanca>
  ```
- **Escreva o SQL:** Adicione seu código SQL (`CREATE TABLE`, etc.) no arquivo gerado na pasta `supabase/migrations`.

### 2. Povoamento/Seed (Dados de Teste)

Para limpar o banco de dados local e populá-lo com dados de teste (usuários, etc.), siga este fluxo de 2 passos:

1.  **Resetar o Banco de Dados:**
    Este comando apaga o banco local e o recria com a estrutura definida nas suas migrações.
    ```bash
    supabase db reset
    ```
2.  **Executar o Script de Seed:**
    Este comando executa o script `seed.ts` para criar os usuários de teste e outros dados iniciais.
    ```bash
    pnpm run db:seed
    ```

### Aplicando em Produção

Para aplicar as alterações de **estrutura** (migrações) no ambiente de produção, use:
```bash
supabase db push
```
**Atenção:** O comando `db:seed` é destinado **apenas para o ambiente de desenvolvimento local** e não deve ser executado em produção.
