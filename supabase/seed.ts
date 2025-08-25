import { createClient, SupabaseClient } from '@supabase/supabase-js';

// --- Configuration ---
const supabaseUrl = process.env.VITE_SUPABASE_URL ?? 'http://127.0.0.1:54321';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? 'your_service_role_key';

if (!supabaseServiceRoleKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is required.');
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

// --- Data Definitions ---

const profilesData = [
  { id: '13146c68-63fd-437c-89c8-36c03f56c196', full_name: 'Fernando', role: 'admin', email: 'vhnonfix@mail.com', setor: 'TI' },
  { id: 'c6d7b0a7-365e-4459-bdf2-af2dcbf19829', full_name: 'Meire Pereira De Almeida', role: 'admin', email: 'meire.almeida@copaenergia.com.br', setor: 'OPERAÇÃO' },
  { id: 'dfc45ffc-42fe-4d61-8ebb-033b7b43da3d', full_name: 'Vanusa Alves Da Mota', role: 'admin', email: 'vanusa.mota@copaenergia.com.br', setor: 'OPERAÇÃO' },
  { id: '5330757b-a1e7-4534-bf58-c3070fcc31ad', full_name: 'SEGURANÇA DO TRABALHO', role: 'admin', email: 'segurancadotrabalho.maq@copaenergia.com.br', setor: 'SESMT' },
  { id: 'df62a5d2-dd80-4a32-b99c-22fd6b2905f2', full_name: 'Nathele Lopes Regino', role: 'admin', email: 'nathele.regino@copaenergia.com.br', setor: 'OPERAÇÃO' },
  { id: 'c114ad1f-973c-4c79-b45a-395294d6025f', full_name: 'RegularUser', role: 'user', email: 'regularuser@mail.com', setor: 'N/A' }
];

const relatosData = [
    // ... (All your relatos data as JS objects)
];

const relatoCommentsData = [
    // ... (All your comments data as JS objects)
];

const relatoLogsData = [
    // ... (All your logs data as JS objects)
];

const relatoResponsaveisData = [
    // ... (All your responsaveis data as JS objects)
];


// --- Utility Functions ---

async function clearDatabase() {
  console.log('🧹 Clearing database...');
  const tables = ['relato_responsaveis', 'relato_comments', 'relato_logs', 'relatos', 'profiles'];
  for (const table of tables) {
    const { error } = await supabaseAdmin.from(table).delete().gt('id', 0); // Delete all rows
    if (error) throw new Error(`Failed to clear ${table}: ${error.message}`);
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
  for (const profile of profilesData) {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      user_id: profile.id,
      email: profile.email,
      password: password,
      email_confirm: true, // Auto-confirm user
    });
    if (error) {
      // Check if user already exists, which is fine
      if (error.message.includes('User already exists')) {
        console.log(`User ${profile.email} already exists, skipping creation.`);
      } else {
        throw new Error(`Failed to create auth user ${profile.email}: ${error.message}`);
      }
    } else {
      console.log(`Auth user ${data.user.email} created.`);
    }
  }
}

async function seedTable(tableName: string, data: any[]) {
    if (data.length === 0) {
        console.log(`No data to seed for ${tableName}, skipping.`);
        return;
    }
    console.log(`🌱 Seeding ${tableName}...`);
    const { error } = await supabaseAdmin.from(tableName).insert(data);
    if (error) {
        throw new Error(`Failed to seed ${tableName}: ${error.message}`);
    }
}


// --- Main Seeding Script ---

async function main() {
  try {
    await clearDatabase();
    await clearAuthUsers();
    await seedAuthUsers();

    await seedTable('profiles', profilesData);
    await seedTable('relatos', relatosData);
    await seedTable('relato_comments', relatoCommentsData);
    await seedTable('relato_logs', relatoLogsData);
    await seedTable('relato_responsaveis', relatoResponsaveisData);

    console.log('✅ Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ An error occurred during seeding:', error);
    process.exit(1);
  }
}

main();