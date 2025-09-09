# Histórico de Versões - SGI Copa

## [0.1.7] - 2025-09-09

### 🐛 Correções

*   **Erros de Console**: Corrigido um conjunto de erros e warnings que apareciam no console do navegador:
    *   Removida a tentativa de registro de um Service Worker inexistente que causava um `SecurityError`.
    *   Ajustada a inicialização do OneSignal para ocorrer apenas uma vez, eliminando avisos de duplicação.
    *   Refatorado o componente `SettingsGroup` para evitar que a prop `isLast` fosse passada para elementos DOM inválidos, resolvendo um warning comum do React.

## [0.1.4] - 2025-09-09

### 🐛 Correções

*   **Console de Depuração**: Corrigido o problema onde o console de depuração (Eruda) não era desativado corretamente ao desativar o toggle. A lógica de destruição da instância do Eruda foi ajustada para garantir seu correto desligamento.
*   **Importação de Componente Switch**: Corrigido o caminho de importação do componente `Switch` em `DebugSettings.jsx`.

## [0.1.3] - 2025-09-09

### 🐛 Correções

*   **Botão de Inscrição de Notificações**: Corrigido um bug onde o botão de inscrição/cancelamento de notificações ficava permanentemente no estado "Carregando". A lógica de verificação de status e gerenciamento de estado foi refatorada para ser mais robusta e baseada nos eventos do OneSignal, eliminando o comportamento inesperado.

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