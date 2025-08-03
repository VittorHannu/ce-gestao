import React, { useState } from 'react';
import { Input } from '@/core/components/ui/input';
import { Textarea } from '@/core/components/ui/textarea';
import { Checkbox } from '@/core/components/ui/checkbox';
import { Label } from '@/core/components/ui/label';
import { Button } from '@/core/components/ui/button';

const RelatoForm = ({ onSubmit, isLoading }) => {
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [localOcorrencia, setLocalOcorrencia] = useState('');
  const [dataOcorrencia, setDataOcorrencia] = useState('');
  const [horaAproximada, setHoraAproximada] = useState('');
  const [descricao, setDescricao] = useState('');
  const [riscosIdentificados, setRiscosIdentificados] = useState('');
  const [houveDanos, setHouveDanos] = useState(false);
  const [danosOcorridos, setDanosOcorridos] = useState('');
  const [planejamentoCronologiaSolucao, setPlanejamentoCronologiaSolucao] = useState('');
  const [dataConclusaoSolucao, setDataConclusaoSolucao] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = {
      is_anonymous: isAnonymous,
      local_ocorrencia: localOcorrencia,
      data_ocorrencia: dataOcorrencia,
      hora_aproximada_ocorrencia: horaAproximada,
      descricao: descricao,
      riscos_identificados: riscosIdentificados,
      danos_ocorridos: houveDanos ? danosOcorridos : null,
      planejamento_cronologia_solucao: planejamentoCronologiaSolucao || null,
      data_conclusao_solucao: dataConclusaoSolucao || null,
    };
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Seção: Informações Básicas */}
      <div className="p-4 border rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Informações Básicas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2 flex items-center space-x-2">
            <Checkbox
              id="is_anonymous"
              checked={isAnonymous}
              onCheckedChange={setIsAnonymous}
            />
            <Label htmlFor="is_anonymous">Ocultar meu nome (relato anônimo)</Label>
          </div>

          <div>
            <Label htmlFor="local_ocorrencia">Local da Ocorrência *</Label>
            <Input
              id="local_ocorrencia"
              value={localOcorrencia}
              onChange={(e) => setLocalOcorrencia(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="data_ocorrencia">Data da Ocorrência *</Label>
            <Input
              id="data_ocorrencia"
              type="date"
              value={dataOcorrencia}
              onChange={(e) => setDataOcorrencia(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="hora_aproximada">Hora Aproximada</Label>
            <Input
              id="hora_aproximada"
              type="time"
              value={horaAproximada}
              onChange={(e) => setHoraAproximada(e.target.value)}
            />
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="descricao">Descrição da Ocorrência *</Label>
            <Textarea
              id="descricao"
              rows={4}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              required
            />
          </div>
        </div>
      </div>

      {/* Seção: Detalhes da Ocorrência */}
      <div className="p-4 border rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Detalhes da Ocorrência</h3>
        <div className="space-y-6">
          <div>
            <Label htmlFor="riscos_identificados">Riscos Identificados *</Label>
            <Textarea
              id="riscos_identificados"
              rows={3}
              value={riscosIdentificados}
              onChange={(e) => setRiscosIdentificados(e.target.value)}
              required
            />
          </div>

          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Checkbox
                id="houve_danos"
                checked={houveDanos}
                onCheckedChange={setHouveDanos}
              />
              <Label htmlFor="houve_danos">Houve danos materiais ou físicos?</Label>
            </div>
            {houveDanos && (
              <Textarea
                id="danos_ocorridos"
                rows={3}
                placeholder="Descreva os danos ocorridos..."
                value={danosOcorridos}
                onChange={(e) => setDanosOcorridos(e.target.value)}
              />
            )}
          </div>
        </div>
      </div>

      {/* Seção: Tratativa e Conclusão */}
      <div className="p-4 border rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Tratativa e Conclusão (Opcional)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <Label htmlFor="planejamento_cronologia_solucao">Planejamento / Cronologia da Solução</Label>
            <Textarea
              id="planejamento_cronologia_solucao"
              rows={3}
              value={planejamentoCronologiaSolucao}
              onChange={(e) => setPlanejamentoCronologiaSolucao(e.target.value)}
              placeholder="Descreva o planejamento ou cronologia da solução..."
            />
          </div>
          <div>
            <Label htmlFor="data_conclusao_solucao">Data de Conclusão da Solução</Label>
            <Input
              id="data_conclusao_solucao"
              type="date"
              value={dataConclusaoSolucao}
              onChange={(e) => setDataConclusaoSolucao(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Enviando...' : 'Enviar Relato'}
        </Button>
      </div>
    </form>
  );
};

export default RelatoForm;
