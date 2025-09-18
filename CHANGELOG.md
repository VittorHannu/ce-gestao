## [2.0.0] - 2025-09-18

### Novidades
- **Gerenciamento de Imagens Avançado**: Implementação de um sistema robusto para upload, visualização e gerenciamento de múltiplas imagens em relatos, incluindo integração com Cloudflare R2 e Edge Functions para segurança e desempenho.
- **Fluxo de Submissão de Relatos Aprimorado**: Completa reformulação do processo de submissão e confirmação de relatos, com melhorias na experiência do usuário e prevenção de duplicatas.
- **Gestão de Classificações Dinâmica**: Nova funcionalidade de administração para gerenciar e reordenar categorias de classificação de relatos, oferecendo maior flexibilidade.
- **Sistema Abrangente de Auditoria (Audit Logs)**: Implementação de um sistema detalhado de trilha de auditoria para registrar e visualizar ações importantes no aplicativo.
- **Edição In-loco e UX da Página de Detalhes de Relatos**: Grandes melhorias na página de detalhes de relatos, incluindo edição direta de campos e uma experiência de usuário mais fluida.
- **Pirâmide de Bird no Dashboard**: Integração da Pirâmide de Bird diretamente no dashboard principal para visualização de dados de segurança.

### Melhorias e Correções
- **Refatoração do OneSignal**: Otimização e centralização da lógica de notificações push para maior robustez e desempenho.
- Diversas outras melhorias de UI/UX e correções de bugs em todo o aplicativo.

## [0.1.25] - 2025-09-14
### Melhorias e Correções
- Cálculo da Pirâmide de Bird corrigido.
- Espaçador adicionado na página de relatos para evitar "flicker" na UI.

## [0.1.24] - 2025-09-14
### Melhorias e Correções
- Bugs corrigidos na página de detalhes do usuário, incluindo notificações e atualização de permissões.

## [0.1.23] - 2025-09-14
### Melhorias e Correções
- Ferramenta de depuração `eruda` removida do build de produção para otimização e segurança.

## [0.1.22] - 2025-09-14
### Novidades
- Novas permissões adicionadas para usuários na página de detalhes.

## [0.1.21] - 2025-09-13
### Melhorias e Correções
- Processo de migrações do Supabase corrigido para evitar conflitos e melhorar o versionamento do schema.

## [0.1.16] - 2025-09-12
### Novidades
- Opção de atualizar o aplicativo PWA mais tarde adicionada nas configurações.

## [0.1.15] - 2025-09-12
### Melhorias e Correções
- Layout de duas colunas adicionado na página de lista de relatos para melhor aproveitamento de tela.
- Espaçamento ajustado na página principal de relatos.

## [0.1.14] - 2025-09-11
### Melhorias e Correções
- Comportamento de instalação do PWA corrigido para garantir que o aplicativo seja adicionado como standalone.

## [0.1.13] - 2025-09-11
### Novidades
- Seção "Sobre" reintroduzida nas configurações, exibindo informações da versão do aplicativo.

## [0.1.12] - 2025-09-10
### Melhorias e Correções
- Lógica do OneSignal refatorada para centralizar o gerenciamento de notificações em um hook dedicado.

## [0.1.11] - 2025-09-10
### Melhorias e Correções
- Integração com o OneSignal refatorada para maior robustez e desempenho.

## [1.1.2] - 2025-09-09
### Melhorias e Correções
- Limpeza de `user_id` do OneSignal no logout para evitar notificações de outros usuários.
- Foco do teclado não visível em elementos não interativos no modo mobile.

## [1.1.1] - 2025-09-09
### Melhorias e Correções
- Lógica de limpeza de notificações corrigida, removendo tabelas e funções obsoletas do Supabase.

## [1.1.0] - 2025-09-08
### Novidades
- Nova página de "Notificações" com histórico e paginação.
### Melhorias e Correções
- Bug corrigido que impedia o menu inferior de ser exibido em telas maiores.

## [1.0.0] - 2025-09-05
### Novidades
- Lançamento inicial do SGI Copa.