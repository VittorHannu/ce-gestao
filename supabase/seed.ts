import { createClient, SupabaseClient } from '@supabase/supabase-js';

// --- Configuration ---
const supabaseUrl = process.env.VITE_SUPABASE_URL ?? 'http://127.0.0.1:8000';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

if (!supabaseServiceRoleKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is required.');
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

// --- Data Definitions ---

const profilesData = [
  { id: '13146c68-63fd-437c-89c8-36c03f56c196', full_name: 'vhnonfix', email: 'vhnonfix@icloud.com', can_manage_relatos: true, can_view_users: true, can_create_users: true, can_delete_users: true, can_view_feedbacks: true, can_delete_relatos: true, can_manage_users: true, can_delete_any_comment: true, can_view_all_relatos: true },
  { id: 'c6d7b0a7-365e-4459-bdf2-af2dcbf19829', full_name: 'Meire Pereira De Almeida', email: 'meire.almeida@copaenergia.com.br', can_manage_relatos: true, can_view_users: true, can_create_users: false, can_delete_users: false, can_view_feedbacks: false, can_delete_relatos: false, can_manage_users: false, can_delete_any_comment: false, can_view_all_relatos: true },
  { id: 'dfc45ffc-42fe-4d61-8ebb-033b7b43da3d', full_name: 'Vanusa Alves Da Mota', email: 'vanusa.mota@copaenergia.com.br', can_manage_relatos: true, can_view_users: false, can_create_users: false, can_delete_users: false, can_view_feedbacks: false, can_delete_relatos: false, can_manage_users: false, can_delete_any_comment: false, can_view_all_relatos: true },
  { id: '5330757b-a1e7-4534-bf58-c3070fcc31ad', full_name: 'SEGURANÇA DO TRABALHO', email: 'segurancadotrabalho.maq@copaenergia.com.br', can_manage_relatos: false, can_view_users: false, can_create_users: false, can_delete_users: false, can_view_feedbacks: false, can_delete_relatos: false, can_manage_users: false, can_delete_any_comment: false, can_view_all_relatos: false },
  { id: 'df62a5d2-dd80-4a32-b99c-22fd6b2905f2', full_name: 'Nathele Lopes Regino', email: 'nathele.regino@copaenergia.com.br', can_manage_relatos: true, can_view_users: false, can_create_users: false, can_delete_users: false, can_view_feedbacks: false, can_delete_relatos: false, can_manage_users: false, can_delete_any_comment: false, can_view_all_relatos: true },
  { id: 'c114ad1f-973c-4c79-b45a-395294d6025f', full_name: 'RegularUser', email: 'regularuser@mail.com', can_manage_relatos: false, can_view_users: false, can_create_users: false, can_delete_users: false, can_view_feedbacks: false, can_delete_relatos: false, can_manage_users: false, can_delete_any_comment: false, can_view_all_relatos: false },
  { id: '3f650743-6565-4f08-8a8f-08c371ceaa12', full_name: 'Valdivino Ribeiro Da Silva', email: 'valdivino.silva@mail.com', can_manage_relatos: true, can_view_users: true, can_create_users: false, can_delete_users: false, can_view_feedbacks: false, can_delete_relatos: false, can_manage_users: false, can_delete_any_comment: false, can_view_all_relatos: true }
];

const notificationQueueData = [
  { recipient_user_id: 'c114ad1f-973c-4c79-b45a-395294d6025f', notification_type: 'NEW_COMMENT', payload: { relato_id: '3cae8567-5f5c-46e7-92a5-899730935cd1', comment_id: '7ee91c37-df9e-447e-b0cf-4d1903b5a200', comment_text: 'Teste', commenter_id: '13146c68-63fd-437c-89c8-36c03f56c196' }, status: 'PENDING', attempts: 0, last_attempt_at: null, created_at: '2025-08-22T18:37:04.232928+00:00', processed_at: null, error_message: null },
  { recipient_user_id: 'c114ad1f-973c-4c79-b45a-395294d6025f', notification_type: 'NEW_COMMENT', payload: { relato_id: '52f5123b-a295-4c40-a441-82b628f9c5bd', comment_id: '380269c6-aaf6-4521-ba00-379b4bc71407', comment_text: 'Oi', commenter_id: '13146c68-63fd-437c-89c8-36c03f56c196' }, status: 'PENDING', attempts: 0, last_attempt_at: null, created_at: '2025-08-22T18:53:38.62726+00:00', processed_at: null, error_message: null },
  { recipient_user_id: 'c114ad1f-973c-4c79-b45a-395294d6025f', notification_type: 'NEW_COMMENT', payload: { relato_id: '52f5123b-a295-4c40-a441-82b628f9c5bd', comment_id: '9f1ef5ef-59e6-4dbd-92a6-b3802ab2912f', comment_text: 'Sjhshhs', commenter_id: '13146c68-63fd-437c-89c8-36c03f56c196' }, status: 'PENDING', attempts: 0, last_attempt_at: null, created_at: '2025-08-22T18:59:27.342363+00:00', processed_at: null, error_message: null },
  { recipient_user_id: 'c114ad1f-973c-4c79-b45a-395294d6025f', notification_type: 'NEW_COMMENT', payload: { relato_id: '52f5123b-a295-4c40-a441-82b628f9c5bd', comment_id: '8eeb1023-5ad1-4dac-9b61-7d1a7c43bfc0', comment_text: 'Teste', commenter_id: '13146c68-63fd-437c-89c8-36c03f56c196' }, status: 'PENDING', attempts: 0, last_attempt_at: null, created_at: '2025-08-22T19:49:31.916771+00:00', processed_at: null, error_message: null }
];



import * as crypto from 'crypto';

function generateRandomDate(start, end) {
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date.toISOString().split('T')[0];
}

function generateRandomTime() {
  const hours = Math.floor(Math.random() * 24).toString().padStart(2, '0');
  const minutes = Math.floor(Math.random() * 60).toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const localOcorrenciaOptions = [
  'Pátio de Manobra', 'Plataforma de Carregamento', 'Área de Estocagem',
  'Escritório Administrativo', 'Laboratório de Qualidade', 'Portaria Principal',
  'Oficina de Manutenção', 'Refeitório', 'Vestiário', 'Sala de Reuniões'
];

const tipoRelatoOptions = [
  'Quase acidente', 'Condição insegura', 'Comportamento inseguro', 'Acidente sem lesão', 'Incidente ambiental'
];

const descricaoOptions = [
  'Vazamento de gás em válvula de cilindro.',
  'Colaborador sem EPI adequado na área de produção.',
  'Escada sem corrimão em área de acesso restrito.',
  'Queda de objeto de prateleira alta.',
  'Derramamento de óleo no pátio.',
  'Fiação exposta em equipamento elétrico.',
  'Empilhadeira operando em alta velocidade.',
  'Extintor de incêndio com validade vencida.',
  'Sinalização de emergência obstruída.',
  'Descarte incorreto de resíduos químicos.'
];

const riscosIdentificadosOptions = [
  'Risco de explosão', 'Risco de queda', 'Risco de contaminação',
  'Risco de incêndio', 'Risco de lesão por impacto', 'Risco de choque elétrico',
  'Risco de intoxicação', 'Risco de atropelamento', 'Risco de corte', 'Risco de queimadura'
];

const danosOcorridosOptions = [
  'Pequeno vazamento controlado', 'Nenhum dano material', 'Amassado leve em equipamento',
  'Pequeno corte em colaborador', 'Contaminação de solo (leve)', 'Dano em fiação',
  'Avaria em veículo', 'Queimadura de primeiro grau', 'Fratura leve', 'Irritação na pele'
];

const planejamentoCronologiaSolucaoOptions = [
  'Equipe de manutenção acionada para reparo imediato.',
  'Treinamento de segurança reforçado para todos os colaboradores.',
  'Inspeção de rotina agendada para verificar conformidade.',
  'Procedimento de descarte revisado e comunicado.',
  'Barreira de segurança instalada na área de risco.',
  'Substituição de equipamento danificado solicitada.',
  'Campanha de conscientização sobre uso de EPIs.',
  'Auditoria interna de segurança programada.',
  'Reunião com a equipe para discutir o incidente.',
  'Plano de ação emergencial elaborado.'
];

function generateRelatoData(index, profilesData) {
  const isApproved = index < 95; // 95 approved, 5 disapproved
  let status;
  if (index < 95) {
    status = 'APROVADO';
  } else if (index >= 95 && index < 98) { // 3 PENDENTE
    status = 'PENDENTE';
  } else { // 2 REPROVADO
    status = 'REPROVADO';
  }
  const isAnonymous = Math.random() > 0.5;
  const userId = isAnonymous ? null : getRandomElement(profilesData).id;
  const createdAt = new Date(new Date().setMonth(new Date().getMonth() - Math.floor(Math.random() * 6))).toISOString(); // Last 6 months

  const dataOcorrencia = generateRandomDate(new Date(2025, 0, 1), new Date(2025, 7, 25)); // Jan 1 to Aug 25, 2025
  const horaAproximadaOcorrencia = Math.random() > 0.3 ? generateRandomTime() : null;

  const descricao = getRandomElement(descricaoOptions);
  const riscosIdentificados = getRandomElement(riscosIdentificadosOptions);
  const danosOcorridos = Math.random() > 0.4 ? getRandomElement(danosOcorridosOptions) : null;

  let planejamentoCronologiaSolucao = null;
  let dataConclusaoSolucao = null;

  if (isApproved) {
    if (Math.random() < 0.8) { // 80% chance for approved to have planejamento
      planejamentoCronologiaSolucao = getRandomElement(planejamentoCronologiaSolucaoOptions);
      if (Math.random() < 0.7) { // 70% chance for approved with planejamento to have dataConclusao
        dataConclusaoSolucao = generateRandomDate(new Date(dataOcorrencia), new Date());
      }
    }
  } else { // Disapproved
    if (Math.random() < 0.2) { // 20% chance for disapproved to have planejamento
      planejamentoCronologiaSolucao = getRandomElement(planejamentoCronologiaSolucaoOptions);
      if (Math.random() < 0.1) { // 10% chance for disapproved with planejamento to have dataConclusao
        dataConclusaoSolucao = generateRandomDate(new Date(dataOcorrencia), new Date());
      }
    }
  }

  const relatoCode = `REL${new Date(dataOcorrencia).getFullYear()}${(index + 1).toString().padStart(5, '0')}`;
  const tipoRelato = getRandomElement(tipoRelatoOptions);

  return {
    id: crypto.randomUUID(),
    created_at: createdAt,
    user_id: userId,
    is_anonymous: isAnonymous,
    local_ocorrencia: getRandomElement(localOcorrenciaOptions),
    data_ocorrencia: dataOcorrencia,
    hora_aproximada_ocorrencia: horaAproximadaOcorrencia,
    descricao: descricao,
    riscos_identificados: riscosIdentificados,
    danos_ocorridos: danosOcorridos,
    status: status,
    planejamento_cronologia_solucao: planejamentoCronologiaSolucao,
    data_conclusao_solucao: dataConclusaoSolucao,
    relato_code: relatoCode,
    tipo_relato: tipoRelato,
  };
}

    // --- Utility Functions ---

async function clearDatabase() {
  console.log('🧹 Clearing database...');
  // Add a small delay to ensure database is ready
  await new Promise(resolve => setTimeout(resolve, 2000)); // 2 seconds delay

  const tables = ['relato_responsaveis', 'relato_comments', 'relato_logs', 'relatos', 'profiles'];
  for (const table of tables) {
    try {
      const { error } = await supabaseAdmin.from(table).delete().not('created_at', 'is.null'); // Delete all rows
      if (error) {
        // If table does not exist, log and continue, don't throw
        if (error.message.includes('relation') && error.message.includes('does not exist')) {
          console.warn(`⚠️ Table ${table} does not exist, skipping clear.`);
        } else {
          throw new Error(`Failed to clear ${table}: ${error.message}`);
        }
      }
    } catch (e) {
      // Catch any other errors during delete and re-throw if not a "relation does not exist" error
      if (e.message.includes('relation') && e.message.includes('does not exist')) {
        console.warn(`⚠️ Table ${table} does not exist, skipping clear.`);
      } else {
        throw e;
      }
    }
  }
  console.log('🗑️ Database cleared.');
}

async function clearAuthUsers() {
    console.log('🔥 Deleting all auth users...');
    const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();
    if (error) {
        throw new Error(`Failed to list users for deletion: ${error.message}`);
    }

    const deletePromises = users.map(user => supabaseAdmin.auth.admin.deleteUser(user.id));
    const results = await Promise.allSettled(deletePromises);

    results.forEach((result, index) => {
        if (result.status === 'rejected') {
            console.error(`Failed to delete user ${users[index].email}:`, result.reason);
        }
    });
    console.log('👤 Auth users cleared.');
}


async function seedAuthUsers() {
  console.log('🌱 Seeding auth users...');
  const password = '123456';
  const createdUserIds = [];

  for (const profile of profilesData) {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: profile.email,
      password: password,
      email_confirm: true, // Auto-confirm user
      user_metadata: { full_name: profile.full_name }, // Pass full_name to user_metadata
    });
    if (error) {
      if (error.message.includes('User already exists')) {
        console.log(`User ${profile.email} already exists, skipping creation.`);
        // If user exists, try to get their ID to link with profile
        const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers({ email: profile.email });
        if (existingUsers && existingUsers.users.length > 0) {
          createdUserIds.push({ email: profile.email, id: existingUsers.users[0].id });
        }
      } else {
        throw new Error(`Failed to create auth user ${profile.email}: ${error.message}`);
      }
    } else {
      console.log(`Auth user ${data.user.email} created.`);
      createdUserIds.push({ email: data.user.email, id: data.user.id });
    }
  }
  return createdUserIds;
}

