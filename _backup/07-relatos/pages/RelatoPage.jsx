import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';

import { relatoSchema } from '@/07-relatos/schemas/relatoSchema';
import { useRelatos } from '@/07-relatos/hooks/useRelatos';
import { getConfigOptions } from '@/01-common/services/configService';
import { Button } from '@/core/components/ui/button';
import { Card } from '@/core/components/ui/card';
import MainLayout from '@/01-common/components/MainLayout';
import RelatoForm from '@/07-relatos/components/RelatoForm';
import LoadingSpinner from '@/01-common/components/LoadingSpinner';
import { formatDateOnly } from '@/01-common/utils/dateUtils';
import BackButton from '@/01-common/components/BackButton';

const RelatoPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, showToast } = useOutletContext();
  const [tipoIncidenteOptions, setTipoIncidenteOptions] = useState([]);
  const [gravidadeOptions, setGravidadeOptions] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  const { updateRelato, removeRelato, useRelatoDetails } = useRelatos();
  const { data: relato, isLoading: pageLoading, error: relatoError } = useRelatoDetails(id);

  const isCreator = user?.id === relato?.criado_por;

  const methods = useForm({
    resolver: zodResolver(relatoSchema),
    defaultValues: {
      descricao: '',
      local_ocorrencia: '',
      data_ocorrencia: '',
      hora_aproximada_ocorrencia: '',
      danos_ocorridos: '',
      nao_houve_danos: false,
      causa_real_dano: '',
      nao_sabe_causa_dano: false,
      riscos_identificados: '',
      causa_riscos_identificados: '',
      nao_sabe_causa_riscos: false,
      tipo_incidente: '',
      gravidade: '',
      responsaveis: [],
      planejamento_cronologia_solucao: '',
      data_conclusao_solucao: '',
      is_anonymous: false,
      nao_informar_hora_aproximada: false,
      nao_informar_data_conclusao: false,
      codigo_relato: ''
    }
  });

  useEffect(() => {
    const fetchOptions = async () => {
      setTipoIncidenteOptions(await getConfigOptions('tipo_incidente'));
      setGravidadeOptions(await getConfigOptions('gravidade'));
    };
    fetchOptions();
  }, []);

  useEffect(() => {
    if (relato) {
      methods.reset({
        ...relato,
        data_ocorrencia: relato.data_ocorrencia ? new Date(relato.data_ocorrencia).toISOString().split('T')[0] : '',
        data_conclusao_solucao: relato.data_conclusao_solucao ? new Date(relato.data_conclusao_solucao).toISOString().split('T')[0] : '',
        responsaveis: relato.responsaveis ? relato.responsaveis : []
      });
      setIsEditing(false);
    }
  }, [relato, methods]);

  const onSubmit = async (data) => {
    try {
      const { data: _savedRelato, error } = await updateRelato(data, relato.id);
      if (error) throw error;
      showToast('Relato salvo com sucesso!', 'success');
      setIsEditing(false); // Volta para o modo de visualização
    } catch (error) {
      showToast('Erro ao salvar relato: ' + error.message, 'error');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Tem certeza que deseja excluir este relato?')) return;
    
    try {
      const { error } = await removeRelato(relato.id);
      if (error) throw error;
      showToast('Relato excluído com sucesso!', 'success');
      navigate('/relatos');
    } catch (error) {
      showToast('Erro ao excluir relato: ' + error.message, 'error');
    }
  };

  if (pageLoading) {
    return (
      <MainLayout title="Carregando Relato...">
        <LoadingSpinner message="Carregando relato..." />
      </MainLayout>
    );
  }

  if (relatoError) {
    showToast('Erro ao carregar relato: ' + relatoError.message, 'error');
    navigate('/relatos');
    return null; // Retorna null para evitar renderização adicional após o redirecionamento
  }

  if (!relato) {
    return (
      <MainLayout title="Relato Não Encontrado">
        <div className="text-center text-red-500 py-10">
          <p>Relato não encontrado ou você não tem permissão para visualizá-lo.</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="flex items-center mb-4">
        <BackButton />
        <h2 className="text-xl font-semibold ml-2">{relato.codigo_relato}</h2>
      </div>
      <Card className="p-6 mb-8"> {/* Novo Card principal */}
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-8"> {/* Removido pb-24 */}
            <RelatoForm
              isEditing={isEditing}
              isAdmin={isCreator} // Apenas o criador pode editar
              user={user}
              relato={relato}
              tipoIncidenteOptions={tipoIncidenteOptions}
              gravidadeOptions={gravidadeOptions}
            />

            {/* Informações de auditoria */}
            {relato && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mt-8">
                <div>
                  <strong>Criado em:</strong> {formatDateOnly(relato.created_at)}
                </div>
                <div>
                  <strong>Última atualização:</strong> {formatDateOnly(relato.updated_at)}
                </div>
              </div>
            )}

            {/* Botões de Ação */}
            <div className="flex items-center justify-end space-x-3 pt-6"> 
              {!isEditing && isCreator && (
                <>
                  <Button
                    variant="destructive"
                    type="button"
                    onClick={handleDelete}
                  >
                    Excluir
                  </Button>
                  <Button
                    onClick={() => setIsEditing(true)}
                  >
                    Editar
                  </Button>
                </>
              )}
              {isEditing && isCreator && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    onClick={methods.handleSubmit(onSubmit)}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Salvar
                  </Button>
                </>
              )}
            </div>
          </form>
        </FormProvider>
      </Card> {/* Fim do novo Card principal */}
    </MainLayout>
  );
};

export default RelatoPage;
