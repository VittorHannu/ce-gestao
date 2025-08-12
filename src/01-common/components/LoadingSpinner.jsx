import React from 'react';

const LoadingSpinner = ({ message = 'Carregando...' }) => {
  return (
    <div className="text-center py-10">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-500 mx-auto"></div>
      <p className="mt-4 text-gray-600">{message}</p>
    </div>
  );
};

export default LoadingSpinner;
