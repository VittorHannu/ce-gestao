agora o seguinte. eu preciso que os itens fiquem na ordem e possam ter a ordem alterada por um sistema arrasta e   │
│    solta                                                                                                              │
╰───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────╯

✦ Ok, o usuário quer reordenar itens de classificação com arrastar e soltar.

  Plano:

   1. Banco de Dados: Adicionarei uma coluna ordem às tabelas de classificação via nova migração.
   2. Backend: Atualizarei o serviço getClassifications para ordenar por ordem e criarei uma função para atualizar a ordem de
      múltiplos itens.
   3. Frontend (dnd-kit): Verificarei se a biblioteca dnd-kit existe no projeto; se não, a instalarei.
   4. Implementação no Frontend:
       * Em ClassificationTableManager.jsx, usarei o dnd-kit para tornar as linhas da tabela arrastáveis.
       * O evento onDragEnd irá disparar uma mutação para salvar a nova ordem no banco de dados e atualizar a UI.

  Começarei verificando o package.json pela dnd-kit e, em seguida, criarei a migração do banco de dados.
 ╭───────────────────────────╮
 │ ✔  ReadFile package.json  │
 ╰───────────────────────────╯
✦ dnd-kit não está no package.json. Vou instalar @dnd-kit/core e @dnd-kit/sortable com pnpm add.
 ╭────────────────────────────────────────────────────────────────────────────────────────────────────────────────────╮
 │ ✔  Shell pnpm add @dnd-kit/core @dnd-kit/sortable (Installing dnd-kit libraries for drag-and-drop functionality.)  │
 │                                                                                                                    │
 │    Progress: resolved 0, reused 1, downloaded 0, added 0                                                           │
 │     WARN  deprecated @supabase/auth-helpers-react@0.5.0: This package is now deprecated - please use the           │
 │    @supabase/ssr package instead.                                                                                  │
 │                                                                                                                    │
 │       ╭───────────────────────────────────────────────────────────────────╮                                        │
 │       │                                                                   │                                        │
 │       │                Update available! 10.4.1 → 10.16.1.                │                                        │
 │       │   Changelog: https://github.com/pnpm/pnpm/releases/tag/v10.16.1   │                                        │
 │       │            Run "corepack use pnpm@10.16.1" to update.             │                                        │
 │       │                                                                   │                                        │
 │       ╰───────────────────────────────────────────────────────────────────╯                                        │
 │                                                                                                                    │
 │    Progress: resolved 463, reused 401, downloaded 2, added 0                                                       │
 │    Progress: resolved 765, reused 696, downloaded 4, added 0                                                       │
 │    Progress: resolved 867, reused 798, downloaded 4, added 0                                                       │
 │    Progress: resolved 908, reused 839, downloaded 4, added 0                                                       │
 │     WARN  5 deprecated subdependencies found: glob@7.2.3, inflight@1.0.6, node-domexception@1.0.0,                 │
 │    source-map@0.8.0-beta.0, sourcemap-codec@1.4.8                                                                  │
 │    Packages: +4                                                                                                    │
 │    ++++                                                                                                            │
 │    Progress: resolved 908, reused 839, downloaded 4, added 4, done                                                 │
 │     WARN  Failed to create bin at /Users/adm/Documents/ce-gestao/node_modules/.bin/supabase. ENOENT: no such       │
 │    file or directory, open                                                                                         │
 │    '/Users/adm/Documents/ce-gestao/node_modules/.pnpm/supabase@2.40.7/node_modules/supabase/bin/supabase'          │
 │     WARN  Issues with peer dependencies found                                                                      │
 │    .                                                                                                               │
 │    └─┬ react-day-picker 8.10.1                                                                                     │
 │      ├── ✕ unmet peer date-fns@"^2.28.0 || ^3.0.0": found 4.1.0                                                    │
 │      └── ✕ unmet peer react@"^16.8.0 || ^17.0.0 || ^18.0.0": found 19.1.1                                          │
 │                                                                                                                    │
 │    dependencies:                                                                                                   │
 │    + @dnd-kit/core 6.3.1                                                                                           │
 │    + @dnd-kit/sortable 10.0.0                                                                                      │
 │                                                                                                                    │
 │    Done in 4.8s using pnpm v10.4.1                                                                                 │
 │                                                                                                                    │
 ╰────────────────────────────────────────────────────────────────────────────────────────────────────────────────────╯
