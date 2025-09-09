import React from 'react';
import SettingsItem from './SettingsItem'; // Importa o tipo do componente filho

const SettingsGroup = ({ children }) => {
  const items = React.Children.toArray(children);
  
  // Filtra para encontrar apenas os filhos que são SettingsItem
  const settingsItems = items.filter(child => child.type === SettingsItem);
  const lastItemIndex = items.lastIndexOf(settingsItems[settingsItems.length - 1]);

  return (
    <div className="mx-0 mb-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        <div>
          {items.map((child, index) => {
            // A prop `isLast` só deve ser passada para componentes `SettingsItem`
            if (child.type === SettingsItem) {
              return React.cloneElement(child, {
                key: index,
                // Verifica se este item é o último `SettingsItem` na lista de todos os filhos
                isLast: index === lastItemIndex
              });
            }
            // Retorna outros elementos (como divs) sem modificar
            return child;
          })}
        </div>
      </div>
    </div>
  );
};

export default SettingsGroup;