import React from 'react';
import { useDebug } from '@/01-shared/context/DebugContext';
import SettingsItem from '@/01-shared/components/settings/SettingsItem';
import { Switch } from '@/components/ui/switch';
import { Bug } from 'lucide-react';

const DebugSettings = () => {
  const { isErudaEnabled, setIsErudaEnabled } = useDebug();

  const handleToggle = () => {
    setIsErudaEnabled(!isErudaEnabled);
  };

  // We need to pass the component itself to the 'value' prop of SettingsItem
  const ToggleComponent = (
    <Switch
      checked={isErudaEnabled}
      onCheckedChange={handleToggle}
      aria-label="Toggle debug console"
    />
  );

  return (
    <SettingsItem
      icon={Bug}
      iconColor="bg-red-500"
      label="Console de Depuração"
      value={ToggleComponent} // Pass the component here
      isLast={true} // Assuming this is the last item for now
    />
  );
};

export default DebugSettings;
