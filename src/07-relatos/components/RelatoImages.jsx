import React, { useState, useRef } from 'react';
import { Button } from '@/01-shared/components/ui/button';
import { supabase } from '@/01-shared/lib/supabase';
import { useToast } from '@/01-shared/hooks/useToast';
import { useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent
} from '@/01-shared/components/ui/dialog';
import { deleteRelatoImage } from '../services/relatoImageService';
import { TrashIcon, ChevronLeftIcon, ChevronRightIcon, XMarkIcon } from '@heroicons/react/24/solid';

const RelatoImages = ({ relato, userProfile, isEditable = false }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const imageInputRef = useRef(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const openImageViewer = (index) => setSelectedImageIndex(index);
  const closeImageViewer = () => setSelectedImageIndex(null);

  const handleNextImage = () => {
    if (selectedImageIndex === null) return;
    const nextIndex = (selectedImageIndex + 1) % relato.images.length;
    setSelectedImageIndex(nextIndex);
  };

  const handlePrevImage = () => {
    if (selectedImageIndex === null) return;
    const prevIndex = (selectedImageIndex - 1 + relato.images.length) % relato.images.length;
    setSelectedImageIndex(prevIndex);
  };

  const handleDeleteImage = async () => {
    if (selectedImageIndex === null) return;
    const imageUrl = relato.images[selectedImageIndex].image_url;

    if (!window.confirm('Tem certeza que deseja excluir esta imagem?')) {
      return;
    }

    closeImageViewer(); // Fechar o modal antes para evitar problemas de UI

    const queryKey = ['relato', relato.id];
    await queryClient.cancelQueries(queryKey);
    const previousRelato = queryClient.getQueryData(queryKey);

    queryClient.setQueryData(queryKey, (oldData) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        images: oldData.images.filter((img) => img.image_url !== imageUrl)
      };
    });

    try {
      await deleteRelatoImage(imageUrl);
      toast({ title: 'Sucesso!', description: 'Imagem excluída com sucesso.' });
    } catch (error) {
      queryClient.setQueryData(queryKey, previousRelato);
      toast({ title: 'Erro ao excluir imagem', description: error.message, variant: 'destructive' });
    } finally {
      queryClient.invalidateQueries(queryKey);
    }
  };

  const handleFilesUpload = async () => {
    if (selectedFiles.length === 0) return;
    setIsUploading(true);
    try {
      if (!userProfile || !userProfile.id) throw new Error('Perfil do usuário não carregado.');
      if (!relato || !relato.id) throw new Error('Dados do relato não carregados.');

      const uploadedImageUrls = [];
      for (const [index, file] of selectedFiles.entries()) {
        const fileExtension = file.name.split('.').pop();
        const fileName = `${userProfile.id}/${relato.id}/${Date.now()}_${index}.${fileExtension}`;
        const { data: functionData, error: functionError } = await supabase.functions.invoke(
          'get-presigned-image-url',
          { body: { fileName, fileType: file.type } }
        );
        if (functionError) throw new Error(`Erro da Edge Function para ${file.name}: ${functionError.message}`);
        const { presignedUrl } = functionData;
        const uploadResponse = await fetch(presignedUrl, {
          method: 'PUT',
          headers: { 'Content-Type': file.type },
          body: file
        });
        if (!uploadResponse.ok) throw new Error(`Falha ao fazer upload da imagem ${file.name} para o R2.`);
        const imageUrl = `${import.meta.env.VITE_R2_PUBLIC_URL}/${fileName}`;
        uploadedImageUrls.push(imageUrl);
      }

      const imagesToInsert = uploadedImageUrls.map((url, index) => ({
        relato_id: relato.id,
        image_url: url,
        order_index: (relato.images?.length || 0) + index
      }));

      const { error: insertError } = await supabase.from('relato_images').insert(imagesToInsert);
      if (insertError) throw new Error('Falha ao salvar as URLs das imagens no relato.');

      toast({ title: 'Sucesso!', description: 'Imagens enviadas e associadas ao relato.' });
      setSelectedFiles([]);
      queryClient.invalidateQueries(['relato', relato.id]);
    } catch (error) {
      toast({ title: 'Erro no Upload', description: error.message, variant: 'destructive' });
    } finally {
      setIsUploading(false);
    }
  };

  const hasImages = relato.images && relato.images.length > 0;
  if (!isEditable && !hasImages) return null;

  const currentImageUrl = selectedImageIndex !== null ? relato.images[selectedImageIndex]?.image_url : null;

  const imageGrid = hasImages ? (
    <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
      {relato.images.map((img, index) => (
        <div key={img.id} className="relative group cursor-pointer" onClick={(e) => { e.stopPropagation(); openImageViewer(index); }}>
          <img src={img.image_url} alt="Imagem do relato" className="w-full h-full aspect-square object-cover rounded-lg" />
        </div>
      ))}
    </div>
  ) : null;

  const imageViewerModal = (
    <Dialog open={selectedImageIndex !== null} onOpenChange={(isOpen) => !isOpen && closeImageViewer()}>
      {currentImageUrl && (
        <DialogContent className="w-full h-full flex flex-col-reverse p-0" showCloseButton={false}>
          <div className="flex justify-between items-center p-4 border-t bg-background">
            <div className="flex items-center gap-2">
              {relato.images.length > 1 && (
                <>
                  <div className="flex items-center gap-1">
                    <Button variant="default" size="icon" onClick={handlePrevImage}>
                      <ChevronLeftIcon className="h-6 w-6" />
                    </Button>
                    <Button variant="default" size="icon" onClick={handleNextImage}>
                      <ChevronRightIcon className="h-6 w-6" />
                    </Button>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {selectedImageIndex + 1} de {relato.images.length}
                  </span>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              {isEditable && (
                <Button variant="destructive" size="icon" onClick={handleDeleteImage}>
                  <TrashIcon className="h-4 w-4" />
                </Button>
              )}
              <Button variant="ghost" size="icon" onClick={closeImageViewer}>
                <XMarkIcon className="h-6 w-6" />
              </Button>
            </div>
          </div>
          <div className="relative flex-grow flex items-center justify-center overflow-y-auto">
            <img src={currentImageUrl} alt="Imagem do relato em tela cheia" className="max-w-full max-h-full object-contain" />
          </div>
        </DialogContent>
      )}
    </Dialog>
  );

  if (!isEditable) {
    return (
      <div onClick={(e) => e.stopPropagation()}>
        <div className="pt-2">{imageGrid}</div>
        {imageViewerModal}
      </div>
    );
  }

  return (
    <div className="space-y-2 pt-4">
      <h3 className="text-lg font-semibold">Imagens</h3>
      <div className="p-4 border rounded-lg">
        {hasImages ? (
          <div className="mb-4">{imageGrid}</div>
        ) : (
          <p className="text-gray-500 mb-4 text-sm">Nenhuma imagem associada a este relato.</p>
        )}
        {selectedFiles.length > 0 && (
          <div className="mb-4">
            <p className="font-semibold mb-2 text-sm">Novas imagens para upload:</p>
            <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
              {selectedFiles.map((file, index) => (
                <img key={index} src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full aspect-square object-cover rounded-lg" />
              ))}
            </div>
          </div>
        )}
        <input type="file" ref={imageInputRef} onChange={(e) => setSelectedFiles(Array.from(e.target.files))} className="hidden" accept="image/*" multiple />
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => imageInputRef.current.click()}>
            {hasImages ? 'Adicionar Mais' : 'Adicionar Imagens'}
          </Button>
          {selectedFiles.length > 0 && (
            <Button onClick={handleFilesUpload} disabled={isUploading} size="sm">
              {isUploading ? 'Enviando...' : 'Salvar Imagens'}
            </Button>
          )}
        </div>
      </div>
      {imageViewerModal}
    </div>
  );
};

export default RelatoImages;