import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/01-shared/components/ui/input';
import { Textarea } from '@/01-shared/components/ui/textarea';
import { Checkbox } from '@/01-shared/components/ui/checkbox';
import { Label } from '@/01-shared/components/ui/label';
import { Button } from '@/01-shared/components/ui/button';
import MultiUserSelect from '@/01-shared/components/MultiUserSelect';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/01-shared/components/ui/select';

const RelatoForm = ({ onSubmit, isLoading, initialData, submitButtonText = 'Enviar Relato', canManageRelatos = false, canEditTratativa = false, allUsers = [], initialResponsibles = [], isUserLoggedIn }) => {
  const [isAnonymous, setIsAnonymous] = useState(() => {
    if (isUserLoggedIn) {
      return initialData?.is_anonymous || false;
    } else {
      return true;
    }
  });
  const [localOcorrencia, setLocalOcorrencia] = useState(initialData?.local_ocorrencia || '');
  const [dataOcorrencia, setDataOcorrencia] = useState(initialData?.data_ocorrencia || '');
  const [horaAproximada, setHoraAproximada] = useState(initialData?.hora_aproximada_ocorrencia || '');
  const [descricao, setDescricao] = useState(initialData?.descricao || '');
  const [riscosIdentificados, setRiscosIdentificados] = useState(initialData?.riscos_identificados || '');
  const [houveDanos, setHouveDanos] = useState(!!initialData?.danos_ocorridos);
  const [danosOcorridos, setDanosOcorridos] = useState(initialData?.danos_ocorridos || '');
  const [planejamentoCronologiaSolucao, setPlanejamentoCronologiaSolucao] = useState(initialData?.planejamento_cronologia_solucao || '');
  const [dataConclusaoSolucao, setDataConclusaoSolucao] = useState(initialData?.data_conclusao_solucao || '');
  const [tipoRelato, setTipoRelato] = useState(initialData?.tipo_relato || null);
  const [selectedResponsibles, setSelectedResponsibles] = useState([]);
  const [concluidoSemData, setConcluidoSemData] = useState(initialData?.concluido_sem_data || false);
  const initialResponsiblesRef = useRef(initialResponsibles);

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
      setTipoRelato(initialData.tipo_relato || '');
      setConcluidoSemData(initialData.concluido_sem_data || false);
    }
  }, [initialData]);

  useEffect(() => {
    if (initialResponsiblesRef.current && initialResponsiblesRef.current.length > 0) {
      setSelectedResponsibles(initialResponsiblesRef.current);
    } else {
      setSelectedResponsibles([]);
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = {
      is_anonymous: isUserLoggedIn ? isAnonymous : true,
      local_ocorrencia: localOcorrencia,
      data_ocorrencia: dataOcorrencia,
      hora_aproximada_ocorrencia: horaAproximada,
      descricao: descricao,
      riscos_identificados: riscosIdentificados,
      danos_ocorridos: houveDanos ? danosOcorridos : null,
      planejamento_cronologia_solucao: planejamentoCronologiaSolucao || null,
      data_conclusao_solucao: dataConclusaoSolucao || null,
      tipo_relato: tipoRelato || null,
      responsaveis: selectedResponsibles,
      concluido_sem_data: concluidoSemData
    };
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 p-4 rounded-lg bg-gray-50 shadow-inner">
      {/* Seção: Informações Básicas */}
      <div className="p-4 border rounded-lg bg-white">
        <h3 className="text-xl font-bold text-gray-800 pb-4 mb-6 border-b border-gray-200">Informações Básicas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {isUserLoggedIn && (
            <div className="md:col-span-2 flex items-center space-x-2">
              <Checkbox
                id="is_anonymous"
                checked={isAnonymous}
                onCheckedChange={setIsAnonymous}
              />
              <Label htmlFor="is_anonymous">Não mostrar meu nome (relato anônimo)</Label>
            </div>
          )}

          <div>
            <Label htmlFor="local_ocorrencia" className="mb-2">Local da Ocorrência *</Label>
            <Input
              id="local_ocorrencia"
              value={localOcorrencia}
              onChange={(e) => setLocalOcorrencia(e.target.value)}
              required
              className="bg-gray-100"
            />
          </div>

          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6"> {/* Nested grid for date and time */}
            <div>
              <Label htmlFor="data_ocorrencia" className="mb-2">Data da Ocorrência *</Label>
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
              <Label htmlFor="hora_aproximada" className="mb-2">Hora Aproximada</Label>
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
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="descricao" className="mb-2">Descrição da Ocorrência *</Label>
            <Textarea
              id="descricao"
              rows={4}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              required
              className="bg-gray-100"
            />
          </div>

          <div> {/* Moved Tipo de Relato here */}
            <Label htmlFor="tipo_relato" className="mb-2">Tipo de Relato</Label>
            <Select
              value={tipoRelato || ''}
              onValueChange={(value) => {
                // Se o usuário selecionar "Nenhum", limpamos o valor (definindo como null)
                // Caso contrário, usamos o valor selecionado.
                setTipoRelato(value === 'nenhum' ? null : value);
              }}
            >
              <SelectTrigger id="tipo_relato" className="bg-gray-100">
                <SelectValue placeholder="Selecione um tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nenhum">Nenhum (Limpar seleção)</SelectItem>
                <SelectItem value="Fatal">Fatal</SelectItem>
                <SelectItem value="Severo">Severo</SelectItem>
                <SelectItem value="Acidente com afastamento">Acidente com afastamento</SelectItem>
                <SelectItem value="Acidentes sem afastamento">Acidentes sem afastamento</SelectItem>
                <SelectItem value="Primeiros socorros">Primeiros socorros</SelectItem>
                <SelectItem value="quase acidente">quase acidente</SelectItem>
                <SelectItem value="condição insegura">condição insegura</SelectItem>
                <SelectItem value="comportamento inseguro">comportamento inseguro</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Seção: Detalhes da Ocorrência */}
      <div className="p-4 border rounded-lg bg-white">
        <h3 className="text-xl font-bold text-gray-800 pb-4 mb-6 border-b border-gray-200">Detalhes da Ocorrência</h3>
        <div className="space-y-6">
          <div>
            <Label htmlFor="riscos_identificados" className="mb-2">Riscos Identificados *</Label>
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
              <Label htmlFor="houve_danos" className="mb-2">Houve danos materiais ou físicos?</Label>
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
      {canEditTratativa && (
        <div className="p-4 border rounded-lg bg-white">
          <h3 className="text-xl font-bold text-gray-800 pb-4 mb-6 border-b border-gray-200">Tratativa e Conclusão (Opcional)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <Label htmlFor="planejamento_cronologia_solucao" className="mb-2">Planejamento / Cronologia da Solução</Label>
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
              <Label htmlFor="data_conclusao_solucao" className="mb-2">Data de Conclusão da Solução</Label>
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
            <div className="md:col-span-2 flex items-center space-x-2">
              <Checkbox
                id="concluido_sem_data"
                checked={concluidoSemData}
                onCheckedChange={setConcluidoSemData}
              />
              <Label htmlFor="concluido_sem_data">Tratado mas sem data de conclusão definida</Label>
            </div>
            {canManageRelatos && (
              <div className="md:col-span-2">
                <Label htmlFor="responsaveis" className="mb-2">Responsáveis pela Tratativa</Label>
                <MultiUserSelect
                  options={allUsers.map(user => ({ value: user.id, label: user.full_name || user.email }))}
                  selectedValues={selectedResponsibles}
                  onChange={setSelectedResponsibles}
                  placeholder="Selecione os responsáveis..."
                />
              </div>
            )}
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