# Relatos Supabase

Bem-vindo ao projeto **Relatos Supabase**! Este é um sistema de gestão interna desenvolvido para a Copa Energia, utilizando React no frontend, Supabase como backend (banco de dados, autenticação e armazenamento) e Vercel para deploy.

## Sobre o Projeto

Este sistema foi inicialmente desenvolvido com o auxílio de inteligência artificial e está em constante evolução para se tornar uma ferramenta robusta e organizada. Ele visa otimizar a gestão de:

- **Relatos de Segurança**: Gerenciamento de incidentes e ocorrências relacionadas à segurança.
- **Arquivo Morto**: Organização e controle de documentos arquivados.
- **Portaria**: Gestão de veículos, motoristas e logs de acesso.
- **Gerenciamento de Usuários**: Adição e exclusão de usuários, e gestão de permissões.

## Tecnologias Utilizadas

- **Frontend**: React.js (com Vite para desenvolvimento)
- **Estilização**: Tailwind CSS
- **Componentes UI**: Radix UI
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime)
- **Deploy**: Vercel
- **Gerenciador de Pacotes**: pnpm

## Como Configurar e Rodar o Projeto Localmente

Siga os passos abaixo para ter o projeto funcionando em sua máquina:

### 1. Pré-requisitos

Certifique-se de ter instalado em sua máquina:

- [Node.js](https://nodejs.org/en/download/) (versão LTS recomendada)
- [pnpm](https://pnpm.io/installation) (gerenciador de pacotes)
- Uma conta no [Supabase](https://supabase.com/) e um projeto configurado.
- Uma conta no [Vercel](https://vercel.com/) (opcional, para deploy).

### 2. Clonar o Repositório

```bash
git clone <URL_DO_SEU_REPOSITORIO>
cd relatos-supabase
```

### 3. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto (na mesma pasta onde está o `package.json`) e adicione as seguintes variáveis, substituindo pelos seus dados do Supabase:

```env
VITE_SUPABASE_URL=SUA_URL_DO_PROJETO_SUPABASE
VITE_SUPABASE_ANON_KEY=SUA_CHAVE_ANON_PUBLIC_SUPABASE
SUPABASE_SERVICE_ROLE_KEY=SUA_CHAVE_SERVICE_ROLE_SUPABASE # Apenas para funções serverless, NUNCA exponha no frontend!
```

- Você pode encontrar `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` no painel do Supabase, em `Settings > API`.
- A `SUPABASE_SERVICE_ROLE_KEY` é uma chave poderosa. Use-a com extrema cautela e apenas em ambientes seguros (como funções serverless no Vercel, como já está configurado no seu projeto).

### 4. Instalar Dependências

```bash
pnpm install
```

### 5. Rodar o Projeto

Para iniciar o servidor de desenvolvimento:

```bash
pnpm run dev
```

O aplicativo estará disponível em `http://localhost:5173` (ou outra porta, se 5173 estiver em uso).

### 6. Build para Produção

Para gerar uma versão otimizada para produção:

```bash
pnpm run build
```

Os arquivos de produção serão gerados na pasta `dist/`.

### 7. Linting (Verificação e Correção de Estilo de Código)

Este projeto utiliza [ESLint](https://eslint.org/) para manter a consistência do código e identificar problemas. Para verificar e corrigir automaticamente problemas de estilo e potenciais erros:

```bash
pnpm run lint -- --fix
```

**É altamente recomendado rodar este comando antes de cada commit** para garantir que seu código siga os padrões do projeto e para manter a base de código limpa e organizada. Isso é crucial para a colaboração e a manutenção a longo prazo.

### 8. Testes

Este projeto utiliza [Vitest](https://vitest.dev/) para testes automatizados. Para rodar os testes existentes:

```bash
pnpm test
```

Mais informações sobre como escrever novos testes e expandir a cobertura serão adicionadas aqui em breve.

## Estrutura do Projeto

```
/relatos-supabase/
├───.env
├───package.json
├───pnpm-lock.yaml
├───vite.config.js
├───eslint.config.js
├───tailwind.config.js
├───src/
│   ├───App.jsx                 # Componente principal da aplicação
│   ├───main.jsx                # Ponto de entrada da aplicação
│   ├───core/                   # Componentes, hooks, layouts e utilitários compartilhados
│   │   ├───assets/
│   │   │   └───styles/         # Estilos globais (App.css, index.css)
│   │   ├───components/
│   │   │   ├───auth/
│   │   │   ├───common/
│   │   │   ├───routing/
│   │   │   └───ui/
│   │   ├───hooks/
│   │   ├───layouts/
│   │   └───lib/
│   │       └───utils/
│   ├───config/
│   │   └───tests/              # Configurações de teste (setupTests.js)
│   ├───features/               # Módulos de funcionalidades (sistemas)
│   │   ├───admin/              # Módulo de administração
│   │   │   ├───components/
│   │   │   ├───hooks/
│   │   │   ├───pages/
│   │   │   │   └───UserManagementPage.jsx
│   │   │   └───services/
│   │   ├───arquivoMorto/       # Módulo de Arquivo Morto
│   │   │   ├───components/
│   │   │   ├───hooks/
│   │   │   ├───pages/
│   │   │   ├───services/
│   │   ├───general/            # Funcionalidades gerais (ex: HomePage)
│   │   │   └───pages/
│   │   │       └───HomePage.jsx
│   │   ├───portaria/           # Módulo de Portaria
│   │   │   ├───components/
│   │   │   ├───hooks/
│   │   │   ├───pages/
│   │   │   │   ├───Portaria.jsx
│   │   │   │   ├───PortariaBloqueadosPage.jsx
│   │   │   │   ├───PortariaLogs.jsx
│   │   │   │   ├───PortariaMotoristasPage.jsx
│   │   │   │   └───PortariaVeiculosPage.jsx
│   │   │   └───services/
│   │   ├───relatos/            # Módulo de Relatos
│   │   │   ├───components/
│   │   │   ├───hooks/
│   │   │   ├───pages/
│   │   │   │   ├───RelatoPage.jsx
│   │   │   │   ├───RelatosPorStatusPage.jsx
│   │   │   │   ├───RelatosSeguranca.jsx
│   │   │   │   └───RelatosTodosPage.jsx
│   │   │   └───services/
│   │   └───user/               # Módulo de usuário
│   │       ├───pages/
│   │       │   ├───ForcePasswordChangePage.jsx
│   │       │   ├───ProfilePage.jsx
│   │       │   └───UpdatePasswordPage.jsx
│   │       ├───components/
│   │       ├───hooks/
│   │       └───services/
└───supabase/                   # Funções e APIs do Supabase
    ├───api/
    │   └───create-user.js
    └───functions/              # Edge Functions do Supabase
        └───delete-user/
            └───index.ts
```

## Guia para Colaboradores (Não Desenvolvedores)

Este projeto foi construído com a sua facilidade em mente! Entendemos que você não tem conhecimento em programação, e é por isso que organizamos tudo para ser o mais simples e claro possível.

### Por que a estrutura do projeto mudou?

Recentemente, fizemos uma grande organização interna no código. Pense nisso como arrumar uma casa: antes, as coisas estavam um pouco espalhadas, e agora, cada tipo de item tem seu lugar específico.

*   **Tudo no seu lugar**: Agora, funcionalidades como "Portaria", "Relatos" e "Arquivo Morto" têm suas próprias "caixas" (pastas), onde guardamos tudo o que pertence a elas (componentes visuais, lógicas, etc.).
*   **Ferramentas Comuns Separadas**: As ferramentas e peças que são usadas em *várias* partes do projeto (como botões, menus, ou a forma de se conectar ao Supabase) foram para uma "caixa de ferramentas central" (`src/core`). Isso evita bagunça e facilita a manutenção.

O objetivo é que o projeto seja mais fácil de entender, de encontrar as coisas e de crescer no futuro, mesmo sem você precisar entender os detalhes técnicos.

### Como enviar suas mudanças para o GitHub agora?

**Importante**: Como um agente de IA, eu sou responsável por gerenciar as operações Git (adicionar, commitar e, se solicitado, enviar as mudanças). Você só precisará seguir os passos abaixo se desejar fazer essas operações manualmente.

1.  **Abra o Terminal**: Navegue até a pasta principal do seu projeto (`relatos-supabase`) no Terminal.
    *   Você pode fazer isso digitando `cd /Users/adm/relatos-supabase` e apertando Enter.

2.  **Prepare suas mudanças**: Diga ao Git (a ferramenta que gerencia as mudanças) para "olhar" para tudo o que você mudou e preparar para enviar.
    ```bash
    git add .
    ```
    *   **O que isso faz**: É como colocar todas as suas alterações em uma "caixa de envio" virtual. O Git é inteligente e **não vai incluir** pastas grandes e desnecessárias como `node_modules` (suas ferramentas) ou `dist` (o aplicativo pronto), porque já configuramos ele para ignorar essas coisas.

3.  **Registre suas mudanças**: Dê um "nome" para o conjunto de mudanças que você fez. Isso é importante para você e para qualquer um que veja o histórico do projeto.
    ```bash
    git commit -m "Descreva aqui o que você mudou, de forma simples e clara."
    ```
    *   **Exemplo**: Se você corrigiu um texto na página inicial, poderia ser `git commit -m "Correção de texto na página inicial"`.
    *   **O que isso faz**: É como "fechar a caixa de envio" e colocar uma etiqueta nela com a descrição. Essa "caixa" agora está salva no histórico do Git no seu computador.

4.  **Envie para o GitHub**: Agora, mande suas mudanças do seu computador para o GitHub.
    ```bash
    git push
    ```
    *   **O que isso faz**: É como "enviar a caixa" para o GitHub. O GitHub vai receber suas mudanças e atualizar o projeto online. Se o Vercel estiver configurado para isso, ele automaticamente vai pegar essas mudanças e atualizar o aplicativo online.

**Lembre-se**: Você só precisa fazer esses 3 passos (`git add .`, `git commit -m "..."`, `git push`) sempre que quiser enviar suas alterações para o GitHub.

---

*Este README foi gerado com o auxílio do Gemini CLI agent.*