async function seedTable(tableName: string, data: any[]) {
    if (data.length === 0) {
        console.log(`No data to seed for ${tableName}, skipping.`);
        return;
    }
    console.log(`🌱 Seeding ${tableName}...`);

    // Special handling for 'profiles' table to use upsert
    if (tableName === 'profiles') {
        console.log('Custom logic for profiles: updating with permissions instead of inserting.');
        for (const profile of data) {
            const { error } = await supabaseAdmin
                .from('profiles')
                .update(profile) // Update the profile with new data
                .eq('id', profile.id); // Match by ID

            if (error) {
                throw new Error(`Failed to update profile ${profile.email}: ${error.message}`);
            }
        }
    } else {
        const { error } = await supabaseAdmin.from(tableName).insert(data);
        if (error) {
            throw new Error(`Failed to seed ${tableName}: ${error.message}`);
        }
    }
}


// --- Main Seeding Script ---

async function main() {
  try {
    await clearDatabase();
    await clearAuthUsers();
    const createdAuthUsers = await seedAuthUsers(); // Get the created user IDs

    // Map profilesData to use the actual IDs from auth.users
    const updatedProfilesData = profilesData.map(profile => {
      const authUser = createdAuthUsers.find(user => user.email === profile.email);
      if (authUser) {
        return { ...profile, id: authUser.id };
      }
      return profile; // Should not happen if all profiles have corresponding auth users
    });

    await seedTable('profiles', updatedProfilesData); // Use the updated profilesData

    const relatoCommentsData = [];

    const relatoLogsData = [];

    const relatoResponsaveisData = [];

    const generatedRelatos = [];
    for (let i = 0; i < 100; i++) {
      generatedRelatos.push(generateRelatoData(i, createdAuthUsers));
    }
    const relatosData = generatedRelatos;

    await seedTable('relatos', relatosData);
    // Map pushSubscriptionsData to use the actual IDs from auth.users
    const updatedPushSubscriptionsData = pushSubscriptionsData.map(sub => {
      const authUser = createdAuthUsers.find(user => user.id === sub.user_id); // Assuming user_id in pushSubscriptionsData is the original hardcoded ID
      if (authUser) {
        return { ...sub, user_id: authUser.id };
      }
      return sub; // Should not happen if all push subscriptions have corresponding auth users
    });


    console.log('✅ Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ An error occurred during seeding:', error);
    process.exit(1);
  }
}

const pushSubscriptionsData = [];

main();