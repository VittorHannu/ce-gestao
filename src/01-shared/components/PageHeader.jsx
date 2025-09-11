import React from 'react';
import BackButton from './BackButton';

const PageHeader = ({ title, actions }) => {
  return (
    <div className="flex items-center w-full">
      <BackButton />
      <h1 className="text-2xl font-bold ml-4">{title}</h1>
      {actions && <div className="ml-auto">{actions}</div>}
    </div>
  );
};

export default PageHeader;
