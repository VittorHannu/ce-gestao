import React from 'react';
import { useLocation } from 'react-router-dom';
import BackButton from './BackButton';

const PageHeader = ({ title, actions, to }) => {
  const location = useLocation();
  const isRelatosListaPage = location.pathname === '/relatos/lista';

  const backButtonTo = to || (isRelatosListaPage ? '/relatos' : null);

  return (
    <div className="flex items-center w-full">
      <BackButton to={backButtonTo} />
      <h1 className="text-2xl font-bold ml-4">{title}</h1>
      {actions && <div className="ml-auto">{actions}</div>}
    </div>
  );
};

export default PageHeader;
