
gemini access token: sbp_07eb284585a7a4ba2164492ac686bed4a34fc090
project password: jywfib-qyvsap-1fiTdi
project id: vqeetamykdsjajrurtoo



# GEMINI.md - Guia Operacional para o Agente de IA (O "Dono" do Projeto)

Este documento serve como o guia principal e a memória persistente para o agente de IA que trabalha no projeto `relatos-supabase`. Ele define o papel do agente como um mantenedor proativo e responsável pela saúde e evolução contínua do aplicativo.

## 1. Visão Geral do Projeto

*   **Nome do Projeto**: Relatos Supabase
*   **Propósito**: Sistema de gestão interna para a Copa Energia.
*   **Funcionalidades Principais**:
    *   **Troca de Senha Obrigatória no Primeiro Login**: Garante que novos usuários sejam forçados a definir uma nova senha no primeiro acesso, utilizando uma página dedicada (`ForcePasswordChangePage.jsx`).
    *   **Relatos de Segurança**: Gerenciamento de incidentes e ocorrências.
*   **Público-Alvo**: Funcionários da Copa Energia que precisam registrar e gerenciar informações de segurança, arquivos e controle de portaria.
*   **Tecnologias Chave**: React.js (Frontend), Tailwind CSS (Estilização), Radix UI (Componentes UI), Supabase (Backend: PostgreSQL, Auth, Storage, Realtime), Vercel (Deploy), pnpm (Gerenciador de Pacotes).
*   **Contexto do Usuário**: O usuário principal (você) é **leigo em programação** e construiu este projeto com o auxílio de IA. É fundamental que todas as explicações sejam **claras, acessíveis e desprovidas de jargões técnicos**, adaptando-se a um público sem conhecimento prévio em desenvolvimento de software. O objetivo é que o agente de IA atue como um "mentor" e "mantenedor", garantindo que o código seja organizado, compreensível e fácil de evoluir, tanto para o usuário quanto para futuros colaboradores humanos.

## 2. Responsabilidades do Agente de IA (Como o "Dono" do App)

O agente de IA é responsável por garantir a qualidade, a organização e a funcionalidade contínua do projeto. Isso inclui, mas não se limita a:

*   **Manutenção Proativa**:
    *   **Linting**: Sempre rodar `pnpm run lint -- --fix` após quaisquer alterações de código para garantir a conformidade com o estilo e a detecção precoce de erros.
    *   **Testes**: Garantir que os testes existentes passem e, proativamente, sugerir e implementar novos testes para funcionalidades críticas ou novas. Rodar `pnpm test` regularmente.
    *   **Monitoramento de Build**: Verificar o status do build (`pnpm run build`) para garantir que o projeto possa ser compilado sem erros.
    *   **Identificação de Débito Técnico**: Apontar áreas do código que podem ser melhoradas em termos de performance, segurança ou legibilidade.

*   **Qualidade do Código**:
    *   **Aderência a Padrões**: Seguir rigorosamente as convenções de código existentes (formatação, nomenclatura, padrões arquiteturais).
    *   **Legibilidade e Manutenibilidade**: Priorizar código claro, conciso e idiomático.
    *   **Modularidade e Reusabilidade**: Incentivar a quebra de componentes/funções grandes em unidades menores e reutilizáveis (ex: custom hooks, utilitários).
    *   **Tratamento de Erros**: Assegurar que o tratamento de erros seja robusto, consistente e amigável ao usuário (usando o sistema de `Toast` implementado).

*   **Gestão da Documentação**:
    *   **`GEMINI.md`**: Manter este arquivo atualizado com todas as diretrizes, decisões e o estado atual do projeto para garantir a continuidade do contexto para futuras sessões da IA.
    *   **`README.md`**: Manter o `README.md` principal do projeto atualizado para desenvolvedores humanos, refletindo as tecnologias, configuração e funcionalidades.

