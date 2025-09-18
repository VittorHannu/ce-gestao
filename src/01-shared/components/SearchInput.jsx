import React, { useState, useEffect } from 'react';
import { debounce } from '@/lib/utils';

const SearchInput = ({ value, onChange, placeholder, className }) => {
  const [searchTerm, setSearchTerm] = useState(value);

  // Sincroniza o estado interno com a prop 'value' externa
  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  // Debounce para chamar o onChange externo
  useEffect(() => {
    const debouncedOnChange = debounce(() => {
      onChange(searchTerm); // Passa apenas a string do termo de pesquisa
    }, 300); // Atraso de 300ms

    debouncedOnChange();

    // Cleanup function para cancelar o debounce se o componente for desmontado ou searchTerm mudar
    return () => {
      debouncedOnChange.cancel();
    };
  }, [searchTerm, onChange]);

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleClear = () => {
    setSearchTerm('');
    onChange(''); // Chama onChange imediatamente para limpar o filtro, passando a string vazia
  };

  return (
    <div className={`relative ${className || ''}`}>
      <input
        type="text"
        placeholder={placeholder}
        className="w-full p-2 pr-8 rounded-md bg-gray-300 focus:outline-none"
        value={searchTerm}
        onChange={handleInputChange}
        autoCorrect="off"
        spellCheck="false"
      />
      {searchTerm && (
        <button
          type="button"
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 text-2xl"
          onClick={handleClear}
        >
          &times;
        </button>
      )}
    </div>
  );
};

export default SearchInput;
