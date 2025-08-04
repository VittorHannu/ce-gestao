import React, { useState, useEffect } from 'react';
import { Input } from '@/core/components/ui/input';
import { Textarea } from '@/core/components/ui/textarea';
import { Checkbox } from '@/core/components/ui/checkbox';
import { Label } from '@/core/components/ui/label';
import { Button } from '@/core/components/ui/button';
import MultiUserSelect from '@/01-common/components/MultiUserSelect';

const RelatoForm = ({ onSubmit, isLoading, initialData, submitButtonText = 'Enviar Relato', canManageRelatos = false, allUsers = [], initialResponsibles = [] }) => {
  const [isAnonymous, setIsAnonymous] = useState(initialData?.is_anonymous || false);
  const [localOcorrencia, setLocalOcorrencia] = useState(initialData?.local_ocorrencia || '');
  const [dataOcorrencia, setDataOcorrencia] = useState(initialData?.data_ocorrencia || '');
  const [horaAproximada, setHoraAproximada] = useState(initialData?.hora_aproximada_ocorrencia || '');
  const [descricao, setDescricao] = useState(initialData?.descricao || '');
  const [riscosIdentificados, setRiscosIdentificados] = useState(initialData?.riscos_identificados || '');
  const [houveDanos, setHouveDanos] = useState(!!initialData?.danos_ocorridos); // Converte para boolean
  const [danosOcorridos, setDanosOcorridos] = useState(initialData?.danos_ocorridos || '');
  const [planejamentoCronologiaSolucao, setPlanejamentoCronologiaSolucao] = useState(initialData?.planejamento_cronologia_solucao || '');
  const [dataConclusaoSolucao, setDataConclusaoSolucao] = useState(initialData?.data_conclusao_solucao || '');
  const [selectedResponsibles, setSelectedResponsibles] = useState([]); // Novo estado para responsáveis selecionados

  useEffect(() => {
    if (initialData) {
      setIsAnonymous(initialData.is_anonymous || false);
      setLocalOcorrencia(initialData.local_ocorrencia || '');
      setDataOcorrencia(initialData.data_ocorrencia || '');
      setHoraAproximada(initialData.hora_aproximada_ocorrencia || '');
      setDescricao(initialData.descricao || '');
      setRiscosIdentificados(initialData.riscos_identificados || '');
      setHouveDanos(!!initialData.danos_ocorridos);
      setDanosOcorridos(initialData.danos_ocorridos || '');
      setPlanejamentoCronologiaSolucao(initialData.planejamento_cronologia_solucao || '');
      setDataConclusaoSolucao(initialData.data_conclusao_solucao || '');
    }
    // Inicializa os responsáveis selecionados
    if (initialResponsibles && initialResponsibles.length > 0) {
      setSelectedResponsibles(initialResponsibles);
    } else {
      setSelectedResponsibles([]);
    }
  }, [initialData, initialResponsibles]);

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
      responsaveis: selectedResponsibles // Adiciona os responsáveis selecionados
    };
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Seção: Informações Básicas */}
      <div className="p-4 border rounded-lg bg-white">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Informações Básicas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2 flex items-center space-x-2">
            <Checkbox
              id="is_anonymous"
              checked={isAnonymous}
              onCheckedChange={setIsAnonymous}
            />
            <Label htmlFor="is_anonymous">Não mostrar meu nome (relato anônimo)</Label>
          </div>

          <div>
            <Label htmlFor="local_ocorrencia">Local da Ocorrência *</Label>
            <Input
              id="local_ocorrencia"
              value={localOcorrencia}
              onChange={(e) => setLocalOcorrencia(e.target.value)}
              required
              className="bg-gray-100"
            />
          </div>

          <div>
            <Label htmlFor="data_ocorrencia">Data da Ocorrência *</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="data_ocorrencia"
                type="date"
                value={dataOcorrencia}
                onChange={(e) => setDataOcorrencia(e.target.value)}
                required
                className="bg-gray-100"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => setDataOcorrencia('')}
                className="px-3 py-2 text-sm"
              >
                Limpar
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="hora_aproximada">Hora Aproximada</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="hora_aproximada"
                type="time"
                value={horaAproximada}
                onChange={(e) => setHoraAproximada(e.target.value)}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => setHoraAproximada('')}
                className="px-3 py-2 text-sm"
              >
                Limpar
              </Button>
            </div>
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="descricao">Descrição da Ocorrência *</Label>
            <Textarea
              id="descricao"
              rows={4}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              required
              className="bg-gray-100"
            />
          </div>
        </div>
      </div>

      {/* Seção: Detalhes da Ocorrência */}
      <div className="p-4 border rounded-lg bg-white">
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
              className="bg-gray-100"
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
      {canManageRelatos && (
        <div className="p-4 border rounded-lg bg-white">
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
                className="bg-gray-100"
              />
            </div>
            <div>
              <Label htmlFor="data_conclusao_solucao">Data de Conclusão da Solução</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="data_conclusao_solucao"
                  type="date"
                  value={dataConclusaoSolucao}
                  onChange={(e) => setDataConclusaoSolucao(e.target.value)}
                  className="bg-gray-100"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDataConclusaoSolucao('')}
                  className="px-3 py-2 text-sm"
                >
                  Limpar
                </Button>
              </div>
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="responsaveis">Responsáveis pela Tratativa</Label>
              <MultiUserSelect
                options={allUsers.map(user => ({ value: user.id, label: user.full_name || user.email }))}
                selectedValues={selectedResponsibles}
                onChange={setSelectedResponsibles}
                placeholder="Selecione os responsáveis..."
              />
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Salvando...' : submitButtonText}
        </Button>
      </div>
    </form>
  );
};

export default RelatoForm;
