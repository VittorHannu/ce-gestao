import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/01-shared/hooks/useToast';
import { createRelatoWithImages } from '../services/relatosService';

export const useCreateRelato = (isUserLoggedIn) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { toast } = useToast();

  return useMutation({
    mutationFn: createRelatoWithImages, // Use the new function
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
        navigate('/auth');
      }
    },
    onError: (error) => {
      console.error('Erro detalhado ao criar relato:', error);
      toast({ title: `Erro ao enviar o relato: ${error.message}`, type: 'error' });
    }
  });
};