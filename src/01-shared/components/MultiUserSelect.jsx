import React, { useState } from 'react';
import { X } from 'lucide-react';

const MultiUserSelect = ({ options, selectedValues, onChange, placeholder = 'Selecione usuários...' }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Função para remover acentos
  const removeAccents = (str) => {
    return str.normalize('NFD').replace(/\p{Diacritic}/gu, '');
  };

  const handleSelect = (value) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter(val => val !== value));
    } else {
      onChange([...selectedValues, value]);
    }
  };

  const getSelectedUser = (value) => {
    return options.find(option => option.value === value);
  };

  const filteredOptions = options.filter(option =>
    removeAccents(option.label || '').toLowerCase().includes(removeAccents(searchTerm || '').toLowerCase())
  );

  return (
    <div className="border p-2 rounded-md bg-gray-100 w-full min-h-[100px]">
      <input
        type="text"
        placeholder="Pesquisar usuários..."
        className="w-full p-1 mb-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {selectedValues.length === 0 && searchTerm === '' && (
        <p className="text-gray-500 text-sm mb-2">{placeholder}</p>
      )}

      {/* Selected Tags */}
      <div className="flex flex-wrap gap-2 mb-2">
        {selectedValues.map(value => {
          const user = getSelectedUser(value);
          return user ? (
            <span key={user.value} className="flex items-center bg-blue-200 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {user.label}
              <X className="ml-1 w-3 h-3 cursor-pointer" onClick={() => handleSelect(user.value)} />
            </span>
          ) : null;
        })}
      </div>

      {/* Options List (only visible when searching) */}
      {searchTerm !== '' && (
        <div className="max-h-40 overflow-y-auto">
          {filteredOptions.length === 0 && (
            <p className="text-gray-500 text-sm">Nenhum usuário encontrado.</p>
          )}
          {filteredOptions.map(option => (
            <div
              key={option.value}
              className={`p-1 cursor-pointer hover:bg-gray-200 rounded-sm ${selectedValues.includes(option.value) ? 'bg-gray-300' : ''}`}
              onClick={() => handleSelect(option.value)}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MultiUserSelect;