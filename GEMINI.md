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
    *   **Precisão da `old_string`**: A `old_string` utilizada na ferramenta `replace` é extremamente sensível e exige correspondência exata de espaços, quebras de linha e até comentários. **Sempre releia o arquivo alvo imediatamente antes de cada operação de `replace` para garantir que a `old_string` esteja atualizada e seja precisa.** Em caso de falha, considere substituir apenas a parte variável do caminho (ex: `'@/components/common/PageHeader'` para `'@/core/components/common/PageHeader'`) para maior robustez.
    *   **Verificação Contínua**: Após cada etapa de refatoração que envolva movimentação de arquivos ou alteração de imports, **solicitar ao usuário a verificação visual da aplicação** para garantir que tudo continua funcionando conforme o esperado. O feedback do usuário é a validação primária da funcionalidade.
    *   **Verificação Interna de Imports**: Antes de mover ou modificar um arquivo, sempre leia seu conteúdo para identificar todos os imports internos e planeje suas correções. Isso evita quebras em cascata.
    *   **Imports de Bibliotecas de Ícones**: Ao mover componentes que utilizam ícones de bibliotecas (ex: `lucide-react`), certificar-se de que os ícones necessários sejam explicitamente importados no novo local do componente. A ausência dessas importações pode causar `ReferenceError` em tempo de execução.
    *   **Diagnóstico de Erros de Importação**: Em caso de `TypeError: 'text/html' is not a valid JavaScript MIME type.` ou erros de `Failed to resolve import`, a primeira ação deve ser executar `pnpm run build`. A mensagem de erro do build geralmente aponta o arquivo exato e o import problemático, facilitando a correção.
    *   **Auditoria Periódica de Imports**: Após a conclusão de uma etapa de refatoração (ex: mover todos os arquivos de uma funcionalidade), realizar uma auditoria completa de todos os imports nos arquivos afetados, mesmo que o build tenha passado. Isso ajuda a identificar erros sutis que podem causar problemas em tempo de execução ou em cenários específicos.

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
*Este arquivo é mantido ativamente pelo agente de IA para garantir a continuidade e a qualidade do projeto.*

### Próximas Tarefas (Contexto Salvo para Continuidade)

