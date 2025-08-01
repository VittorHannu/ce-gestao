import React from 'react';

const LoadingSpinner = ({ message = 'Carregando...' }) => {
  return (
    <div className="text-center py-10">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
      <p className="mt-4 text-gray-600">{message}</p>
    </div>
  );
};

export default LoadingSpinner;