*   **Comunicação e Mentoria**:
    *   **Explicações Claras**: Fornecer explicações detalhadas e acessíveis sobre as mudanças no código, as decisões tomadas e os conceitos de programação, adaptando-se ao nível de conhecimento do usuário.
    *   **Confirmação de Ambiguidade**: Sempre buscar clareza com o usuário se uma tarefa for ambígua ou tiver múltiplas abordagens.
    *   **Reconhecimento e Resolução de Loops**: Se um loop de erro for detectado (tentativas repetidas de correção sem sucesso, ou o mesmo erro reaparecendo), o agente deve reconhecer explicitamente o loop, comunicar ao usuário e mudar a estratégia de depuração, possivelmente solicitando mais informações ou uma abordagem diferente.

*   **Gestão de Refatoração e Imports**:
    *   **Cuidado Extremo com Imports**: Ao refatorar ou mover arquivos, garantir que todos os caminhos de importação sejam atualizados corretamente, utilizando aliases (ex: `@/`) sempre que possível. Priorizar a abordagem passo a passo, verificando a funcionalidade da aplicação a cada alteração para evitar quebras.
    *   **Precisão da `old_string`**: A `old_string` utilizada na ferramenta `replace` é extremamente sensível e exige correspondência exata de espaços, quebras de linha e até comentários. **Sempre releia o arquivo alvo imediatamente antes de cada operação de `replace` para garantir que a `old_string` esteja atualizada e seja precisa.** Em caso de falha, considere substituir apenas a parte variável do caminho (ex: `'@/components/common/PageHeader'`) para maior robustez.
    *   **Verificação Contínua**: Após cada etapa de refatoração que envolva movimentação de arquivos ou alteração de imports, **solicitar ao usuário a verificação visual da aplicação** para garantir que tudo continua funcionando conforme o esperado. O feedback do usuário é a validação primária da funcionalidade.
    *   **Verificação Interna de Imports**: Antes de mover ou modificar um arquivo, sempre leia seu conteúdo para identificar todos os imports internos e planeje suas correções. Isso evita quebras em cascata.
    *   **Imports de Bibliotecas de Ícones**: Ao mover componentes que utilizam ícones de bibliotecas (ex: `lucide-react`), certificar-se de que os ícones necessários sejam explicitamente importados no novo local do componente. A ausência dessas importações pode causar `ReferenceError` em tempo de execução.
    *   **Diagnóstico de Erros de Importação**: Em caso de `TypeError: 'text/html' is not a valid JavaScript MIME type.` ou erros de `Failed to resolve import`, a primeira ação deve ser executar `pnpm run build`. A mensagem de erro do build geralmente aponta o arquivo exato e o import problemático, facilitando a correção.
    *   **Auditoria Periódica de Imports**: Após a conclusão de uma etapa de refatoração (ex: mover todos os arquivos de uma funcionalidade), realizar uma auditoria completa de todos os imports nos arquivos afetados, mesmo que o build tenha passado. Isso ajuda a identificar erros sutis que podem causar problemas em tempo de execução ou em cenários específicos.

*   **Atualização de Nome de Usuário e Sincronização**: Ao permitir que um usuário altere seu nome completo no aplicativo, é crucial que essa alteração seja feita no `user_metadata` do registro do usuário em `auth.users` (usando `supabase.auth.updateUser({ data: { full_name: newFullName } })`). Isso garantirá que o trigger de banco de dados (`handle_new_user_or_update_profile`) propague a mudança para a tabela `public.profiles`, mantendo a consistência dos dados.

*   **Gestão de Versões (Git)**:
    *   O agente de IA é responsável por executar automaticamente os comandos `git add .`, `git commit -m "..."` e `git push` após cada alteração de código ou conjunto de alterações lógicas, a menos que o usuário instrua explicitamente o contrário. As mensagens de commit serão descritivas e seguirão um padrão claro (ex: `feat:`, `fix:`, `refactor:`).

*   **Contexto do Banco de Dados**:
    *   Para tarefas que envolvem o banco de dados, é crucial que o agente tenha acesso ao esquema completo. Sempre que necessário, o usuário deve fornecer o arquivo `schema.sql` ou `database_migrations.sql` atualizado para garantir a precisão das operações.

*   **Autenticação da CLI do Supabase**:
    *   Operações que exigem a CLI do Supabase (como `supabase functions deploy`) podem requerer um token de acesso. O usuário deve estar ciente de que pode ser solicitado a fornecer um token temporário e que este deve ser revogado após o uso para garantir a segurança.

*   **Status do PWA e Atualizações**:
    *   A tentativa de implementar a notificação de atualização de PWA foi revertida devido a problemas de estabilidade (tela branca e inconsistência no cache). Esta funcionalidade não está ativa no momento para evitar problemas na experiência do usuário.

## 3. Configurações e Ferramentas Atuais

*   **ESLint**: Configurado via `eslint.config.js`.
    *   **Regras de Estilo**: Indentação (2 espaços), aspas simples, ponto e vírgula obrigatório, sem vírgulas penduradas, espaçamento consistente.
    *   **`no-unused-vars`**: Ignora variáveis/argumentos prefixados com `_`.
    *   **`react/prop-types`**: Desativado.
    *   **`react/react-in-jsx-scope`**: Desativado.
    *   **`react-refresh/only-export-components`**: Desativado.
    *   **Variáveis Globais**: `process` e `__dirname` definidos como globais.
*   **Vitest**: Configurado para testes unitários (`vite.config.js`, `src/config/tests/setupTests.js`).
*   **Sistema de Toast**: Implementado para feedback de usuário (`src/components/ui/Toast.jsx`, `src/hooks/useToast.js`).
*   **Utilitário de Erro**: `src/lib/errorUtils.js` para padronizar o tratamento de erros de serviço.
*   **Hooks de Dados**: `useSupabaseData.js` como hook genérico para busca de dados e realtime.



---
*Este arquivo é mantido ativamente pelo agente de IA Gemini, você mesmo que tá lendo e usando este arquivo Gemini CLI, para garantir a continuidade e a qualidade do projeto.*

### Próximas Tarefas (Contexto Salvo para Continuidade)

**Plano Abrangente de Refatoração para `relatos-supabase`**

Este plano visa melhorar a organização, modularidade, legibilidade e manutenibilidade da base de código, tornando-a mais fácil para os humanos entenderem e evoluírem. Cada etapa será explicada em termos simples.

---

### **Fase 1: Organização da Estrutura de Pastas e Componentes Compartilhados**

**Objetivo:** Consolidar componentes de UI e padronizar a estrutura de pastas para recursos compartilhados.

1.  **Mover Componentes de `src/core` para `src/01-shared`:**
    *   **Ação:** Mover todos os arquivos de `src/core/components/ui` para `src/01-shared/components/ui`.
    *   **Status:** **CONCLUÍDO**.

2.  **Renomear `src/01-common` para `src/01-shared`:**
    *   **Ação:** Renomear a pasta `src/01-common` para `src/01-shared`.
    *   **Status:** **CONCLUÍDO**.

3.  **Atualizar Caminhos de Importação:**
    *   **Ação:** Atualizar todas as referências no código que apontam para os caminhos antigos (`@/core/...` e `@/01-common/...`) para o novo caminho (`@/01-shared/...`).
    *   **Status:** **CONCLUÍDO**.

---

### **Fase 2: Modularidade e Reutilização de Lógica (Extração de Hooks)**

**Objetivo:** Reduzir a complexidade dos componentes de página e reutilizar a lógica comum através de Hooks personalizados.

1.  **Extrair Lógica de `RelatoDetailsPage.jsx` para `useRelatoManagement`:**
    *   **Ação:** Criar o custom hook `src/07-relatos/hooks/useRelatoManagement.js`.
    *   **Ação:** Mover estados (`relato`, `allUsers`, `currentResponsibles`, `loading`, `error`, `isSaving`, `isDeleting`, `isReproving`), funções de busca (`fetchRelato`, `fetchAllUsers`) e manipuladores de ação (`handleReproveRelato`, `handleReapproveRelato`, `handleUpdateRelato`, `handleDeleteRelato`) de `RelatoDetailsPage.jsx` para este novo hook.
    *   **Ação:** Atualizar `RelatoDetailsPage.jsx` para usar o `useRelatoManagement` e desestruturar os valores retornados.
    *   **Status:** **CONCLUÍDO**.

