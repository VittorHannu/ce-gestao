import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const SettingsItem = ({ icon: Icon, iconColor, label, path, value, isLast, onClick }) => {
  const content = (
    <>
      <div className="flex items-center">
        {Icon && (
          <div className={`w-7 h-7 rounded-md flex items-center justify-center mr-4 ${iconColor}`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
        )}
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