import os
import csv
import random
import string
from unidecode import unidecode
from supabase import create_client, Client

# --- CONFIGURAÇÃO ---
# Por favor, forneça suas credenciais do Supabase aqui.
# IMPORTANTE: NUNCA exponha sua SERVICE_ROLE_KEY em código de frontend ou repositórios públicos!
# Para este script, ela será usada localmente.
SUPABASE_URL = "https://vqeetamykdsjajrurtoo.supabase.co"
SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxZWV0YW15a2RzamFqcnVydG9vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzEzODU3OSwiZXhwIjoyMDY4NzE0NTc5fQ.JupaEkM2mCqqIsDGKm7P_BQXZvK3VyPkSvG9UjmuSbI"

# Lista de nomes completos dos usuários a serem criados.
# VOCÊ COLARÁ SUA LISTA AQUI QUANDO EU SOLICITAR.
user_full_names = [
    "Nathele Lopes Regino",
    "Iris Araújo Lima",
    "José Alex da Silva Gomes",
    "Jason Pereira",
    "Edimilson Soares",
    "Simone Barbosa da Silva",
    "Elis Regina Francisca de Souza"
]

# --- FUNÇÕES AUXILIARES ---

def generate_random_password(length=8):
    characters = string.ascii_letters + string.digits # + string.punctuation
    password = ''.join(random.choice(characters) for i in range(length))
    return password

def generate_unique_email(full_name, existing_emails):
    # Remove acentos e caracteres especiais, converte para minúsculas
    normalized_full_name = unidecode(full_name)
    base_email = "".join(filter(str.isalnum, normalized_full_name)).lower()
    
    # Tenta usar o formato "primeironome.ultimonome@mail.com"
    parts = normalized_full_name.lower().split()
    if len(parts) >= 2:
        suggested_email = f"{parts[0]}.{parts[-1]}@mail.com"
    else:
        suggested_email = f"{base_email}@mail.com"

    # Garante unicidade adicionando um número se necessário
    counter = 1
    unique_email = suggested_email
    while unique_email in existing_emails:
        unique_email = f"{suggested_email.split('@')[0]}{counter}@{suggested_email.split('@')[1]}"
        counter += 1
    return unique_email

# --- LÓGICA PRINCIPAL ---

def main():
    if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
        print("ERRO: Por favor, configure SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no script.")
        return

    if not user_full_names:
        print("AVISO: A lista 'user_full_names' está vazia. Nenhum usuário será criado.")
        return

    supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    created_users_data = []
    existing_emails = set()

    try:
        print("Buscando emails existentes no Supabase para evitar colisões...")
        response = supabase.table('profiles').select('email').execute()
        if response.data:
            for profile in response.data:
                existing_emails.add(profile['email'])
        print(f"Encontrados {len(existing_emails)} emails existentes.")
    except Exception as e:
        print(f"AVISO: Não foi possível buscar emails existentes do Supabase: {e}. Pode haver colisões de email.")

    print(f"Iniciando a criação de {len(user_full_names)} usuários...")

    for name in user_full_names:
        email = generate_unique_email(name, existing_emails)
        password = generate_random_password()
        existing_emails.add(email) # Adiciona ao set para verificar unicidade dentro desta execução

        try:
            # Criar usuário no Auth do Supabase
            # Usamos admin.createUser para criar usuários sem a necessidade de confirmação de email
            # e para definir metadados como full_name
            response = supabase.auth.admin.create_user(
                {
                    "email": email,
                    "password": password,
                    "email_confirm": True, # Define como True para não exigir confirmação por email
                    "user_metadata": {"full_name": name},
                }
            )

            if response.user:
                print(f"Usuário '{name}' criado com sucesso. Email: {email}")
                created_users_data.append({
                    "full_name": name,
                    "email": email,
                    "password": password,
                    "user_id": response.user.id
                })
            elif response.error:
                print(f"ERRO ao criar usuário '{name}' ({email}): {response.error.message}")
            else:
                print(f"ERRO desconhecido ao criar usuário '{name}' ({email}).")

        except Exception as e:
            print(f"EXCEÇÃO ao criar usuário '{name}' ({email}): {e}")

    # Salvar dados em um arquivo CSV
    output_filename = "usuarios_criados.csv"
    if created_users_data:
        with open(output_filename, 'w', newline='', encoding='utf-8') as csvfile:
            fieldnames = ["full_name", "email", "password", "user_id"]
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)

            writer.writeheader()
            writer.writerows(created_users_data)
        print(f"Dados dos usuários criados salvos em '{output_filename}'")
    else:
        print("Nenhum usuário foi criado com sucesso para ser salvo no CSV.")

if __name__ == "__main__":
    main()