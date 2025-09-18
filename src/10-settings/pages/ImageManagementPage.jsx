import React, { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/01-shared/lib/supabase';
import MainLayout from '@/01-shared/components/MainLayout';
import PageHeader from '@/01-shared/components/PageHeader';
import LoadingSpinner from '@/01-shared/components/LoadingSpinner';
import { Button } from '@/01-shared/components/ui/button';
import { useToast } from '@/01-shared/hooks/useToast';

// Lógica de exclusão especial para esta página
const forceDeleteRelatoImage = async (image) => {
  // Lógica mais robusta para extrair o nome do arquivo
  const match = image.image_url.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/.*$/);
  const fileName = match ? match[0] : null;

  if (!fileName) {
    throw new Error(`Não foi possível extrair o nome do arquivo da URL: ${image.image_url}`);
  }

  // 1. Chamar a Edge Function para deletar do R2
  const { error: functionError } = await supabase.functions.invoke('delete-image', {
    body: { fileName }
  });

  if (functionError) {
    throw new Error(`Erro ao deletar do R2: ${functionError.message}`);
  }

  // 2. Deletar do banco de dados pelo ID, que é mais seguro
  const { error: dbError } = await supabase
    .from('relato_images')
    .delete()
    .eq('id', image.id);

  if (dbError) {
    throw new Error(`Erro ao deletar do banco de dados: ${dbError.message}`);
  }
};

const ImageRow = ({ image, onDelete, isDeleting }) => (
  <div className="flex items-center justify-between p-2 border-b">
    <div className="flex items-center space-x-4">
      <a href={image.image_url} target="_blank" rel="noopener noreferrer">
        <img src={image.image_url} alt="preview" className="w-20 h-20 object-cover rounded-md bg-gray-200" />
      </a>
      <div className="text-sm space-y-1">
        <p className="break-all"><b>URL:</b> {image.image_url}</p>
        <p><b>Relato ID:</b> {image.relato_id}</p>
        <p><b>Criada em:</b> {new Date(image.created_at).toLocaleString()}</p>
      </div>
    </div>
    <Button
      variant="destructive"
      size="sm"
      onClick={() => onDelete(image)}
      disabled={isDeleting}
    >
      {isDeleting ? 'Excluindo...' : 'Forçar Exclusão'}
    </Button>
  </div>
);

const ImageManagementPage = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [deletingId, setDeletingId] = useState(null);

  const r2PublicUrl = import.meta.env.VITE_R2_PUBLIC_URL;

  const fetchAllImages = async () => {
    const { data, error } = await supabase.from('relato_images').select('*').order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data;
  };

  const { data: allImages, isLoading, error } = useQuery({
    queryKey: ['allRelatoImages'],
    queryFn: fetchAllImages
  });

  const { validImages, brokenImages } = useMemo(() => {
    if (!allImages) return { validImages: [], brokenImages: [] };
    const valid = [];
    const broken = [];
    allImages.forEach(img => {
      if (img.image_url && img.image_url.startsWith(r2PublicUrl)) {
        valid.push(img);
      } else {
        broken.push(img);
      }
    });
    return { validImages: valid, brokenImages: broken };
  }, [allImages, r2PublicUrl]);

  const handleDelete = async (image) => {
    if (!window.confirm(`Tem certeza que deseja forçar a exclusão da imagem com URL: ${image.image_url}? Esta ação não pode ser desfeita.`)) return;
    
    setDeletingId(image.id);
    try {
      await forceDeleteRelatoImage(image);
      toast({ title: 'Sucesso', description: 'Imagem excluída.' });
      queryClient.invalidateQueries(['allRelatoImages']);
    } catch (err) {
      toast({ title: 'Erro na exclusão', description: err.message, variant: 'destructive' });
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div className="p-4 text-red-500">Erro ao buscar imagens: {error.message}</div>;

  return (
    <MainLayout header={<PageHeader title="Gerenciamento de Imagens" />}>
      <div className="p-4 space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">Imagens com URL Quebrada ou Antiga ({brokenImages.length})</h2>
          <div className="p-4 bg-red-100 border-l-4 border-red-500 text-red-800 rounded-md">
            <p>As imagens abaixo não seguem o padrão de URL atual e podem não funcionar corretamente. A exclusão é permanente.</p>
          </div>
          <div className="mt-4 space-y-2">
            {brokenImages.length > 0 ? (
              brokenImages.map((image) => (
                <ImageRow key={image.id} image={image} onDelete={handleDelete} isDeleting={deletingId === image.id} />
              ))
            ) : (
              <p>Nenhuma imagem com URL quebrada encontrada.</p>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Imagens Válidas ({validImages.length})</h2>
          <div className="mt-4 space-y-2">
            {validImages.map((image) => (
              <ImageRow key={image.id} image={image} onDelete={handleDelete} isDeleting={deletingId === image.id} />
            ))}
          </div>
        </div>

      </div>
    </MainLayout>
  );
};

export default ImageManagementPage;