2.  **Extrair Lógica de `CreateRelatoPage.jsx`:**
    *   **Ação:** Analisar `CreateRelatoPage.jsx` para identificar lógica de formulário e submissão que possa ser extraída para um hook (ex: `useRelatoForm`).
    *   **Status:** **PENDENTE**.

3.  **Extrair Lógica de `UserDetailsPage.jsx`:**
    *   **Ação:** Analisar `UserDetailsPage.jsx` para identificar lógica de gerenciamento de permissões e exclusão de usuário que possa ser extraída para hooks (ex: `useUserPermissions`, `useUserDeletion`).
    *   **Status:** **PENDENTE**.

---

### **Fase 3: Consistência na Camada de Serviços**

**Objetivo:** Padronizar a forma como as interações com o Supabase são realizadas e o tratamento de erros é gerenciado.

1.  **Criar um Módulo Centralizado para Operações Supabase (CRUD):**
    *   **Ação:** Analisar `src/01-shared/lib/supabase.js` e os arquivos de serviço existentes (ex: `userService.js`, `relatosService.js`).
    *   **Ação:** Criar funções utilitárias genéricas para operações comuns de Supabase (buscar, inserir, atualizar, deletar) com tratamento de erros padronizado.
    *   **Ação:** Refatorar os serviços existentes para usar essas funções utilitárias.
    *   **Status:** **PENDENTE**.

2.  **Padronizar o Tratamento de Erros com `useToast`:**
    *   **Ação:** Garantir que todas as chamadas de API e operações críticas usem o `useToast` para feedback ao usuário, conforme as diretrizes do `GEMINI.md`.
    *   **Status:** **PENDENTE**.

---

### **Fase 4: Clareza e Legibilidade do Código**

**Objetivo:** Melhorar a compreensão do código para facilitar a manutenção e futuras modificações.

1.  **Revisão de Nomenclatura:**
    *   **Ação:** Garantir que nomes de variáveis, funções e componentes sejam claros e descritivos.
    *   **Status:** **PENDENTE**.

2.  **Simplificação de Lógica Complexa:**
    *   **Ação:** Identificar blocos de código complexos e simplificá-los, possivelmente dividindo-os em funções menores.
    *   **Status:** **PENDENTE**.

3.  **Comentários Estratégicos:**
    *   **Ação:** Adicionar comentários *apenas* para explicar o 'porquê' de decisões complexas ou não óbvias, evitando comentários óbvios sobre o 'o quê'.
    *   **Status:** **PENDENTE**.

---

### **Fase 5: Resolução de Erros de Linting e Build**

**Objetivo:** Garantir que o projeto compile e passe no linter sem erros.

1.  **Resolver Erros de Linting em `src/01-shared/components/ui/select.jsx`:**
    *   **Ação:** Corrigir os caracteres de escape desnecessários (`Unnecessary escape character: \]`) que estão impedindo o linter de passar. Isso pode exigir uma abordagem mais manual ou cuidadosa.
    *   **Status:** **PENDENTE**. (Este é o problema que nos travou).

2.  **Resolver Aviso de Variável Não Utilizada em `src/05-adm/pages/UserDetailsPage.jsx`:**
    *   **Ação:** Adicionar um prefixo `_` à variável `AlertDialogTrigger` ou remover a importação se não for utilizada.
    *   **Status:** **PENDENTE**.

3.  **Verificação Pós-Refatoração:**
    *   **Ação:** Após cada fase de refatoração, executar `pnpm run lint` e `pnpm run build` para garantir que não haja novos erros.
    *   **Status:** **PENDENTE**.

---

---

## Histórico de Tarefas Concluídas (Sessão Atual)

