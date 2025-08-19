import React from 'react';

const SettingsGroup = ({ children }) => {
  const items = React.Children.toArray(children);
  return (
    <div className="mx-0 mb-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        <div>
          {items.map((child, index) =>
            React.cloneElement(child, {
              key: index,
              isLast: index === items.length - 1
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsGroup;