import React, { useState } from 'react';
import { Button } from '@/core/components/ui/button';
import { Input } from '@/core/components/ui/input';
import { Label } from '@/core/components/ui/label';
import { useToast } from '@/01-common/hooks/useToast';
import { createUser } from '@/05-adm/services/userService';

const CreateUserForm = ({ onUserCreated, onCancel }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName) {
      showToast('Por favor, preencha o nome completo.', 'error');
      setIsLoading(false); // Garante que o botão não fique travado
      return;
    }
    setIsLoading(true);
    try {
      const userData = { email, password, fullName };
      const { data, error } = await createUser(userData);
      if (error) throw error;
      showToast('Usuário criado com sucesso!', 'success');
      onUserCreated(data);
    } catch (err) {
      showToast(`Erro ao criar usuário: ${err.message}`, 'error');
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