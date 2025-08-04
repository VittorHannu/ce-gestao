import React, { useState } from 'react';
import { Button } from '@/core/components/ui/button';
import { Input } from '@/core/components/ui/input';
import { Label } from '@/core/components/ui/label';
import { Checkbox } from '@/core/components/ui/checkbox';
import { useToast } from '@/01-common/hooks/useToast';
import { createUser } from '@/05-adm/services/userService';

const CreateUserForm = ({ onUserCreated, onCancel }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [permissions, setPermissions] = useState({
    can_view_users: false,
    can_create_users: false,
    can_delete_users: false,
    can_manage_relatos: false,
    is_active: true
  });
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  const handlePermissionChange = (key, value) => {
    setPermissions(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName) {
      showToast('Por favor, preencha o nome completo.', 'error');
      setIsLoading(false); // Garante que o botão não fique travado
      return;
    }
    setIsLoading(true);
    try {
      const userData = { email, password, fullName, permissions };
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

  const permissionFields = [
    { key: 'can_view_users', label: 'Visualizar Usuários' },
    { key: 'can_create_users', label: 'Criar Usuários' },
    { key: 'can_delete_users', label: 'Deletar Usuários' },
    { key: 'can_manage_relatos', label: 'Gerenciar Relatos' },
    { key: 'can_view_feedbacks', label: 'Visualizar Feedbacks' },
    { key: 'is_active', label: 'Ativo' }
  ];

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
      <div className="space-y-2">
        <Label>Permissões</Label>
        <div className="grid grid-cols-2 gap-2">
          {permissionFields.map(({ key, label }) => (
            <div key={key} className="flex items-center">
              <Checkbox
                id={key}
                checked={permissions[key]}
                onCheckedChange={(checked) => handlePermissionChange(key, checked)}
              />
              <Label htmlFor={key} className="ml-2">{label}</Label>
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>Cancelar</Button>
        <Button type="submit" disabled={isLoading}>{isLoading ? 'Criando...' : 'Criar Usuário'}</Button>
      </div>
    </form>
  );
};

export default CreateUserForm;