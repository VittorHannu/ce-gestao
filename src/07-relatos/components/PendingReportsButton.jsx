import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/01-shared/components/ui/button';

const PendingReportsButton = ({ count, className }) => {
  const buttonText = count > 0 ? `Pendentes (${count})` : 'Pendentes';

  return (
    <Link to="/relatos/aprovacao" className="w-full">
      <Button
        variant="outline"
        size="lg"
        className={`w-full justify-center shadow-none ${className}`}>
        <span className="font-bold">{buttonText}</span>
      </Button>
    </Link>
  );
};

export default PendingReportsButton;
