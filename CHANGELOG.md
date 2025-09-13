## [0.1.21] - 2025-09-13

### Fix
- **migrations**: Corrige o processo de `db push` ao ignorar a migração de schema inicial e passar a versionar o `schema.sql` completo, evitando conflitos com bancos de dados já existentes.

## [0.1.16] - 2025-09-12

### Feat
- **pwa**: Adiciona a opção de atualizar o aplicativo mais tarde a partir da página de configurações, caso o usuário dispense o aviso de atualização.

## [0.1.15] - 2025-09-12

### Feat
- **layout**: Adiciona layout de duas colunas na página de lista de relatos para melhor aproveitamento de tela em dispositivos maiores.
- **layout**: Ajusta o espaçamento na página principal de relatos.

## [0.1.14] - 2025-09-11

### Fix
- **pwa**: Corrige o comportamento de instalação do PWA, garantindo que o aplicativo seja adicionado à tela inicial como um app de tela cheia (standalone) em vez de um atalho de navegador.

## [0.1.13] - 2025-09-11

### Feat
- **settings**: Re-introduces the "About" section in the settings page, displaying the application version, build date, and a link to the changelog.

## [0.1.12] - 2025-09-10

### Refactor
- **onesignal**: Centraliza toda a lógica de ciclo de vida do OneSignal (inicialização, login/logout de usuário) em um hook dedicado `useOneSignal`. Isso corrige bugs de múltiplas inicializações e garante uma arquitetura mais robusta e estável para o sistema de notificações.

## [0.1.11] - 2025-09-10

### Fix
- **onesignal**: Refatora completamente a integração com o OneSignal para maior robustez, adicionando timeouts, tratamento de erros aprimorado e um botão de depuração para forçar a reinicialização. A inicialização agora é feita sob demanda para melhorar o desempenho.

## [1.1.2] - 2025-09-09

### Fixes
- **notificações**: Limpa `user_id` do OneSignal no logout para evitar receber notificações de outro usuário.
- **UI**: Garante que o foco do teclado não seja visível em elementos não interativos no modo mobile.

## [1.1.1] - 2025-09-09

### Fixes
- **notificações**: Corrige a lógica de limpeza de notificações, removendo tabelas e funções obsoletas do Supabase para uma gestão mais limpa e centralizada através de uma única tabela `notifications`.

## [1.1.0] - 2025-09-08

### Features
- **Notificações**: Adiciona uma nova página de "Notificações" que exibe um histórico de todas as notificações recebidas pelo usuário, com suporte para paginação.

### Fixes
- **Navegação**: Corrige o bug que impedia o menu inferior de ser exibido em telas maiores que `sm` (640px), garantindo que ele apareça corretamente em tablets e dispositivos com telas maiores.

## [1.0.0] - 2025-09-05

Lançamento inicial do SGI Copa.
