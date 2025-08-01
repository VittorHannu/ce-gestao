




/*
 * Este componente é o formulário para criar novos usuários no sistema.
 * Ele é responsável por coletar as informações do novo usuário, como nome completo,
 * email e senha, além de definir suas permissões de acesso.
 *
 * Visualmente, este componente é um formulário que aparece em um modal (uma janela
 * sobreposta) na página de gerenciamento de usuários. Ele contém campos de texto
 * para os dados do usuário e uma série de checkboxes para atribuir papéis
 * específicos, como "super admin", "admin da portaria", etc.
 */



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
    can_update_users: false,
    can_delete_users: false,
    can_view_relatos: false,
    can_create_relatos: false,
    can_edit_relatos: false,
    can_delete_relatos: false,
    is_active: true
  });
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  const handlePermissionChange = (key, value) => {
    setPermissions(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
          {[
            'can_view_users',
            'can_create_users',
            'can_update_users',
            'can_delete_users',
            'can_view_relatos',
            'can_create_relatos',
            'can_edit_relatos',
            'can_delete_relatos',
            'is_active'
          ].map(key => {
            const displayNames = {
              can_view_users: 'Ver Usuários',
              can_create_users: 'Criar Usuários',
              can_update_users: 'Editar Usuários',
              can_delete_users: 'Apagar Usuários',
              can_view_relatos: 'Ver Relatos',
              can_create_relatos: 'Criar Relatos',
              can_edit_relatos: 'Editar Relatos',
              can_delete_relatos: 'Apagar Relatos',
              is_active: 'Ativo'
            };
            return (
              <div key={key} className="flex items-center">
                <Checkbox id={key} checked={permissions[key]} onCheckedChange={(checked) => handlePermissionChange(key, checked)} />
                <Label htmlFor={key} className="ml-2">{displayNames[key] || key}</Label>
              </div>
            );
          })}
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
