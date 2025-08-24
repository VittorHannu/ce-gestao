# Guia do Desenvolvedor: Projeto Relatos Supabase

## 1. Introdução

Olá! Este documento é o seu manual de operações e guia de referência técnica para o projeto `relatos-supabase`. O objetivo não é simplificar a ponto de esconder os conceitos, mas sim **explicar a parte técnica de forma clara**, para que você tenha total confiança para gerenciar e evoluir o sistema.

---

## 2. Os Dois Mundos: Desenvolvimento vs. Produção

Este é o conceito mais importante para a segurança e estabilidade do projeto.

*   **Ambiente de Produção (Production):**
    *   **O que é:** É o sistema "real", "ao vivo", que seus colegas de trabalho usam todos os dias. Ele roda na internet, hospedado na Vercel (o site) e na Supabase (o banco de dados e a lógica).
    *   **URL:** `https://relatos.copaenergia.com.br` (exemplo)
    *   **Regra de Ouro:** Nunca, jamais, fazemos alterações ou testes diretamente no ambiente de produção. Qualquer erro aqui afeta os usuários reais imediatamente.

*   **Ambiente de Desenvolvimento (Development):**
    *   **O que é:** É uma cópia completa e segura do sistema que roda **exclusivamente no seu computador**. Foi isso que acabamos de configurar com `supabase start`. Ele tem seu próprio banco de dados, sua própria autenticação, tudo isolado do mundo real.
    *   **URL:** `http://localhost:5173` (para o site) e `http://127.0.0.1:54321` (para o painel do Supabase local). `localhost` e `127.0.0.1` são nomes universais para "este computador".
    *   **Finalidade:** É o nosso "laboratório". Aqui podemos construir, quebrar, testar e experimentar à vontade, sem nenhum risco para o sistema principal.

---

## 3. Anatomia do Projeto: O que é Cada Pasta?

Seu projeto é um "monorepo", o que significa que o código do frontend (site) e a configuração do backend (Supabase) vivem juntos na mesma pasta principal.

*   `supabase/`: Contém toda a configuração do seu backend Supabase.
    *   `migrations/`: A pasta mais importante aqui. Guarda os arquivos `.sql` que são as "receitas" para construir ou alterar seu banco de dados. Cada arquivo é um passo na história da evolução do seu banco de dados.
    *   `functions/`: Onde ficam as "Edge Functions", pequenos pedaços de código (em TypeScript) que rodam no servidor da Supabase para tarefas especiais, como o `create-anonymous-relato`.
    *   `config.toml`: O arquivo de configuração principal da CLI do Supabase. Ele diz à CLI qual é o ID do seu projeto remoto, entre outras coisas.

*   `src/`: O coração do seu aplicativo React (o frontend).
    *   `main.jsx`: O ponto de entrada do seu aplicativo. É o primeiro arquivo que o navegador carrega.
    *   `App.jsx`: O componente principal que define a estrutura de rotas (quais páginas existem e seus URLs).
    *   `01-shared/`: Contém código que é compartilhado por todo o aplicativo (componentes de UI como botões, hooks personalizados, configuração do Supabase).
    *   `03-auth/`, `04-profile/`, `07-relatos/`: Estas pastas organizam o código por "feature" ou "domínio". É uma boa prática que mantém o projeto organizado. Todo o código relacionado a "relatos" fica dentro da pasta `07-relatos`.

*   `package.json`: A "carteira de identidade" do seu projeto.
    *   **O que é:** Um arquivo de manifesto no formato JSON.
    *   **O que faz:** Lista informações básicas (nome, versão) e, o mais importante, as **dependências** (`dependencies` e `devDependencies`).
    *   **Dependencies:** Bibliotecas que o seu app precisa para funcionar (ex: `react`, `supabase-js`).
    *   **DevDependencies:** Ferramentas que usamos apenas durante o desenvolvimento (ex: `eslint` para verificar a qualidade do código).

---

## 4. Como as Peças se Conectam (React + Supabase)

*   ### React (Frontend)
    *   **O que é:** Uma biblioteca JavaScript para construir a **interface de usuário (UI)**.
    *   **Componentes:** A ideia central do React. Cada arquivo `.jsx` é um **Componente**, um bloco de construção de UI, como um "Lego". `RelatoCard.jsx` é um componente que exibe um resumo de um relato. Podemos reutilizá-lo para mostrar 1 ou 100 relatos.
    *   **Hooks:** Funções especiais que começam com `use` (ex: `useState`, `useEffect`). Eles permitem que os componentes tenham "memória" e "reajam" a eventos.
        *   `useState`: Permite que um componente "lembre" de uma informação (ex: o texto que está sendo digitado em um campo de busca).
        *   `useEffect`: Permite que um componente "faça algo" quando uma informação muda (ex: buscar dados no Supabase quando a página carrega).
        *   **Custom Hooks:** Nós criamos nossos próprios hooks (ex: `useRelatoManagement`) para extrair e reutilizar a lógica complexa de um componente, mantendo o código mais limpo.

