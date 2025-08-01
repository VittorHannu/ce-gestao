#!/bin/bash

# Baixar e extrair o arquivo da CLI do Supabase para macOS (Apple Silicon)
curl -L https://github.com/supabase/cli/releases/latest/download/supabase_darwin_arm64.tar.gz | tar -xz

# Mover o executável para um local acessível pelo sistema
# Isso pode pedir sua senha de administrador
sudo mv supabase /usr/local/bin

echo "Instalação da CLI do Supabase concluída. Verificando a versão..."
supabase --version