✦ Ok, drag-and-drop. dnd-kit instalado. Agora, a migração do banco: adicionar a coluna ordem às tabelas de classificação.
  Para isso, vou ler src/05-adm/pages/GerenciarClassificacoesPage.jsx e obter a lista de tabelas.
 ╭──────────────────────────────────────────────────────╮
 │ ✔  ReadFile ...src//GerenciarClassificacoesPage.jsx  │
 ╰──────────────────────────────────────────────────────╯
✦ Ok, tenho as tabelas de classificação. Vou criar a migração.
 ╭────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────╮
 │ ✔  Shell supabase migration new add_order_column_to_classifications (Creating a new database migration to add an 'ordem' … │
 │                                                                                                                            │
 │    Created new migration at supabase/migrations/20250914193753_add_order_column_to_classifications.sql                     │
 │                                                                                                                            │
 ╰────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────╯
✦ Criei o arquivo de migração supabase/migrations/20250914193753_add_order_column_to_classifications.sql. Agora, vou
  adicionar e popular a coluna ordem em todas as tabelas de classificação, ordenando inicialmente pelo nome. O SQL adiciona
  a coluna, preenche os valores e, em seguida, aplica a restrição NOT NULL. Vou gravar o conteúdo no arquivo de migração.
 ╭──────────────────────────────────────────────────────────────────────────────────────────────────────────────────╮
 │ ✔  WriteFile Writing to /20250914193753_add_order_column_to_classifications.sql                                  │
 │                                                                                                                  │
 │     1 -- Add 'ordem' column to all classification tables                                                         │
 │     2 ALTER TABLE public.classificacao_agentes ADD COLUMN ordem INTEGER;                                         │
 │     3 ALTER TABLE public.classificacao_tarefas ADD COLUMN ordem INTEGER;                                         │
 │     4 ALTER TABLE public.classificacao_equipamentos ADD COLUMN ordem INTEGER;                                    │
 │     5 ALTER TABLE public.classificacao_causas ADD COLUMN ordem INTEGER;                                          │
 │     6 ALTER TABLE public.classificacao_danos ADD COLUMN ordem INTEGER;                                           │
 │     7 ALTER TABLE public.classificacao_acoes_corretivas ADD COLUMN ordem INTEGER;                                │
 │     8 ALTER TABLE public.classificacao_riscos ADD COLUMN ordem INTEGER;                                          │
 │     9                                                                                                            │
 │    10 -- Populate the 'ordem' column based on the alphabetical order of 'nome'                                   │
 │    11 WITH ordered_agentes AS (                                                                                  │
 │    12   SELECT id, ROW_NUMBER() OVER (ORDER BY nome) as rn FROM public.classificacao_agentes                     │
 │    13 )                                                                                                          │
 │    14 UPDATE public.classificacao_agentes SET ordem = ordered_agentes.rn FROM ordered_agentes WHERE public       │
 │       .classificacao_agentes.id = ordered_agentes.id;                                                            │
 │    15                                                                                                            │
 │    16 WITH ordered_tarefas AS (                                                                                  │
 │    17   SELECT id, ROW_NUMBER() OVER (ORDER BY nome) as rn FROM public.classificacao_tarefas                     │
 │    18 )                                                                                                          │
 │    19 UPDATE public.classificacao_tarefas SET ordem = ordered_tarefas.rn FROM ordered_tarefas WHERE public       │
 │       .classificacao_tarefas.id = ordered_tarefas.id;                                                            │
 │    20                                                                                                            │
 │    21 WITH ordered_equipamentos AS (                                                                             │
 │    22   SELECT id, ROW_NUMBER() OVER (ORDER BY nome) as rn FROM public.classificacao_equipamentos                │
 │    23 )                                                                                                          │
 │    24 UPDATE public.classificacao_equipamentos SET ordem = ordered_equipamentos.rn FROM ordered_equipamentos     │
 │       WHERE public.classificacao_equipamentos.id = ordered_equipamentos.id;                                      │
 │    25                                                                                                            │
 │    26 WITH ordered_causas AS (                                                                                   │
 │    27   SELECT id, ROW_NUMBER() OVER (ORDER BY nome) as rn FROM public.classificacao_causas                      │
 │    28 )                                                                                                          │
 │    29 UPDATE public.classificacao_causas SET ordem = ordered_causas.rn FROM ordered_causas WHERE public          │
 │       .classificacao_causas.id = ordered_causas.id;                                                              │
 │    30                                                                                                            │
 │    31 WITH ordered_danos AS (                                                                                    │
 │    32   SELECT id, ROW_NUMBER() OVER (ORDER BY nome) as rn FROM public.classificacao_danos                       │
 │    33 )                                                                                                          │
 │    34 UPDATE public.classificacao_danos SET ordem = ordered_danos.rn FROM ordered_danos WHERE public             │
 │       .classificacao_danos.id = ordered_danos.id;                                                                │
 │    35                                                                                                            │
 │    36 WITH ordered_acoes_corretivas AS (                                                                         │
 │    37   SELECT id, ROW_NUMBER() OVER (ORDER BY nome) as rn FROM public.classificacao_acoes_corretivas            │
 │    38 )                                                                                                          │
 │    39 UPDATE public.classificacao_acoes_corretivas SET ordem = ordered_acoes_corretivas.rn FROM                  │
 │       ordered_acoes_corretivas WHERE public.classificacao_acoes_corretivas.id = ordered_acoes_corretivas.id;     │
 │    40                                                                                                            │
 │    41 WITH ordered_riscos AS (                                                                                   │
 │    42   SELECT id, ROW_NUMBER() OVER (ORDER BY nome) as rn FROM public.classificacao_riscos                      │
 │    43 )                                                                                                          │
 │    44 UPDATE public.classificacao_riscos SET ordem = ordered_riscos.rn FROM ordered_riscos WHERE public          │
 │       .classificacao_riscos.id = ordered_riscos.id;                                                              │
 │    45                                                                                                            │
 │    46 -- Add NOT NULL constraint now that the column is populated                                                │
 │    47 ALTER TABLE public.classificacao_agentes ALTER COLUMN ordem SET NOT NULL;                                  │
 │    48 ALTER TABLE public.classificacao_tarefas ALTER COLUMN ordem SET NOT NULL;                                  │
 │    49 ALTER TABLE public.classificacao_equipamentos ALTER COLUMN ordem SET NOT NULL;                             │
 │    50 ALTER TABLE public.classificacao_causas ALTER COLUMN ordem SET NOT NULL;                                   │
 │    51 ALTER TABLE public.classificacao_danos ALTER COLUMN ordem SET NOT NULL;                                    │
 │    52 ALTER TABLE public.classificacao_acoes_corretivas ALTER COLUMN ordem SET NOT NULL;                         │
 │    53 ALTER TABLE public.classificacao_riscos ALTER COLUMN ordem SET NOT NULL;                                   │
 ╰──────────────────────────────────────────────────────────────────────────────────────────────────────────────────╯
✦ Criei a migração, agora vou aplicá-la ao banco de dados local com supabase migration up, como o usuário prefere.
 ╭──────────────────────────────────────────────────────────────────────────────────────────────────────────────────╮
 │ ✔  Shell supabase migration up (Applying the new migration to the local database.)                               │
 │                                                                                                                  │
 │    Local database is up to date.                                                                                 │
 │                                                                                                                  │
 │    Connecting to local database...                                                                               │
 │    Applying migration 20250914193753_add_order_column_to_classifications.sql...                                  │
 │                                                                                                                  │
 ╰──────────────────────────────────────────────────────────────────────────────────────────────────────────────────╯
✦ Migração concluída. Agora, atualizarei o backend para usar a nova coluna ordem. Primeiro, em classificationService.js,
  modificarei getClassifications para ordenar por ordem e criarei updateClassificationOrder para atualizações em lote.
  Depois, em useClassifications.js, adicionarei a mutação updateOrderMutation. Começando com a leitura de
  classificationService.js.
 ╭───────────────────────────────────────────────────────╮
 │ ✔  ReadFile ...src/services/classificationService.js  │
 ╰───────────────────────────────────────────────────────╯
✦ Vou modificar classificationService.js. Em getClassifications, mudarei a ordenação para a coluna ordem. Adicionarei a
  função updateClassificationOrder que, para simplificar e evitar nova migração, iterará sobre os itens, atualizando a ordem
  de cada um individualmente com Promise.all. Aplicarei estas alterações agora.
 ╭───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────╮
 │ ✔  Edit ...src/services/classificationService.js: export const getClassification... => export const getClassification...  │
 │                                                                                                                           │
 │    13    * @returns {Promise<Array>} - A promise that resolves to an array of items.                                      │
 │    14    */                                                                                                               │
 │    15   export const getClassifications = async (tableName) => {                                                          │
 │    16 -   const { data, error } = await supabase.from(tableName).select('*').order('nome', { ascending: true              │
 │       });                                                                                                                 │
 │    16 +   const { data, error } = await supabase.from(tableName).select('*').order('ordem', { ascending: true             │
 │       });                                                                                                                 │
 │    17     handleSupabaseError(error);                                                                                     │
 │    18     return data;                                                                                                    │
 │    19   };                                                                                                                │
 ╰───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────╯
✦ getClassifications atualizado. Agora, adicionarei a função updateClassificationOrder.
 ╭───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────╮
 │ ✔  Edit ...src/services/classificationService.js: export const deleteClassificat... => export const deleteClassificat...  │
 │                                                                                                                           │
 │    53     const { error } = await supabase.from(tableName).delete().eq('id', id);                                         │
 │    54     handleSupabaseError(error);                                                                                     │
 │    55   };                                                                                                                │
 │    56 +                                                                                                                   │
 │    57 + /**                                                                                                               │
 │    58 +  * Updates the order of multiple items in a classification table.                                                 │
 │    59 +  * @param {string} tableName - The name of the classification table.                                              │
 │    60 +  * @param {Array<{id: number, ordem: number}>} items - An array of items with their new order.                    │
 │    61 +  * @returns {Promise<void>}                                                                                       │
 │    62 +  */                                                                                                               │
 │    63 + export const updateClassificationOrder = async (tableName, items) => {                                            │
 │    64 +   const updates = items.map(item =>                                                                               │
 │    65 +     supabase.from(tableName).update({ ordem: item.ordem }).eq('id', item.id)                                      │
 │    66 +   );                                                                                                              │
 │    67 +   const results = await Promise.all(updates);                                                                     │
 │    68 +   results.forEach(result => handleSupabaseError(result.error));                                                   │
 │    69 +   return results;                                                                                                 │
 │    70 + };                                                                                                                │
 ╰───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────╯
✦ Ok, serviço atualizado. Agora, no useClassifications.js, vou importar updateClassificationOrder, criar e exportar uma nova
  useMutation chamada updateOrderMutation que a utilize, e configurar um onSuccess para invalidar a query ['classifications',
   tableName]. Começando pela leitura do arquivo.
 ╭────────────────────────────────────────────────────────╮
 │ ✔  ReadFile ...src/05-adm/hooks/useClassifications.js  │