import React from 'react';
import { useFormContext } from 'react-hook-form';
import { User } from 'lucide-react';

import { Input } from '@/core/components/ui/input';
import { Textarea } from '@/core/components/ui/textarea';
import { Checkbox } from '@/core/components/ui/checkbox';
import { Label } from '@/core/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/core/components/ui/select';


const RelatoForm = ({ isEditing, relato, user, tipoIncidenteOptions, gravidadeOptions }) => {
  const { register, setValue, watch, formState: { errors } } = useFormContext();

  const naoHouveDanos = watch('nao_houve_danos');
  const naoSabeCausaDano = watch('nao_sabe_causa_dano');
  const naoSabeCausaRiscos = watch('nao_sabe_causa_riscos');
  const naoInformarHoraAproximada = watch('nao_informar_hora_aproximada');

  return (
    <>
      {/* Seção: Informações Básicas */}
      <div className="p-4 mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Informações Básicas da Ocorrência</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nome do Relator */}
          <div className="md:col-span-2">
            <Label htmlFor="creator_name" className="mb-2 text-gray-700">Nome do Relator</Label>
            <div className="flex items-center justify-between">
              <p className="text-gray-700 font-medium">
                {relato?.creator_name || user?.user_metadata?.full_name}
              </p>
              {(isEditing || !relato) && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_anonymous"
                    checked={watch('is_anonymous')}
                    onCheckedChange={(checked) => setValue('is_anonymous', checked)}
                  />
                  <Label htmlFor="is_anonymous" className="text-gray-700">Ocultar meu nome</Label>
                </div>
              )}
            </div>
          </div>

          {/* Código do Relato (apenas visualização) */}
          {relato?.codigo_relato && (
            <div>
              <Label htmlFor="codigo_relato" className="mb-2 text-gray-700">Código do Relato</Label>
              <p className="text-gray-700 font-medium">{relato.codigo_relato}</p>
            </div>
          )}

          {/* Local da Ocorrência */}
          <div>
            <Label htmlFor="local_ocorrencia" className="mb-2 text-gray-700">
              Local *
            </Label>
            {(isEditing || !relato) ? (
              <Input
                id="local_ocorrencia"
                type="text"
                {...register('local_ocorrencia')}
              />
            ) : (
              <p className="text-gray-700">{relato?.local_ocorrencia}</p>
            )}
            {errors.local_ocorrencia && <p className="text-red-500 text-sm mt-1">{errors.local_ocorrencia.message}</p>}
          </div>

          {/* Data da Ocorrência */}
          <div>
            <Label htmlFor="data_ocorrencia" className="mb-2 text-gray-700">
              Data *
            </Label>
            {(isEditing || !relato) ? (
              <Input
                id="data_ocorrencia"
                type="date"
                {...register('data_ocorrencia')}
              />
            ) : (
              <p className="text-gray-700">{relato?.data_ocorrencia}</p>
            )}
            {errors.data_ocorrencia && <p className="text-red-500 text-sm mt-1">{errors.data_ocorrencia.message}</p>}
          </div>

          {/* Hora Aproximada da Ocorrência */}
          <div>
            <Label htmlFor="hora_aproximada_ocorrencia" className="mb-2 text-gray-700">
              Hora Aproximada
            </Label>
            {(isEditing || !relato) ? (
              <div className="flex flex-col">
                <div className="flex items-center space-x-2 mb-2">
                  <Checkbox
                    id="nao_informar_hora_aproximada"
                    checked={watch('nao_informar_hora_aproximada')}
                    onCheckedChange={(checked) => {
                      setValue('nao_informar_hora_aproximada', checked);
                      if (checked) {
                        setValue('hora_aproximada_ocorrencia', '');
                      }
                    }}
                  />
                  <Label htmlFor="nao_informar_hora_aproximada" className="text-gray-700">Não informar hora</Label>
                </div>
                <Input
                  id="hora_aproximada_ocorrencia"
                  type="time"
                  {...register('hora_aproximada_ocorrencia')}
                  disabled={naoInformarHoraAproximada}
                />
              </div>
            ) : (
              <p className="text-gray-700">{relato?.nao_informar_hora_aproximada ? 'Não informado' : relato?.hora_aproximada_ocorrencia || 'Não informado'}</p>
            )}
          </div>

          {/* Descrição */}
          <div className="md:col-span-2">
            <Label htmlFor="descricao" className="mb-2 text-gray-700">Descrição *</Label>
            {(isEditing || !relato) ? (
              <Textarea
                id="descricao"
                rows={4}
                {...register('descricao')}
              />
            ) : (
              <p className="text-gray-700 whitespace-pre-wrap">{relato?.descricao}</p>
            )}
            {errors.descricao && <p className="text-red-500 text-sm mt-1">{errors.descricao.message}</p>}
          </div>
        </div>
      </div>

      {/* Seção: Detalhes da Ocorrência */}
      <div className="p-4 mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Detalhes da Ocorrência</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Riscos Identificados */}
          <div className="md:col-span-2">
            <Label htmlFor="riscos_identificados" className="mb-2 text-gray-700">Riscos Identificados *</Label>
            {(isEditing || !relato) ? (
              <Textarea
                id="riscos_identificados"
                rows={3}
                {...register('riscos_identificados')}
              />
            ) : (
              <p className="text-gray-700 whitespace-pre-wrap">{relato?.riscos_identificados || 'Não informado'}</p>
            )}
            {errors.riscos_identificados && <p className="text-red-500 text-sm mt-1">{errors.riscos_identificados.message}</p>}
          </div>

          {/* Causa dos Riscos Identificados */}
          <div className="md:col-span-2">
            <Label htmlFor="nao_sabe_causa_riscos" className="mb-2 text-gray-700">Causa dos Riscos Identificados</Label>
            {(isEditing || !relato) ? (
              <div className="flex items-center space-x-2 mb-2">
                <Checkbox
                  id="sabe_causa_riscos"
                  checked={!naoSabeCausaRiscos}
                  onCheckedChange={(checked) => setValue('nao_sabe_causa_riscos', !checked)}
                />
                <Label htmlFor="sabe_causa_riscos" className="text-gray-700">Sabe a causa dos riscos</Label>
              </div>
            ) : (
              <p className="text-gray-700">{relato?.nao_sabe_causa_riscos ? 'Não sabe a causa dos riscos' : ''}</p>
            )}

            {!naoSabeCausaRiscos && (
              (isEditing || !relato) ? (
                <Textarea
                  id="causa_riscos_identificados"
                  rows={3}
                  {...register('causa_riscos_identificados')}
                />
              ) : (
                <p className="text-gray-700 whitespace-pre-wrap">{relato?.causa_riscos_identificados || 'Não informado'}</p>
              )
            )}
            {errors.causa_riscos_identificados && <p className="text-red-500 text-sm mt-1">{errors.causa_riscos_identificados.message}</p>}
          </div>

          {/* Danos Ocorridos */}
          <div className="md:col-span-2">
            <Label htmlFor="nao_houve_danos" className="mb-2 text-gray-700">Danos Ocorridos</Label>
            {(isEditing || !relato) ? (
              <div className="flex items-center space-x-2 mb-2">
                <Checkbox
                  id="houve_danos"
                  checked={!naoHouveDanos}
                  onCheckedChange={(checked) => setValue('nao_houve_danos', !checked)}
                />
                <Label htmlFor="houve_danos" className="text-gray-700">Houve danos ocorridos</Label>
              </div>
            ) : (
              <p className="text-gray-700">{relato?.nao_houve_danos ? 'Não houve danos ocorridos' : ''}</p>
            )}

            {!naoHouveDanos && (
              (isEditing || !relato) ? (
                <Textarea
                  id="danos_ocorridos"
                  rows={3}
                  {...register('danos_ocorridos')}
                />
              ) : (
                <p className="text-gray-700 whitespace-pre-wrap">{relato?.danos_ocorridos || 'Não informado'}</p>
              )
            )}
            {errors.danos_ocorridos && <p className="text-red-500 text-sm mt-1">{errors.danos_ocorridos.message}</p>}
          </div>

          {/* Causa Real do Dano Ocorrido */}
          {!naoHouveDanos && (
            <div className="md:col-span-2">
              <Label htmlFor="nao_sabe_causa_dano" className="mb-2 text-gray-700">Causa Real do Dano Ocorrido</Label>
              {(isEditing || !relato) ? (
                <div className="flex items-center space-x-2 mb-2">
                  <Checkbox
                    id="sabe_causa_dano"
                    checked={!naoSabeCausaDano}
                    onCheckedChange={(checked) => setValue('nao_sabe_causa_dano', !checked)}
                  />
                  <Label htmlFor="sabe_causa_dano" className="text-gray-700">Sabe a causa real</Label>
                </div>
              ) : (
                <p className="text-gray-700">{relato?.nao_sabe_causa_dano ? 'Não sabe a causa real' : ''}</p>
              )}

              {!naoSabeCausaDano && (
                (isEditing || !relato) ? (
                  <Textarea
                    id="causa_real_dano"
                    rows={3}
                    {...register('causa_real_dano')}
                  />
                ) : (
                  <p className="text-gray-700 whitespace-pre-wrap">{relato?.causa_real_dano || 'Não informado'}</p>
                )
              )}
              {errors.causa_real_dano && <p className="text-red-500 text-sm mt-1">{errors.causa_real_dano.message}</p>}
            </div>
          )}
        </div>
      </div>

      {/* Seção: Classificação e Responsáveis (apenas para admin ou edição) */}
      {(relato || !isEditing) && (
        <div className="p-4 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Classificação e Responsáveis</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tipo de Incidente */}
            <div>
              <Label htmlFor="tipo_incidente" className="mb-2 text-gray-700">Tipo de Incidente *</Label>
              {isEditing ? (
                <Select
                  value={watch('tipo_incidente') || ''}
                  onValueChange={(value) => setValue('tipo_incidente', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {tipoIncidenteOptions.map(option => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-gray-700">{relato?.tipo_incidente || 'Não informado'}</p>
              )}
              {errors.tipo_incidente && <p className="text-red-500 text-sm mt-1">{errors.tipo_incidente.message}</p>}
            </div>

            {/* Gravidade */}
            <div>
              <Label htmlFor="gravidade" className="mb-2 text-gray-700">
                Gravidade *
              </Label>
              {isEditing ? (
                <Select
                  value={watch('gravidade') || ''}
                  onValueChange={(value) => setValue('gravidade', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {gravidadeOptions.map(option => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-gray-700">{relato?.gravidade || 'Não informado'}</p>
              )}
              {errors.gravidade && <p className="text-red-500 text-sm mt-1">{errors.gravidade.message}</p>}
            </div>
          </div>
        </div>
      )}

      {/* Seção: Tratativa e Conclusão (apenas para admin ou edição) */}
      {(relato || !isEditing) && (
        <div className="p-4 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Tratativa e Conclusão</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Responsáveis */}
            <div>
              <Label htmlFor="responsaveis" className="mb-2 text-gray-700">
                <User className="inline w-4 h-4 mr-1" />
                Responsáveis (separados por vírgula)
              </Label>
              {isEditing ? (
                <Input
                  id="responsaveis"
                  type="text"
                  value={watch('responsaveis')?.join(', ') || ''}
                  onChange={(e) => setValue('responsaveis', e.target.value.split(',').map(s => s.trim()))}
                />
              ) : (
                <p className="text-gray-700">{relato?.responsaveis && relato.responsaveis.length > 0 ? relato.responsaveis.join(', ') : 'Não informado'}</p>
              )}
              {errors.responsaveis && <p className="text-red-500 text-sm mt-1">{errors.responsaveis.message}</p>}
            </div>
            {/* Status (apenas visualização) */}
            <div>
              <Label htmlFor="status" className="mb-2 text-gray-700">Status</Label>
              <p className="text-gray-700">{relato?.calculated_status || 'Não informado'}</p>
            </div>
            {/* Planejamento / Cronologia da Solução */}
            <div className="md:col-span-2">
              <Label htmlFor="planejamento_cronologia_solucao" className="mb-2 text-gray-700">Planejamento / Cronologia da Solução</Label>
              {isEditing ? (
                <Textarea
                  id="planejamento_cronologia_solucao"
                  rows={3}
                  {...register('planejamento_cronologia_solucao')}
                />
              ) : (
                <p className="text-gray-700 whitespace-pre-wrap">{relato?.planejamento_cronologia_solucao || 'Não informado'}</p>
              )
              }
              {errors.planejamento_cronologia_solucao && <p className="text-red-500 text-sm mt-1">{errors.planejamento_cronologia_solucao.message}</p>}
            </div>

            {/* Data de Conclusão da Solução */}
            <div>
              <Label htmlFor="data_conclusao_solucao" className="mb-2 text-gray-700">
                Data de Conclusão da Solução
              </Label>
              {isEditing ? (
                <div className="flex flex-col">
                  <div className="flex items-center space-x-2 mb-2">
                    <Checkbox
                      id="nao_informar_data_conclusao"
                      checked={watch('nao_informar_data_conclusao')}
                      onCheckedChange={(checked) => {
                        setValue('nao_informar_data_conclusao', checked);
                        if (checked) {
                          setValue('data_conclusao_solucao', '');
                        }
                      }}
                    />
                    <Label htmlFor="nao_informar_data_conclusao" className="text-gray-700">Não informar data de conclusão</Label>
                  </div>
                  <Input
                    id="data_conclusao_solucao"
                    type="date"
                    {...register('data_conclusao_solucao')}
                    disabled={watch('nao_informar_data_conclusao')}
                  />
                </div>
              ) : (
                <p className="text-gray-700">{relato?.nao_informar_data_conclusao ? 'Não informado' : relato?.data_conclusao_solucao || 'Não informado'}</p>
              )}
              {errors.data_conclusao_solucao && <p className="text-red-500 text-sm mt-1">{errors.data_conclusao_solucao.message}</p>}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RelatoForm;
