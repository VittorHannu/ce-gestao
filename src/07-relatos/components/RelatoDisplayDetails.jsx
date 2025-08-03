import React from 'react';

const RelatoDisplayDetails = ({ relato }) => {
  if (!relato) {
    return <p>Nenhum relato para exibir.</p>;
  }

  return (
    <div className="space-y-2 text-sm">
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
