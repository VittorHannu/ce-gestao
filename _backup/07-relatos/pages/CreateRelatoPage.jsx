import React, { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { relatoSchema } from '@/07-relatos/schemas/relatoSchema';
import { saveRelato } from '@/07-relatos/services/relatosService';
import MainLayout from '@/01-common/components/MainLayout';
import RelatoForm from '@/07-relatos/components/RelatoForm';
import FormActionButtons from '@/01-common/components/FormActionButtons';

const CreateRelatoPage = () => {
  const navigate = useNavigate();
  const { user, showToast } = useOutletContext();
  const [loading, setLoading] = useState(false);

  const methods = useForm({
    resolver: zodResolver(relatoSchema),
    defaultValues: {
      descricao: '',
      local_ocorrencia: '',
      data_ocorrencia: new Date().toISOString().split('T')[0],
      hora_aproximada_ocorrencia: '',
      danos_ocorridos: '',
      nao_houve_danos: true,
      causa_real_dano: '',
      nao_sabe_causa_dano: true,
      riscos_identificados: '',
      causa_riscos_identificados: '',
      nao_sabe_causa_riscos: true,
      responsaveis: [],
      is_anonymous: false,
      nao_informar_hora_aproximada: false,
      nao_informar_data_conclusao: false,
      codigo_relato: ''
    }
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const { error } = await saveRelato(data, null, user.id);
      if (error) throw error;
      showToast('Relato criado com sucesso!', 'success');
      navigate('/relatos');
    } catch (error) {
      showToast('Erro ao criar relato: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout
      title="Novo Relato de Segurança"
      footer={null}
    >
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-8 pb-24">
          <RelatoForm
            isEditing={true}
            user={user}
            relato={null}
            tipoIncidenteOptions={[]}
            gravidadeOptions={[]}
          />
          <div className="flex items-center justify-end space-x-3 p-6">
            <FormActionButtons
              onCancel={() => navigate('/relatos')}
              onConfirm={methods.handleSubmit(onSubmit)}
              isConfirming={loading}
              confirmText="Enviar Relato"
              confirmingText="Enviando..."
              confirmButtonType="submit"
            />
          </div>
        </form>
      </FormProvider>
    </MainLayout>
  );
};

export default CreateRelatoPage;
