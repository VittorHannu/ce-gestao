import React, { useState, useEffect } from 'react';
import { supabase } from '@/01-common/lib/supabase';

const RelatoDisplayDetails = ({ relato }) => {
  const [relatorName, setRelatorName] = useState('Carregando...');

  useEffect(() => {
    const fetchRelatorName = async () => {
      if (relato.is_anonymous) {
        setRelatorName('Anônimo');
        return;
      }

      if (relato.user_id) {
        const { data, error } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', relato.user_id)
          .single();

        if (error) {
          console.error('Erro ao buscar nome do relator:', error);
          setRelatorName('Erro ao carregar');
        } else if (data) {
          setRelatorName(data.full_name || 'Não informado');
        } else {
          setRelatorName('Não informado');
        }
      } else {
        setRelatorName('Não informado'); // Caso user_id seja nulo e não seja anônimo (situação inesperada)
      }
    };

    fetchRelatorName();
  }, [relato.is_anonymous, relato.user_id]);

  if (!relato) {
    return <p>Nenhum relato para exibir.</p>;
  }

  return (
    <div className="space-y-2 text-sm">
      <p><strong>Relator:</strong> {relatorName}</p>
      <p><strong>Código do Relato:</strong> {relato.relato_code || relato.id}</p>
      <p><strong>Local da Ocorrência:</strong> {relato.local_ocorrencia}</p>
      <p><strong>Data da Ocorrência:</strong> {new Date(relato.data_ocorrencia).toLocaleDateString()}</p>
      {relato.hora_aproximada_ocorrencia && <p><strong>Hora Aproximada:</strong> {relato.hora_aproximada_ocorrencia}</p>}
      <p><strong>Descrição:</strong> {relato.descricao}</p>
      <p><strong>Riscos Identificados:</strong> {relato.riscos_identificados}</p>
      {relato.danos_ocorridos && <p><strong>Danos Ocorridos:</strong> {relato.danos_ocorridos}</p>}
      {relato.planejamento_cronologia_solucao && <p><strong>Planejamento/Cronologia da Solução:</strong> {relato.planejamento_cronologia_solucao}</p>}
      {relato.data_conclusao_solucao && <p><strong>Data de Conclusão da Solução:</strong> {new Date(relato.data_conclusao_solucao).toLocaleDateString()}</p>}
      <p><strong>Status:</strong> {relato.status}</p>
      <p><strong>Criado em:</strong> {new Date(relato.created_at).toLocaleString()}</p>
    </div>
  );
};

export default RelatoDisplayDetails;
