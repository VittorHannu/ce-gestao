import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const SettingsItem = ({ label, path, value, isLast, onClick, description }) => {
  const content = description ? (
    <div className="flex flex-col">
      <span className="text-gray-800 dark:text-gray-200 font-medium">{label}</span>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>
    </div>
  ) : (
    <>
      <div className="flex items-center">
        <span className="text-gray-800 dark:text-gray-200 font-medium">{label}</span>
      </div>
      <div className="flex items-center">
        {value != null && (
          <span className="text-gray-500 dark:text-gray-400 mr-2">{value}</span>
        )}
        {(path || onClick) && <ChevronRight className="w-5 h-5 text-gray-400" />}
      </div>
    </>
  );

  const commonClassName = 'w-full flex justify-between items-center px-4 py-3 text-left';
  const interactiveClassName = 'transition-colors duration-150 hover:bg-gray-50 dark:hover:bg-gray-700';

  const Wrapper = path ? Link : (onClick ? 'button' : 'div');
  const props = path 
    ? { to: path, className: `${commonClassName} ${interactiveClassName}` }
    : onClick 
      ? { onClick, className: `${commonClassName} ${interactiveClassName}` }
      : { className: commonClassName };

  return (
    <div className="relative">
      <Wrapper {...props}>
        {content}
      </Wrapper>
      {!isLast && (
        <div className="absolute bottom-0 left-4 right-0 h-px bg-gray-200 dark:bg-gray-700" />
      )}
    </div>
  );
};

export default SettingsItem;