*   ### Supabase (Backend)
    *   **O que é:** Uma plataforma de **Backend as a Service (BaaS)**. "Backend" é o servidor, a parte que o usuário não vê. Supabase nos dá um backend pronto para usar.
    *   **Banco de Dados (PostgreSQL):** Onde os dados (usuários, relatos, etc.) são armazenados de forma segura e estruturada em tabelas.
    *   **Auth (GoTrue):** O serviço que cuida de tudo relacionado a autenticação: login, cadastro, troca de senha, permissões de usuário.
    *   **API (PostgREST):** O Supabase cria automaticamente uma **API** sobre o seu banco de dados. Uma **API (Application Programming Interface)** é um "cardápio" de comandos que o nosso frontend (React) pode usar para se comunicar com o backend (Supabase). É como o nosso app pede para "buscar todos os relatos" ou "inserir um novo usuário". A biblioteca `supabase-js` que usamos no React é uma ferramenta que facilita fazer esses "pedidos" à API.

---

## 5. O Fluxo de Trabalho Seguro (Passo a Passo)

Este é o processo que você deve seguir para **qualquer** alteração, seja corrigir um texto ou criar uma funcionalidade nova.

**Fase 1: Preparação Local**

1.  **Abra o Docker Desktop:** Garanta que o aplicativo esteja rodando.
2.  **Inicie o Ambiente Supabase:** No terminal, execute `supabase start`. Isso liga seu "servidor" local.

**Fase 2: Desenvolvimento e Teste**

3.  **Conecte o App ao Ambiente Local:** O app já está configurado para usar o arquivo `.env`, que aponta para o seu ambiente local.
4.  **Inicie o App React:** No terminal, execute `pnpm run dev`. Para testar em outros dispositivos (como seu celular), use `pnpm run dev -- --host`.
5.  **Faça a Alteração:**
    *   **Alteração Visual/Lógica:** Modifique os arquivos `.jsx` no seu editor de código. Salve e veja a mudança no navegador instantaneamente.
    *   **Alteração no Banco de Dados:**
        *   **NUNCA** use o Studio local (`http://127.0.0.1:54321`) para fazer alterações de estrutura (criar tabelas/colunas).
        *   **O Jeito Certo:** Crie uma nova migração. No terminal, execute: `supabase migration new o_nome_da_sua_alteracao` (ex: `cria_tabela_documentos`).
        *   Isso cria um novo arquivo `.sql` na pasta `migrations/`. Você edita este arquivo com os comandos SQL para fazer a alteração.
        *   Para aplicar a alteração no seu banco local, rode `supabase db push`.

6.  **Teste Exaustivamente:** Clique em tudo, preencha formulários, navegue pelas páginas. Garanta que sua alteração funciona e que você não quebrou nada que já existia.

**Fase 3: Salvando e Publicando**

7.  **Pare os Processos:** No terminal, pressione `Ctrl + C` para parar o app React. Depois, execute `supabase stop` para desligar o ambiente Supabase.
8.  **Salve no Histórico (Git):**
    *   Eu (Gemini) farei isso por você, mas o processo é:
    *   `git add .`: Adiciona todas as suas alterações para serem "salvas".
    *   `git commit -m "feat: Descreve a alteração feita"`: Cria um "ponto de salvamento" (commit) com uma mensagem clara.
9.  **Publique as Alterações:**
    *   **Frontend (Vercel):** Quando o `commit` é enviado para o repositório online (GitHub), a Vercel automaticamente percebe a mudança e atualiza o site.
    *   **Backend (Supabase):** As alterações de banco de dados (migrações) precisam ser aplicadas manualmente no painel da Supabase online. Este é um passo deliberadamente manual para garantir a segurança.

---

## 6. Conectando o App ao Ambiente Local

Para que seu aplicativo React (frontend) saiba como encontrar seu servidor Supabase (backend) local, usamos **Variáveis de Ambiente**.

*   **O que são:** São variáveis de configuração que não ficam salvas diretamente no código. Elas são armazenadas em um arquivo especial que só existe no seu computador, permitindo que o mesmo código se comporte de maneiras diferentes no ambiente de desenvolvimento e no de produção.
*   **Nosso Arquivo `.env`:** Nós criamos um arquivo chamado `.env` na raiz do projeto com o seguinte conteúdo:
    ```
    VITE_SUPABASE_URL=http://127.0.0.1:8000
    VITE_SUPABASE_ANON_KEY=... (uma chave longa e secreta)
    ```
