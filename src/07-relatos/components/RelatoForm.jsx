import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useDropzone } from 'react-dropzone';
import { useSubmitRelato } from '../hooks/useSubmitRelato';

import { Button } from '@/01-shared/components/ui/button';
import { Input } from '@/01-shared/components/ui/input';
import { Textarea } from '@/01-shared/components/ui/textarea';
import { Switch } from '@/01-shared/components/ui/switch';
import { Label } from '@/01-shared/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/01-shared/components/ui/accordion';
import { DatePicker } from '@/01-shared/components/ui/DatePicker';
import { TimePicker } from '@/01-shared/components/ui/TimePicker';
import { TrashIcon, ArrowUpTrayIcon as UploadIcon, CheckCircleIcon, ExclamationTriangleIcon, PaperAirplaneIcon } from '@heroicons/react/24/solid';

const formSchema = z.object({
  descricao: z.string().min(10, 'A descrição deve ter pelo menos 10 caracteres.'),
  riscos_identificados: z.string().min(10, 'Os riscos devem ter pelo menos 10 caracteres.'),
  danos_ocorridos: z.string().optional(),
  local_ocorrencia: z.string().min(5, 'O local deve ter pelo menos 5 caracteres.'),
  data_ocorrencia: z.string({ required_error: 'A data é obrigatória.' }).nullable(),
  hora_aproximada_ocorrencia: z.string().nullable().optional(),
  is_anonymous: z.boolean().default(false)
});

const SectionTitle = ({ title, status, sectionId }) => {
  const getIcon = () => {
    if (status === 'valid') {
      return <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />;
    }
    if (sectionId === 'section-4') {
      return <PaperAirplaneIcon className="h-5 w-5 text-gray-400 mr-2" />;
    }
    if (sectionId === 'section-3') {
      return null; // No icon for optional section
    }
    if (status === 'invalid' || status === 'default') {
      return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mr-2" />;
    }
    return null;
  };

  return (
    <div className="flex items-center">
      {getIcon()}
      <span className="text-lg font-semibold">{title}</span>
    </div>
  );
};


