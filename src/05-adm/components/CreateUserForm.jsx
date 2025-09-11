import React, { useState } from 'react';
import { Button } from '@/01-shared/components/ui/button';
import { Input } from '@/01-shared/components/ui/input';
import { Label } from '@/01-shared/components/ui/label';
import { useToast } from '@/01-shared/hooks/useToast';
import { createUser } from '@/05-adm/services/userService';

const CreateUserForm = ({ onUserCreated, onCancel }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName) {
      toast({ title: 'Por favor, preencha o nome completo.', variant: 'destructive' });
      setIsLoading(false); // Garante que o botão não fique travado
      return;
    }
    setIsLoading(true);
    try {
      const userData = { email, password, fullName };
      const { data, error } = await createUser(userData);
      if (error) throw error;
      toast({ title: 'Usuário criado com sucesso!' });
      onUserCreated(data);
    } catch (err) {
      toast({ title: 'Erro ao criar usuário', description: err.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="fullName">Nome Completo</Label>
        <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="password">Senha</Label>
        <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>Cancelar</Button>
        <Button type="submit" disabled={isLoading}>{isLoading ? 'Criando...' : 'Criar Usuário'}</Button>
      </div>
    </form>
  );
};

export default CreateUserForm;