import os
from supabase import create_client, Client

# --- CONFIGURAÇÃO ---
# Suas credenciais do Supabase (as mesmas usadas para criar usuários)
SUPABASE_URL = "https://vqeetamykdsjajrurtoo.supabase.co"
SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxZWV0YW15a2RzamFqcnVydG9vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzEzODU3OSwiZXhwIjoyMDY4NzE0NTc5fQ.JupaEkM2mCqqIsDGKm7P_BQXZvK3VyPkSvG9UjmuSbI"

# Domínio de e-mail para filtrar usuários a serem deletados
TARGET_EMAIL_DOMAIN = "@mail.com"

# --- LÓGICA PRINCIPAL ---

def main():
    if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
        print("ERRO: Por favor, configure SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no script.")
        return

    supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    print(f"Buscando usuários com o domínio '{TARGET_EMAIL_DOMAIN}' para exclusão...")

    try:
        # Listar todos os usuários (requer permissões de service_role)
        # A API admin.list_users() pode ter paginação para muitos usuários. 
        # Para este caso, assumimos que a lista não é excessivamente grande.
        response = supabase.auth.admin.list_users()
        
        if response.data and response.data.users:
            users_to_delete = [user for user in response.data.users if user.email and user.email.endswith(TARGET_EMAIL_DOMAIN)]
            
            if not users_to_delete:
                print(f"Nenhum usuário encontrado com o domínio '{TARGET_EMAIL_DOMAIN}'.")
                return

            print(f"Encontrados {len(users_to_delete)} usuários para deletar.")
            print("Iniciando exclusão...")

            for user in users_to_delete:
                try:
                    delete_response = supabase.auth.admin.delete_user(user.id)
                    if delete_response.data:
                        print(f"Usuário deletado com sucesso: {user.email}")
                    elif delete_response.error:
                        print(f"ERRO ao deletar usuário {user.email}: {delete_response.error.message}")
                    else:
                        print(f"ERRO desconhecido ao deletar usuário {user.email}.")
                except Exception as e:
                    print(f"EXCEÇÃO ao deletar usuário {user.email}: {e}")
            
            print("Processo de exclusão concluído.")

        elif response.error:
            print(f"ERRO ao listar usuários: {response.error.message}")
        else:
            print("Nenhum usuário encontrado no Supabase.")

    except Exception as e:
        print(f"EXCEÇÃO geral ao tentar listar ou deletar usuários: {e}")

if __name__ == "__main__":
    main()