*   **Como o Vite Usa:** O Vite, nosso "motor" do React, automaticamente lê este arquivo. Qualquer variável que comece com o prefixo `VITE_` se torna acessível no código do nosso frontend através de `import.meta.env.VITE_NOME_DA_VARIAVEL`.
*   **Segurança com `.gitignore`:** O arquivo `.env` contém chaves de acesso. Mesmo sendo locais, é uma regra de ouro nunca enviá-las para o repositório Git. O arquivo `.gitignore` do nosso projeto já está configurado para ignorar todos os arquivos `.env`, garantindo essa segurança.

---

## 7. Populando seu Banco de Dados Local (Seeding)

Quando o Supabase cria seu banco de dados local, ele cria apenas a **estrutura** (as tabelas, colunas, etc.), mas não os **dados**. Seu banco de dados começa vazio. Para trabalhar, precisamos de dados de teste, como usuários e relatos.

*   ### Alerta de Segurança: Por que NUNCA usar dados reais?
    A tentação de usar uma cópia dos dados de produção é grande, mas esta é uma **prática extremamente perigosa**:
    1.  **Privacidade e Segurança:** Expor dados reais de usuários e da operação em uma máquina de desenvolvimento é uma falha grave de segurança e uma quebra de confiança.
    2.  **Risco de Erros:** Aumenta drasticamente a chance de executar um comando destrutivo no banco de dados errado (o de produção).
    3.  **Conformidade (LGPD):** Viola leis de proteção de dados.

*   ### O Padrão Profissional: O Script de "Seed"
    A maneira correta é criar um conjunto de dados **realistas, porém falsos**. Fazemos isso com um script de "seed".
    *   **O Arquivo `supabase/seed.sql`:** Nós criamos este arquivo e escrevemos comandos SQL para inserir dados falsos.
    *   **O que o nosso `seed.sql` faz:**
        1.  Cria dois usuários: `admin@local.com` e `user@local.com` (senha para ambos: `123456`).
        2.  Define permissões de administrador para o usuário admin.
        3.  Cria dois relatos de exemplo para que o aplicativo não pareça vazio.
    *   **Como Funciona:** Toda vez que você executa `supabase start`, ele automaticamente executa o `seed.sql` e popula seu banco de dados local.

---

## 8. Gerenciando o Ambiente Docker

A CLI do Supabase usa o Docker por baixo dos panos para criar e gerenciar seu ambiente local.

*   ### O que são os "Volumes" do Docker?
    Pense em um **Volume** como um **"HD externo"** para seu banco de dados local.
    *   Quando você executa `supabase stop`, o "computador" (container) do banco de dados é desligado.
    *   No entanto, os dados são preservados nesse "HD externo" (o volume).
    *   Isso é ótimo, pois permite que você pare de trabalhar e, ao retornar e rodar `supabase start`, seus dados de teste (usuários, relatos) ainda estão lá.

*   ### Você Precisa Limpar o Docker a Cada Reinício?
    **Não.** Para o trabalho diário de parar e iniciar o ambiente, você não precisa limpar nada.

*   ### Quando e Como Fazer uma Limpeza Completa?
    Você só precisa fazer uma limpeza completa se quiser **destruir permanentemente** seu banco de dados local e começar do zero (por exemplo, se ele se corromper ou se você quiser testar o `seed.sql` do início).
    *   **Comando:** `supabase stop --no-backup`
    *   **Atenção:** Este comando apaga todos os dados do seu banco de dados local sem criar um backup. Use com cuidado.

---

## 9. FAQ e Boas Práticas

*   ### `pnpm run dev` vs. `pnpx vite`
    Ambos os comandos podem iniciar seu servidor, mas `pnpm run dev` é a prática recomendada.
    *   **`pnpm run dev`:** Executa o atalho `dev` definido no `package.json`. Esta é a forma padrão de interagir com projetos, pois abstrai a ferramenta subjacente. Se um dia mudarmos o `vite` para outra ferramenta, o comando para você continua o mesmo.
    *   **`pnpx vite`:** Executa a ferramenta `vite` diretamente. Funciona, mas ignora os scripts padrão do projeto.

*   ### Como Testar no Celular?
    Para acessar o site do seu computador em outros dispositivos na mesma rede Wi-Fi:
    *   **Comando:** `pnpm run dev -- --host`
    *   **O que faz:** O argumento `--host` expõe seu servidor de desenvolvimento na sua rede local.
    *   **Como usar:** O terminal irá te fornecer uma URL de `Network` (algo como `http://192.168.1.X:5173`). Use essa URL no navegador do seu celular.
