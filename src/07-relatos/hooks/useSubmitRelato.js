

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/01-shared/hooks/useToast';
import { submitRelato } from '../services/relatosService';

export const useSubmitRelato = ({ onSettled }) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { toast } = useToast();

  return useMutation({
    mutationFn: submitRelato,
    onSuccess: (data, variables) => {
      const { relatoId, relatoCode } = data;
      const { relatoData, imageFiles } = variables;
      const submissionTimestamp = new Date();

      toast({ title: 'Relato enviado com sucesso!', description: 'Sua contribuição foi registrada.', type: 'success' });

      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['relatos'] });
      queryClient.invalidateQueries({ queryKey: ['relatoCounts'] });
      queryClient.invalidateQueries({ queryKey: ['lastAccidentDate'] });
      queryClient.invalidateQueries({ queryKey: ['recordeSemAcidentes'] });

      // Navigate to the confirmation page with the necessary data
      navigate('/relato-confirmation', {
        state: { 
          submissionData: { 
            relatoId, 
            relatoCode, 
            relatoData, 
            imageUrls: imageFiles.map(f => f.preview), // Pass image previews for display
            submissionTimestamp
          } 
        },
        replace: true // Replace the form page in history
      });
    },
    onError: (error) => {
      console.error('Erro detalhado ao criar relato:', error);
      toast({ title: `Erro ao enviar o relato: ${error.message}`, type: 'error' });
    },
    onSettled: () => {
      if (onSettled) {
        onSettled();
      }
    }
  });
};