const RelatoForm = ({ user }) => {
  const [openSection, setOpenSection] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sectionStatus, setSectionStatus] = useState({
    'section-1': 'default',
    'section-2': 'default',
    'section-3': 'default',
    'section-4': 'default'
  });
  const [imageFiles, setImageFiles] = useState([]);
  const { mutate: submitRelato, isLoading } = useSubmitRelato({ 
    onSettled: () => setIsSubmitting(false) 
  });

  const sections = useMemo(() => [
    { id: 'section-1', title: 'O que aconteceu?', fields: ['descricao', 'riscos_identificados'] },
    { id: 'section-2', title: 'Onde e quando?', fields: ['local_ocorrencia', 'data_ocorrencia'] },
    { id: 'section-3', title: 'Imagens do Evento (Opcional)', fields: [] },
    { id: 'section-4', title: 'Identificação', fields: [] }
  ], []);

  const {
    control,
    handleSubmit,
    formState: { errors, touchedFields },
    watch,
    getValues
  } = useForm({
    resolver: zodResolver(formSchema),
    mode: 'onChange', // Important for real-time validation
    defaultValues: {
      descricao: '',
      riscos_identificados: '',
      danos_ocorridos: '',
      local_ocorrencia: '',
      data_ocorrencia: new Date().toISOString().split('T')[0],
      hora_aproximada_ocorrencia: null,
      is_anonymous: !user
    }
  });

  const watchedFields = watch(['descricao', 'riscos_identificados', 'local_ocorrencia', 'data_ocorrencia']);

  useEffect(() => {
    const validateAllSections = () => {
      sections.forEach(section => {
        if (section.fields.length === 0) return;

        const hasBeenTouched = section.fields.some(field => touchedFields[field]);
        if (!hasBeenTouched) return;

        const hasErrors = section.fields.some(field => errors[field]);
        const allFieldsFilled = section.fields.every(field => !!getValues(field));

        const newStatus = allFieldsFilled && !hasErrors ? 'valid' : 'invalid';

        setSectionStatus(prevStatus => {
          if (prevStatus[section.id] === newStatus) return prevStatus;
          return {
            ...prevStatus,
            [section.id]: newStatus
          };
        });
      });
    };
    validateAllSections();
  }, [watchedFields, errors, touchedFields, getValues, sections]);


  const onDrop = useCallback((acceptedFiles) => {
    const newFiles = acceptedFiles.map(file => Object.assign(file, {
      preview: URL.createObjectURL(file)
    }));
    const updatedFiles = [...imageFiles, ...newFiles];
    setImageFiles(updatedFiles);
    setSectionStatus(prev => ({ ...prev, 'section-3': 'valid' }));
  }, [imageFiles]);

  const removeFile = (fileToRemove) => {
    const updatedFiles = imageFiles.filter(file => file !== fileToRemove);
    setImageFiles(updatedFiles);
    if (updatedFiles.length === 0) {
      setSectionStatus(prev => ({ ...prev, 'section-3': 'default' }));
    }
    URL.revokeObjectURL(fileToRemove.preview);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'image/*': [] }, multiple: true });

  const onSubmit = (data) => {
    setIsSubmitting(true);
    const relatoData = { ...data, hora_aproximada_ocorrencia: data.hora_aproximada_ocorrencia || null };
    submitRelato({ relatoData, imageFiles });
  };

  const sectionContents = {
    'section-1': (
      <div className="space-y-4">
        <div>
          <Label htmlFor="descricao">Descrição detalhada da ocorrência</Label>
          <Controller name="descricao" control={control} render={({ field }) => <Textarea {...field} rows={5} />} />
          {errors.descricao && <p className="text-red-500 text-sm">{errors.descricao.message}</p>}
        </div>
        <div>
          <Label htmlFor="riscos_identificados">Riscos identificados na situação</Label>
          <Controller name="riscos_identificados" control={control} render={({ field }) => <Textarea {...field} rows={3} />} />
          {errors.riscos_identificados && <p className="text-red-500 text-sm">{errors.riscos_identificados.message}</p>}
        </div>
        <div>
          <Label htmlFor="danos_ocorridos">Danos (apenas se houve)</Label>
          <Controller name="danos_ocorridos" control={control} render={({ field }) => <Textarea {...field} rows={3} />} />
        </div>
      </div>
    ),
    'section-2': (
      <div className="space-y-4">
        <div>
          <Label htmlFor="local_ocorrencia">Local da ocorrência</Label>
          <Controller name="local_ocorrencia" control={control} render={({ field }) => <Input {...field} />} />
          {errors.local_ocorrencia && <p className="text-red-500 text-sm">{errors.local_ocorrencia.message}</p>}
        </div>
        <div className="space-y-4">
          <div>
            <Label htmlFor="data_ocorrencia">Data da ocorrência</Label>
            <Controller
              name="data_ocorrencia"
              control={control}
              render={({ field }) => <DatePicker value={field.value} onChange={field.onChange} />}
            />
            {errors.data_ocorrencia && <p className="text-red-500 text-sm">{errors.data_ocorrencia.message}</p>}
          </div>
          <div>
            <Label htmlFor="hora_aproximada_ocorrencia">Hora aproximada (opcional)</Label>
            <Controller
              name="hora_aproximada_ocorrencia"
              control={control}
              render={({ field }) => <TimePicker value={field.value} onChange={field.onChange} />}
            />
          </div>
        </div>
      </div>
    ),
    'section-3': (
      <div className="space-y-4">
        <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}>
          <input {...getInputProps()} />
          <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-gray-600">Arraste e solte as imagens aqui, ou clique para selecionar</p>
        </div>
        {imageFiles.length > 0 && (
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {imageFiles.map((file, index) => (
              <div key={index} className="relative group border rounded-lg overflow-hidden">
                <img src={file.preview} alt={`Preview ${file.name}`} className="h-32 w-full object-cover" />
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="destructive" size="icon" onClick={() => removeFile(file)}><TrashIcon className="h-5 w-5" /></Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    ),
    'section-4': (
      <div className="space-y-4">
        {user ? (
          <>
            <div className="flex items-center space-x-2">
              <Controller name="is_anonymous" control={control} render={({ field }) => <Switch id="is_anonymous" checked={field.value} onCheckedChange={field.onChange} />} />
              <Label htmlFor="is_anonymous">Enviar como anônimo</Label>
            </div>
            {!watch('is_anonymous') && (
              <p className='text-sm text-muted-foreground'>
                Seu relato será enviado em nome de: <strong>{user.full_name}</strong>.
              </p>
            )}
          </>
        ) : (
          <p className='text-sm text-muted-foreground'>
            Você não está logado. Para se identificar, <a href="/login" className="underline">faça login</a>. Caso contrário, seu relato será enviado como anônimo.
          </p>
        )}
        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isLoading || isSubmitting}>
            {isLoading || isSubmitting ? 'Enviando...' : 'Enviar Relato'}
          </Button>
        </div>
      </div>
    )
  };


  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full">
      <Accordion type="single" collapsible value={openSection} onValueChange={setOpenSection} className="w-full space-y-4">
        {sections.map((section) => (
          <AccordionItem value={section.id} key={section.id} className="w-full border shadow-sm rounded-lg bg-white">
            <AccordionTrigger className="p-6">
              <SectionTitle title={section.title} status={sectionStatus[section.id] || 'default'} sectionId={section.id} />
            </AccordionTrigger>
            <AccordionContent className="p-6 pt-0">
              {sectionContents[section.id]}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </form>
  );
};

export default RelatoForm;