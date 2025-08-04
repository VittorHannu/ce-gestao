import React from 'react';
import { X } from 'lucide-react';

const MultiUserSelect = ({ options, selectedValues, onChange, placeholder = 'Selecione usuários...' }) => {
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

  return (
    <div className="border p-2 rounded-md bg-gray-100 w-full min-h-[100px]">
      {selectedValues.length === 0 && (
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

      {/* Options List */}
      <div className="max-h-40 overflow-y-auto">
        {options.map(option => (
          <div
            key={option.value}
            className={`p-1 cursor-pointer hover:bg-gray-200 rounded-sm ${selectedValues.includes(option.value) ? 'bg-gray-300' : ''}`}
            onClick={() => handleSelect(option.value)}
          >
            {option.label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MultiUserSelect;
