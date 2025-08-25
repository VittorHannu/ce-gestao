-- Populando a tabela de documentação com o conteúdo da Pirâmide de Bird
INSERT INTO documentacao (section_key, title, content, meta)
VALUES
    ('pyramid_level_1', 'Fatal', 'Ocorrências que resultam em fatalidade.', '{"color": "bg-black", "value": 0}'),
    ('pyramid_level_2', 'Severo', 'Ocorrências com lesões graves e danos significativos.', '{"color": "bg-red-600", "value": 0}'),
    ('pyramid_level_3', 'Acidente com afastamento', 'Acidentes que requerem afastamento do trabalho para recuperação.', '{"color": "bg-red-500", "value": 5}'),
    ('pyramid_level_4', 'Acidentes sem afastamento', 'Acidentes que são tratados, mas não impedem a continuidade no trabalho.', '{"color": "bg-orange-500", "value": 15}'),
    ('pyramid_level_5', 'Primeiros socorros', 'Incidentes menores que requerem apenas primeiros socorros no local.', '{"color": "bg-yellow-500", "value": 50}'),
    ('pyramid_level_6', 'Quase acidente', 'Eventos que não resultaram em lesão ou dano, mas tinham o potencial para tal.', '{"color": "bg-yellow-400", "value": 150}'),
    ('pyramid_level_7', 'Condição insegura', 'Condições no ambiente de trabalho que podem levar a um acidente.', '{"color": "bg-sky-400", "value": 500}'),
    ('pyramid_level_8', 'Comportamento inseguro', 'Ações ou desvios de procedimentos que aumentam o risco de acidentes.', '{"color": "bg-sky-500", "value": 1000}')
ON CONFLICT (section_key) DO NOTHING;

-- Populando a tabela de documentação com o conteúdo do Fluxo do Relato
INSERT INTO documentacao (section_key, title, content)
VALUES
    ('fluxo_step_1', '1. Criação do Relato', 'O processo começa com o registro da ocorrência por qualquer colaborador, de forma rápida e intuitiva, diretamente pelo celular ou computador. É possível anexar fotos para detalhar a situação, garantindo que nenhuma informação importante seja perdida.'),
    ('fluxo_step_2', '2. Triagem e Atribuição', 'O relato é recebido instantaneamente pela equipe de gestão, que realiza a triagem inicial. O gestor responsável pode então aprovar, reprovar ou atribuir a ocorrência a um membro da equipe para investigação e resolução, tudo dentro da plataforma.'),
    ('fluxo_step_3', '3. Resolução e Feedback', 'O responsável pela ação executa o plano de correção. Após a resolução, o status do relato é atualizado, e o sistema notifica o colaborador que criou o relato, fechando o ciclo de comunicação e garantindo transparência.'),
    ('fluxo_step_4', '4. Análise e Auditoria', 'Todos os passos do processo são registrados em um log detalhado, criando uma trilha de auditoria completa. Os dados de todos os relatos alimentam dashboards que permitem análises aprofundadas, identificando tendências e ajudando na prevenção de futuros incidentes.')
ON CONFLICT (section_key) DO NOTHING;