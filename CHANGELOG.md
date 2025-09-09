# Histórico de Versões - SGI Copa

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
