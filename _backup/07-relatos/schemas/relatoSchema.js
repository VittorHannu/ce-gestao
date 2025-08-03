import * as z from 'zod';

export const relatoSchema = z.object({
  descricao: z.string().min(1, 'A descrição é obrigatória.'),
  local_ocorrencia: z.string().min(1, 'O local da ocorrência é obrigatório.'),
  data_ocorrencia: z.string().min(1, 'A data da ocorrência é obrigatória.'),
  hora_aproximada_ocorrencia: z.string().optional().nullable(),
  nao_informar_hora_aproximada: z.boolean().default(false),
  danos_ocorridos: z.string().optional().nullable(),
  nao_houve_danos: z.boolean().default(false),
  causa_real_dano: z.string().optional().nullable(),
  nao_sabe_causa_dano: z.boolean().default(false),
  riscos_identificados: z.string().min(1, 'Os riscos identificados são obrigatórios.'),
  causa_riscos_identificados: z.string().optional().nullable(),
  nao_sabe_causa_riscos: z.boolean().default(false),
  responsaveis: z.array(z.string()).optional().default([]),
  is_anonymous: z.boolean().default(false),
  tipo_incidente: z.string().optional().nullable(),
  gravidade: z.string().optional().nullable(),
  planejamento_cronologia_solucao: z.string().optional().nullable(),
  data_conclusao_solucao: z.string().optional().nullable(),
  nao_informar_data_conclusao: z.boolean().default(false),
  codigo_relato: z.string().optional().nullable()
}).superRefine((data, ctx) => {
  if (!data.nao_houve_danos && !data.danos_ocorridos) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Os danos ocorridos são obrigatórios se não houver danos.',
      path: ['danos_ocorridos']
    });
  }
  if (!data.nao_houve_danos && !data.nao_sabe_causa_dano && !data.causa_real_dano) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'A causa real do dano ocorrido é obrigatória se não souber a causa e houver danos.',
      path: ['causa_real_dano']
    });
  }
  if (!data.nao_sabe_causa_riscos && !data.causa_riscos_identificados) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'A causa dos riscos identificados é obrigatória se não souber a causa.',
      path: ['causa_riscos_identificados']
    });
  }
});
