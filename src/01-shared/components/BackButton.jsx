import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

const BackButton = () => {
  const navigate = useNavigate();

  return (
    <button onClick={() => navigate(-1)} className="focus:outline-none">
      <ChevronLeft className="h-8 w-8" strokeWidth={2.5} />
    </button>
  );
};

export default BackButton;
