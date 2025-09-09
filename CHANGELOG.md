# Histórico de Versões - SGI Copa

## [0.1.6] - 2025-09-09

### 🐛 Correções

*   **Persistência de Login no PWA (Tentativa Definitiva)**: Remove completamente a regra de cache do Service Worker para a API do Supabase. Esta é uma medida mais agressiva para garantir que respostas de autenticação nunca sejam servidas do cache, resolvendo o problema de o usuário ser deslogado ao reabrir o app.

---

## [0.1.5] - 2025-09-09

### 🐛 Correções

*   **Persistência de Login no PWA**: Corrige um erro crítico onde a sessão do usuário não era mantida ao fechar e reabrir o PWA. A política de cache do Service Worker foi ajustada para não armazenar em cache as respostas da API de autenticação do Supabase, garantindo que o status de login seja sempre verificado corretamente.

---

## [0.1.4] - 2025-09-09

### 🐛 Correções

*   **Conflito de Service Worker**: Resolvido um conflito entre o service worker do `vite-plugin-pwa` e o do OneSignal, que impedia o registro correto do OneSignal e a entrega de notificações. A configuração do PWA agora ignora explicitamente os arquivos do OneSignal.
*   **Robustez da Integração**: A lógica de login e logout do OneSignal agora utiliza a fila de comandos (`OneSignal.push`), garantindo que a associação do ID do usuário ocorra de forma segura e no momento correto, mesmo em condições de carregamento lento do SDK.

---

## [0.1.3] - 2025-09-09

### 🐛 Correções

*   **Entrega de Notificações Push**: Corrige a falha na entrega de notificações push no dispositivo. A lógica de autenticação agora associa o `user_id` do Supabase ao `external_user_id` do OneSignal no momento do login, garantindo que o OneSignal saiba para qual dispositivo enviar o push de um usuário específico.

---

## [0.1.2] - 2025-09-09

### ✨ Funcionalidades

*   **Notificações Push Automatizadas**: Implementado sistema de notificações push via OneSignal. Novas notificações inseridas na base de dados agora disparam automaticamente um push para o usuário correspondente através de uma Edge Function, criando um sistema de notificação em tempo real e persistente.

---

## [0.1.1] - 09/09/2025

### 🐛 Correções

*   Corrigido um aviso no console do React relacionado ao componente `SettingsItem`. O componente foi refatorado para ser mais flexível, evitando que propriedades inválidas sejam passadas para elementos DOM.

---

## [0.1.0] - 08/09/2025

### ✨ Funcionalidades

*   **Página de Apresentação**: Criação de uma página de apresentação interativa para a matriz, detalhando a história, design e conceitos do projeto SGI Copa.
*   **Página de Histórico de Versões**: Adicionada esta página para que os usuários possam acompanhar as novidades e melhorias a cada nova versão do aplicativo.

### 🐛 Correções

*   Correções gerais de performance e estabilidade.

### ⚙️ Melhorias

*   Melhoria no sistema de notificações push para garantir entrega mais confiável.