import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LoadingSpinner from '@/01-shared/components/LoadingSpinner';
import { Button } from '@/01-shared/components/ui/button';
import PageHeader from '@/01-shared/components/PageHeader';
import RelatoComments from '../components/RelatoComments';
import MainLayout from '@/01-shared/components/MainLayout';
import { useRelatoManagement } from '../hooks/useRelatoManagement';
import RelatoLogs from '../components/RelatoLogs';
import { DocumentTextIcon, ChatBubbleLeftRightIcon, ClockIcon } from '@heroicons/react/24/solid';
import { Table, TableBody } from '@/01-shared/components/ui/table';
import ClickableTableRow from '@/01-shared/components/ClickableTableRow';
import SectionEditModal from '../components/modals/SectionEditModal';
import { supabase } from '@/01-shared/lib/supabase';
import { useToast } from '@/01-shared/hooks/useToast';
import { cn } from '@/lib/utils';

// Helper to create a clickable section
const ClickableSection = ({ onClick, isEditable, children }) => (
  <div
    onClick={isEditable ? onClick : undefined}
    className={cn(
      'p-4 bg-white rounded-lg shadow-sm',
      isEditable && 'cursor-pointer hover:bg-gray-50 transition-colors'
    )}
  >
    {children}
  </div>
);

const RelatoDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('details');
  const [relatorName, setRelatorName] = useState('Carregando...');
  const [modalState, setModalState] = useState({ isOpen: false, config: null, title: '' });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const imageInputRef = React.useRef(null);
  const { toast } = useToast();

  const {
    relato,
    currentResponsibles,
    loading,
    error,
    isSaving,
    isDeleting,
    handleUpdateRelato,
    handleDeleteRelato,
    userProfile,
    isLoadingProfile
  } = useRelatoManagement(id);

  const canDeleteRelatos = userProfile?.can_delete_relatos;
  const canManageRelatos = userProfile?.can_manage_relatos;

  // --- Field and Section Configurations ---
  const sectionsConfig = {
    cabecalho: {
      title: 'Cabeçalho',
      fields: [
        { key: 'relato_code', label: 'Código do Relato', editable: false },
        { key: 'status', label: 'Status de Aprovação', editable: canManageRelatos, type: 'select', options: [
          { value: 'Pendente', label: 'Pendente' },
          { value: 'Aprovado', label: 'Aprovado' },
          { value: 'Reprovado', label: 'Reprovado' }
        ] },
        { key: 'tipo_relato', label: 'Tipo de Relato', editable: false }
      ]
    },
    ocorrencia: {
      title: 'Detalhes da Ocorrência',
      fields: [
        { key: 'data_ocorrencia', label: 'Data da Ocorrência', editable: canManageRelatos, type: 'date' },
        { key: 'hora_aproximada_ocorrencia', label: 'Hora Aproximada', editable: canManageRelatos, type: 'time' },
        { key: 'local_ocorrencia', label: 'Local da Ocorrência', editable: canManageRelatos, type: 'text' },
        { key: 'descricao', label: 'Descrição', editable: canManageRelatos, type: 'textarea' }
      ]
    },
    analise: {
      title: 'Análise',
      fields: [
        { key: 'riscos_identificados', label: 'Riscos Identificados', editable: canManageRelatos, type: 'textarea' },
        { key: 'danos_ocorridos', label: 'Danos Ocorridos', editable: canManageRelatos, type: 'textarea' }
      ]
    },
    tratativa: {
      title: 'Tratativa',
      fields: [
        { key: 'treatment_status', label: 'Status da Tratativa', editable: false },
        { key: 'responsibles', label: 'Responsáveis', editable: canManageRelatos, type: 'text' }, // Placeholder, should be a multi-user select
        { key: 'planejamento_cronologia_solucao', label: 'Planejamento da Solução', editable: canManageRelatos, type: 'textarea' },
        { key: 'concluido_sem_data', label: 'Concluído (sem data de conclusão)', editable: canManageRelatos, type: 'checkbox' },
        { key: 'data_conclusao_solucao', label: 'Data de Conclusão', editable: canManageRelatos, type: 'date' }
      ]
    },
    adicionais: {
      title: 'Informações Adicionais',
      fields: [
        { key: 'relatorName', label: 'Relator', editable: false },
        { key: 'is_anonymous', label: 'Anônimo', editable: false, format: (val) => val ? 'Sim' : 'Não' },
        { key: 'created_at', label: 'Data de Criação', editable: false, format: (val) => new Date(val).toLocaleString() }
      ]
    }
  };

  const openModal = (sectionKey) => {
    const config = sectionsConfig[sectionKey];
    if (config) {
      setModalState({ isOpen: true, config: config.fields, title: config.title });
    }
  };

  const handleSaveChanges = async (changes) => {
    const success = await handleUpdateRelato(changes, canManageRelatos);
    if (success) {
      setModalState({ isOpen: false, config: null, title: '' });
    }
    return success;
  };

  const handleFilesUpload = async () => {
    console.log('--- Início do Upload de Múltiplas Imagens ---');
    if (selectedFiles.length === 0) {
      console.log('1. Upload cancelado: Nenhuma imagem selecionada.');
      return;
    }
    console.log(`1. ${selectedFiles.length} imagens selecionadas.`);

    setIsUploading(true);
    try {
      console.log('2. Verificando dados necessários...');
      if (!userProfile || !userProfile.id) throw new Error('Perfil do usuário não carregado.');
      if (!relato || !relato.id) throw new Error('Dados do relato não carregados.');
      console.log('2.1. userProfile.id:', userProfile.id);
      console.log('2.2. relato.id:', relato.id);

      const uploadedImageUrls = [];

      for (const [index, file] of selectedFiles.entries()) {
        console.log(`Processando imagem ${index + 1}/${selectedFiles.length}: ${file.name}`);

        // 3. Gerar um nome de arquivo único para evitar conflitos
        const fileExtension = file.name.split('.').pop();
        const fileName = `${userProfile.id}/${relato.id}/${Date.now()}_${index}.${fileExtension}`;
        console.log(`3.1. Nome do arquivo gerado para ${file.name}:`, fileName);

        // 4. Chamar a Edge Function para obter a URL pré-assinada
        console.log(`4. Chamando a Edge Function get-presigned-image-url para ${file.name}...`);
        const { data: functionData, error: functionError } = await supabase.functions.invoke(
          'get-presigned-image-url',
          { body: { fileName, fileType: file.type } }
        );

        if (functionError) throw new Error(`Erro da Edge Function para ${file.name}: ${functionError.message}`);
        console.log(`4.1. URL pré-assinada recebida para ${file.name}.`);
        
        const { presignedUrl } = functionData;

        // 5. Fazer o upload da imagem para o R2 usando a URL recebida
        console.log(`5. Enviando imagem ${file.name} para o R2...`);
        const uploadResponse = await fetch(presignedUrl, {
          method: 'PUT',
          headers: { 'Content-Type': file.type },
          body: file
        });

        if (!uploadResponse.ok) {
          throw new Error(`Falha ao fazer upload da imagem ${file.name} para o R2.`);
        }
        console.log(`5.1. Imagem ${file.name} enviada com sucesso para o R2.`);

        // 6. Construir a URL final da imagem
        const imageUrl = `${import.meta.env.VITE_R2_PUBLIC_URL}/${fileName}`;
        uploadedImageUrls.push(imageUrl);
      }

      // 7. Salvar todas as URLs das imagens no banco de dados (tabela relato_images)
      console.log('7. Salvando URLs no banco de dados (tabela relato_images)...');
      const imagesToInsert = uploadedImageUrls.map((url, index) => ({
        relato_id: relato.id,
        image_url: url,
        order_index: existingImages.length + index // Append to existing images
      }));

      const { error: insertError } = await supabase
        .from('relato_images')
        .insert(imagesToInsert);

      if (insertError) {
        console.error('7.1. Erro ao inserir URLs das imagens no DB:', insertError);
        throw new Error('Falha ao salvar as URLs das imagens no relato.');
      }

      console.log('7.1. URLs das imagens salvas com sucesso no DB.');
      toast({ title: 'Sucesso!', description: 'Imagens enviadas e associadas ao relato.' });
      setSelectedFiles([]); // Limpa as previews
      // Refresh existing images by re-fetching
      const { data: newImagesData, error: newImagesError } = await supabase
        .from('relato_images')
        .select('id, image_url, order_index')
        .eq('relato_id', relato.id)
        .order('order_index', { ascending: true });

      if (newImagesError) {
        console.error('Erro ao re-buscar imagens após upload:', newImagesError.message);
      } else {
        setExistingImages(newImagesData || []);
      }

    } catch (error) {
      console.error('ERRO NO PROCESSO DE UPLOAD DE MÚLTIPLAS IMAGENS:', error);
      toast({ title: 'Erro no Upload', description: error.message, variant: 'destructive' });
    } finally {
      setIsUploading(false);
      console.log('--- Fim do Upload de Múltiplas Imagens ---');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!relato) return;

      // Fetch relator name
      if (relato.is_anonymous) {
        setRelatorName('Anônimo');
      } else if (relato.user_id) {
        const { data, error } = await supabase.from('profiles').select('full_name').eq('id', relato.user_id).single();
        setRelatorName(error ? 'Erro' : data?.full_name || 'Não informado');
      } else {
        setRelatorName('Não informado');
      }

      // Fetch existing images for the relato
      const { data: imagesData, error: imagesError } = await supabase
        .from('relato_images')
        .select('id, image_url, order_index')
        .eq('relato_id', relato.id)
        .order('order_index', { ascending: true });

      if (imagesError) {
        console.error('Erro ao buscar imagens do relato:', imagesError.message);
        setExistingImages([]);
      } else {
        setExistingImages(imagesData || []);
      }
    };
    fetchData();
  }, [relato]);

  if (loading || isLoadingProfile) return <LoadingSpinner />;
  if (error) return <div className="container p-4 text-red-500">{error.message || error}</div>;
  if (!relato) return <div className="container p-4">Relato não encontrado.</div>;

  const getTreatmentStatusText = () => {
    if (relato.data_conclusao_solucao) return 'Concluído';
    if (relato.concluido_sem_data) return 'Concluído (sem data)';
    if (relato.planejamento_cronologia_solucao) return 'Em Andamento';
    return 'Sem Tratativa';
  };

  const responsibleNames = currentResponsibles.map(r => r.full_name).join(', ') || null;
  const dynamicRelato = { ...relato, relatorName, treatment_status: getTreatmentStatusText(), responsibles: responsibleNames };

  const renderTabContent = () => {
    if (activeTab === 'comments') return <RelatoComments relatoId={id} />;
    if (activeTab === 'logs') return <RelatoLogs relatoId={id} />;

    return (
      <div className="space-y-4">
        {/* Seção de Imagem */}
        <div className="p-4 bg-white rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-2 px-4">Imagens</h3>
          <div className="p-4">
            {existingImages.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                {existingImages.map((img) => (
                  <div key={img.id} className="relative group">
                    <img src={img.image_url} alt="Imagem do relato" className="w-full h-auto rounded-lg object-cover" />
                    {/* Add delete button later */}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 mb-4">Nenhuma imagem associada a este relato.</p>
            )}

            {selectedFiles.length > 0 && (
              <div className="mb-4">
                <p className="font-semibold mb-2">Novas imagens selecionadas:</p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {selectedFiles.map((file, index) => (
                    <img key={index} src={URL.createObjectURL(file)} alt="Preview" className="w-full h-auto rounded-lg object-cover" />
                  ))}
                </div>
              </div>
            )}

            <input 
              type="file" 
              ref={imageInputRef} 
              onChange={(e) => setSelectedFiles(Array.from(e.target.files))} 
              className="hidden" 
              accept="image/*"
              multiple
            />

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => imageInputRef.current.click()}>
                {existingImages.length > 0 ? 'Adicionar Mais Imagens' : 'Adicionar Imagens'}
              </Button>

              {selectedFiles.length > 0 && (
                <Button onClick={handleFilesUpload} disabled={isUploading}>
                  {isUploading ? 'Enviando...' : 'Salvar Imagens'}
                </Button>
              )}
            </div>
          </div>
        </div>

        {Object.entries(sectionsConfig).map(([key, section]) => (
          <ClickableSection key={key} onClick={() => openModal(key)} isEditable={section.fields.some(f => f.editable)}>
            <h3 className="text-lg font-semibold mb-2 px-4">{section.title}</h3>
            <Table>
              <TableBody>
                {section.fields.map(field => (
                  <ClickableTableRow
                    key={field.key}
                    label={field.label}
                    value={field.format ? field.format(dynamicRelato[field.key]) : dynamicRelato[field.key]}
                    isEditable={false} // Rows themselves are not clickable anymore
                  />
                ))}
              </TableBody>
            </Table>
          </ClickableSection>
        ))}

        <div className="mt-6 flex justify-center">
          {canDeleteRelatos && (
            <Button variant="destructive" onClick={async () => {
              if (window.confirm('Tem certeza que deseja excluir este relato?')) {
                const success = await handleDeleteRelato();
                if (success) navigate('/relatos');
              }
            }} disabled={isDeleting}>
              {isDeleting ? 'Excluindo...' : 'Excluir'}
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <MainLayout header={<PageHeader title="Detalhes do Relato" />}>
      <div className="w-full">
        <div className="grid grid-cols-3 gap-1 mb-4 bg-gray-300 p-1 rounded-lg">
          {/* Tab Buttons */}
          <Button
            variant={activeTab === 'details' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('details')}
            className={`flex-1 flex-col h-auto py-2 px-1 text-xs ${activeTab === 'details' ? 'bg-white text-black' : ''}`}
          >
            <DocumentTextIcon className="w-5 h-5 mb-1" />
            <span>Detalhes</span>
          </Button>
          <Button
            variant={activeTab === 'comments' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('comments')}
            className={`flex-1 flex-col h-auto py-2 px-1 text-xs ${activeTab === 'comments' ? 'bg-white text-black' : ''}`}
          >
            <ChatBubbleLeftRightIcon className="w-5 h-5 mb-1" />
            <span>Comentários</span>
          </Button>
          <Button
            variant={activeTab === 'logs' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('logs')}
            className={`flex-1 flex-col h-auto py-2 px-1 text-xs ${activeTab === 'logs' ? 'bg-white text-black' : ''}`}
          >
            <ClockIcon className="w-5 h-5 mb-1" />
            <span>Logs</span>
          </Button>
        </div>
        <div className="mt-4">{renderTabContent()}</div>
      </div>

      <SectionEditModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ isOpen: false, config: null, title: '' })}
        title={modalState.title}
        relato={relato}
        fieldsConfig={modalState.config}
        onSave={handleSaveChanges}
        isSaving={isSaving}
      />
    </MainLayout>
  );
};

export default RelatoDetailsPage;
