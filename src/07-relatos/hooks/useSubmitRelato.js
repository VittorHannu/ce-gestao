
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/01-shared/hooks/useToast';
import { submitRelato } from '../services/relatosService';

export const useSubmitRelato = (isUserLoggedIn) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { toast } = useToast();

  return useMutation({
    mutationFn: submitRelato,
    onSuccess: () => {
      toast({ title: 'Relato enviado com sucesso!', description: 'Sua contribuição foi registrada.', type: 'success' });

      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['relatos'] });
      queryClient.invalidateQueries({ queryKey: ['relatoCounts'] });
      queryClient.invalidateQueries({ queryKey: ['lastAccidentDate'] });
      queryClient.invalidateQueries({ queryKey: ['recordeSemAcidentes'] });

      if (isUserLoggedIn) {
        navigate('/relatos');
      } else {
        // After anonymous submission, navigate to a confirmation or home page
        navigate('/'); // Or a specific thank you page
      }
    },
    onError: (error) => {
      console.error('Erro detalhado ao criar relato:', error);
      toast({ title: `Erro ao enviar o relato: ${error.message}`, type: 'error' });
    }
  });
};