### **1. Funcionalidade de Criação de Relatos Anônimos**
*   **Propósito:** Permitir que usuários não autenticados criem relatos, superando a restrição de RLS.
*   **Ações Realizadas:**
    *   **Criação de Role e Políticas RLS:** Definido o novo role `anon_relator` no banco de dados. Criadas e aplicadas políticas de Row-Level Security (RLS) na tabela `public.relatos` para permitir `INSERT` e `SELECT` por este role. (Via migração `20250820000002_create_anon_relator_role.sql`).
    *   **Implementação de Edge Function:** Criada a Supabase Edge Function `create-anonymous-relato` (`supabase/functions/create-anonymous-relato/index.ts`). Esta função é responsável por receber os dados do relato e inseri-los no banco de dados com as permissões adequadas, utilizando o `service_role_key` para bypassar RLS e garantir a inserção, mesmo para usuários anônimos.
    *   **Modificação da Aplicação (Frontend):** Atualizado `src/07-relatos/pages/CreateRelatoPage.jsx` para que, quando um relato for marcado como anônimo (`formData.is_anonymous`), ele chame a nova Edge Function `create-anonymous-relato` em vez de tentar a inserção direta via `supabase.from('relatos').insert()`.

### **2. Correção e Interatividade da Pirâmide de Bird**
*   **Propósito:** Assegurar a contagem correta dos relatos na Pirâmide de Bird e adicionar funcionalidade de clique para filtrar listas de relatos.
*   **Ações Realizadas:**
    *   **Correção de Discrepâncias de Classificação:** Identificadas e corrigidas inconsistências de grafia e capitalização entre os tipos de relato definidos no componente `RelatosByTypePage.jsx` (`orderedTypes` array) e os valores utilizados no dropdown de classificação em `RelatosUnclassifiedPage.jsx`. Isso garante que a contagem na pirâmide seja precisa.
    *   **Tornar Barras Clicáveis:** Implementada a funcionalidade de clique nas barras da Pirâmide de Bird em `RelatosByTypePage.jsx`. Ao clicar em uma barra, o usuário é redirecionado para a página de listagem de relatos (`/relatos`).
    *   **Passagem de Parâmetros de Filtro:** Ao redirecionar, o `tipo_relato` (classificação da barra clicada) e o `startDate`/`endDate` (período selecionado na página da pirâmide) são passados como parâmetros na URL.
    *   **Filtragem na Página de Listagem:** Modificado `src/07-relatos/pages/RelatosListaPage.jsx` para ler os parâmetros `tipo_relato`, `startDate` e `endDate` da URL. Esses parâmetros são então utilizados para filtrar a lista de relatos exibida, garantindo que apenas os relatos da classificação e período selecionados sejam mostrados.
    *   **Atualização da Função RPC `search_relatos_unaccented`:** Criada uma migração (`20250820000003_update_search_relatos_unaccented_function.sql`) para atualizar a função `search_relatos_unaccented` no banco de dados. Esta atualização adiciona um novo parâmetro `p_tipo_relato_filter` e modifica a lógica interna da função para aplicar este filtro na consulta SQL, permitindo a filtragem de relatos por tipo diretamente no banco de dados.

### **Próximos Passos Pendentes (para a Próxima Sessão)**
*   **Aplicação de Migrações no Banco de Dados:** As migrações `20250820000001_delete_relatos_pendentes_table.sql`, `20250820000002_create_anon_relator_role.sql` e `20250820000003_update_search_relatos_unaccented_function.sql` precisam ser aplicadas manualmente no painel do Supabase. A última tentativa de aplicar a migração `20250820000003_update_search_relatos_unaccented_function.sql` resultou em um erro de sintaxe, que foi corrigido no arquivo.
*   **Verificação da Funcionalidade:** Após a aplicação das migrações, é crucial verificar se a criação de relatos anônimos e a filtragem da Pirâmide de Bird estão funcionando conforme o esperado.
*   **Continuação do Plano de Refatoração:** Retomar as fases pendentes do plano de refatoração detalhado acima.