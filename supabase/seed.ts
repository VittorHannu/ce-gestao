import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import path from 'path';

// Carrega as variáveis de ambiente do arquivo .env na raiz do projeto
config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Supabase URL or Service Role Key is missing from .env file');
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const usersToCreate = [
  {
    email: 'admin@local.com',
    password: '123456',
    metaData: { full_name: 'Administrador Local' },
    permissions: {
      is_active: true,
      can_manage_relatos: true,
      can_view_users: true,
      can_create_users: true,
      can_delete_users: true,
      can_view_feedbacks: true,
      can_delete_relatos: true,
      can_manage_users: true,
      can_delete_any_comment: true,
      can_view_all_relatos: true
    }
  },
  {
    email: 'user@local.com',
    password: '123456',
    metaData: { full_name: 'Usuário Padrão Local' },
    permissions: { is_active: true } // Apenas ativo, sem permissões especiais
  }
];

async function main() {
  console.log('Iniciando script de seed...');

  let regular_user_id: string | null = null; // Declare aqui para ser acessível fora do loop

  for (const userData of usersToCreate) {
    console.log(`Criando usuário: ${userData.email}...`);

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true,
      user_metadata: userData.metaData
    });

    if (authError) {
      console.error(`Erro ao criar usuário ${userData.email} na autenticação:`, authError.message);
      continue;
    }

    const userId = authData.user.id;
    console.log(`Usuário ${userData.email} criado com ID: ${userId}`);

    // Lógica para inserir o perfil com permissões (para admin) ou apenas capturar o ID (para usuário padrão)
    if (userData.email === 'admin@local.com') {
      const { error: insertProfileError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          full_name: userData.metaData.full_name,
          email: userData.email,
          ...userData.permissions
        });

      if (insertProfileError) {
        console.error(`Erro ao inserir perfil para ${userData.email}:`, insertProfileError.message);
      } else {
        console.log(`Perfil e permissões inseridos para ${userData.email}.`);
      }
    } else { // Para o usuário padrão
      regular_user_id = userId; // Captura o ID do usuário padrão
      const { error: profileError } = await supabase
        .from('profiles')
        .update(userData.permissions)
        .eq('id', userId);

      if (profileError) {
        console.error(`Erro ao definir permissões para ${userData.email}:`, profileError.message);
      } else {
        console.log(`Permissões definidas para ${userData.email}.`);
      }
    }
  }

  // --- INÍCIO: Geração e Inserção de Relatos --- 
  if (regular_user_id) {
    console.log('Gerando e inserindo relatos de exemplo...');

    const locaisOcorrencia = [
      'Área de Carga e Descarga',
      'Escritório Administrativo - 3º Andar',
      'Linha de Produção B - Máquina 05',
      'Refeitório - Cozinha',
      'Portaria Principal',
      'Almoxarifado Central',
      'Setor de Manutenção',
      'Pátio de Manobras',
      'Sala de Reuniões',
      'Laboratório de Qualidade',
    ];

    const tiposRelato = [
      'Ato Inseguro',
      'Condição Insegura',
      'Quase Acidente',
      'Acidente',
      'Ideia de Melhoria',
      'Desvio',
    ];

    const statusRelato = [
      'PENDENTE',
      'APROVADO',
      'REPROVADO',
      'ATRIBUIDO',
    ];

    const descricoesBase = [
      'Equipamento com ruído excessivo.',
      'Piso escorregadio devido a vazamento.',
      'Fiação exposta em área de passagem.',
      'Funcionário não utilizando EPI adequado.',
      'Quase colisão de empilhadeira com pedestre.',
      'Sugestão para melhoria de iluminação.',
      'Descarte incorreto de resíduos.',
      'Porta de emergência obstruída.',
      'Ferramenta danificada em uso.',
      'Cheiro forte de produto químico.',
    ];

    const riscosBase = [
      'Risco de queda.',
      'Risco de choque elétrico.',
      'Risco de lesão por impacto.',
      'Risco de contaminação.',
      'Risco de incêndio.',
      'Risco de atropelamento.',
      'Risco de intoxicação.',
      'Risco de corte.',
      'Risco de esmagamento.',
      'Risco de explosão.',
    ];

    const danosBase = [
      'Nenhum.',
      'Leve (pequenos arranhões).',
      'Moderado (necessitou de primeiros socorros).',
      'Grave (necessitou de atendimento médico).',
      'Pequeno dano material.',
      'Dano material significativo.',
    ];

    function getRandomElement<T>(arr: T[]): T {
      return arr[Math.floor(Math.random() * arr.length)];
    }

    function getRandomDate(start: Date, end: Date): string {
      const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
      return date.toISOString().split('T')[0];
    }

    const startDate = new Date('2025-01-01');
    const endDate = new Date('2025-08-26');

    const numberOfRelatosToGenerate = 150;

    for (let i = 0; i < numberOfRelatosToGenerate; i++) {
      const local = getRandomElement(locaisOcorrencia);
      const tipo = getRandomElement(tiposRelato);
      const status = getRandomElement(statusRelato);
      const descricao = getRandomElement(descricoesBase);
      const riscos = getRandomElement(riscosBase);
      const danos = getRandomElement(danosBase);
      const data = getRandomDate(startDate, endDate);

      const { error: relatoError } = await supabase
        .from('relatos')
        .insert({
          user_id: regular_user_id,
          local_ocorrencia: local,
          data_ocorrencia: data,
          descricao: `${descricao} (Relato #${i + 1})`,
          riscos_identificados: riscos,
          danos_ocorridos: danos,
          status: status,
          tipo_relato: tipo,
        });

      if (relatoError) {
        console.error('Erro ao inserir relato:', relatoError.message);
      }
    }
    console.log(`${numberOfRelatosToGenerate} relatos de exemplo inseridos.`);
  } else {
    console.warn('ID do usuário padrão não encontrado. Relatos de exemplo não serão inseridos.');
  }
  // --- FIM: Geração e Inserção de Relatos ---

  console.log('Script de seed concluído.');
}

main().catch(console.error);
