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