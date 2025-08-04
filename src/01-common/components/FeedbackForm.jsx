import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/01-common/lib/supabase';
import { useOutletContext } from 'react-router-dom';

import { Button } from '@/core/components/ui/button';
import { Input } from '@/core/components/ui/input';
import { Label } from '@/core/components/ui/label';
import { Textarea } from '@/core/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/core/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/core/components/ui/dialog';

const FeedbackForm = ({ isOpen, onClose }) => {
  const { showToast } = useOutletContext();
  const [reportType, setReportType] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');

  const { mutate: submitFeedback, isLoading: isSubmitting } = useMutation({
    mutationFn: async (data) => {
      const { error } = await supabase.from('feedback_reports').insert(data);
      if (error) throw error;
    },
    onSuccess: () => {
      showToast('Seu feedback/relatório foi enviado com sucesso! Agradecemos sua contribuição.', 'success');
      setReportType('');
      setSubject('');
      setDescription('');
      onClose();
    },
    onError: (error) => {
      showToast(`Erro ao enviar feedback: ${error.message}`, 'error');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reportType || !description) {
      showToast('Por favor, preencha o tipo e a descrição.', 'error');
      return;
    }
    submitFeedback({ report_type: reportType, subject, description, user_id: supabase.auth.user()?.id });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Enviar Feedback ou Relatar Erro</DialogTitle>
          <DialogDescription>
            Ajude-nos a melhorar o sistema. Descreva o problema ou sua sugestão.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="reportType" className="text-right">
                Tipo
              </Label>
              <Select onValueChange={setReportType} value={reportType}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="feedback">Feedback</SelectItem>
                  <SelectItem value="bug">Bug / Erro</SelectItem>
                  <SelectItem value="suggestion">Sugestão</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="subject" className="text-right">
                Assunto
              </Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="col-span-3"
                placeholder="Assunto breve (opcional)"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Descrição
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="col-span-3"
                placeholder="Descreva detalhadamente o feedback, erro ou sugestão."
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Enviando...' : 'Enviar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackForm;
