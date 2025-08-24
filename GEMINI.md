# GEMINI.md - Guia Operacional para o Agente de IA

Este documento é a memória persistente e o guia de operações para o agente de IA (Gemini) que atua como mantenedor do projeto **SGI Copa (relatos-supabase)**.

## ❗ Diretriz Principal: Autonomia Total do Agente em Banco de Dados

Esta é a regra mais importante para a nossa colaboração.

O agente de IA (Gemini) é **100% responsável por todas as alterações no banco de dados**. O usuário **não irá** interagir com a interface visual do Supabase Studio para fazer modificações. Todo o processo deve ser executado pelo agente através de código e comandos no terminal.

O fluxo de trabalho obrigatório é:

1.  **Instrução do Usuário**: O usuário informa a alteração necessária (ex: "Crie a tabela X com as colunas Y e Z").
2.  **Criação da Migração**: O agente executa `supabase migration new <nome_da_alteracao>` para gerar um novo arquivo de migração SQL.
3.  **Escrita do Código SQL**: O agente escreve o código SQL necessário (`CREATE TABLE`, `ALTER TABLE`, etc.) dentro do arquivo de migração recém-criado.
4.  **Aplicação e Teste Local**: O agente executa `supabase db reset` para aplicar a migração no ambiente local e garantir que não há erros.
5.  **Aplicação em Produção**: Após a confirmação do usuário, o agente executa `supabase db push` para aplicar a alteração no banco de dados de produção.

## 🤖 Responsabilidades do Agente de IA

*   **Qualidade de Código**: Aderir estritamente aos padrões de código, formatação e arquitetura existentes no projeto.
*   **Manutenção Proativa**:
    *   **Linting**: Sempre executar `pnpm run lint -- --fix` após qualquer alteração de código para garantir a consistência.
    *   **Testes**: Executar `pnpm test` para garantir que as funcionalidades existentes não foram quebradas.
    *   **Build**: Verificar se o projeto compila sem erros com `pnpm run build`.
*   **Gestão de Versão (Git)**:
    *   Realizar commits lógicos e com mensagens claras (seguindo o padrão `feat:`, `fix:`, `refactor:`, etc.).
    *   Manter o usuário informado sobre as alterações antes de fazer `git push`.
*   **Comunicação**:
    *   Explicar os comandos críticos antes de executá-los.
    *   Manter o `GEMINI.md` e o `README.md` atualizados conforme o projeto evolui.

## 🚀 Visão Geral do Projeto

*   **Nome**: SGI Copa (relatos-supabase)
*   **Propósito**: Sistema de Gestão Integrada para a Copa Energia, focado no gerenciamento de relatos de segurança.
*   **Tecnologias Chave**: React, Vite, Tailwind CSS, Radix UI, TanStack Query, Recharts, Supabase (PostgreSQL, Auth, Storage, Edge Functions), pnpm.

## ⚙️ Comandos Essenciais

*   `pnpm dev`: Iniciar o servidor de desenvolvimento.
*   `pnpm build`: Gerar a build de produção.
*   `pnpm lint -- --fix`: Executar o linter e corrigir problemas.
*   `pnpm test`: Rodar a suíte de testes.
*   `supabase start`: Iniciar o ambiente Supabase local.
*   `supabase migration new <nome>`: Criar um novo arquivo de migração.
*   `supabase db reset`: Recriar o banco de dados local a partir das migrações.
*   `supabase db push`: Enviar novas migrações para o banco de produção.

## 🏛️ Arquitetura e Convenções

*   **Estrutura de Pastas**: O código-fonte (`src`) é organizado por funcionalidades (features), com prefixos numéricos (ex: `01-shared`, `03-auth`, `07-relatos`).
    *   `01-shared`: Contém lógica, componentes e hooks reutilizáveis por toda a aplicação.
*   **Hooks Customizados**: A lógica de negócio e o acesso a dados são encapsulados em hooks customizados (ex: `useUsers`, `useRelatoManagement`) para manter os componentes limpos.
*   **Serviços**: Funções que interagem diretamente com o Supabase (ou outros serviços externos) são abstraídas em módulos de serviço (ex: `userService.js`).
*   **Variáveis de Ambiente**: Todas as chaves de API e configurações sensíveis devem ser gerenciadas através do arquivo `.env`.