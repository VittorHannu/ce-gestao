import React from 'react';
import { useDebug } from '@/01-shared/context/DebugContext';
import SettingsItem from '@/01-shared/components/settings/SettingsItem';
import { Switch } from '@/components/ui/switch';
import { Bug, MessageSquareWarning } from 'lucide-react';

const DebugSettings = () => {
  const { isErudaEnabled, setIsErudaEnabled, isDebugLogsEnabled, _setIsDebugLogsEnabled } = useDebug();

  const handleErudaToggle = () => {
    setIsErudaEnabled(!isErudaEnabled);
  };

  const handleLogsToggle = (isChecked) => {
    // Use the value passed by the Switch component.
    // This is more reliable than toggling the previous state.
    localStorage.setItem('debugLogsEnabled', isChecked);
    window.location.reload();
  };

  const ErudaToggleComponent = (
    <Switch
      checked={isErudaEnabled}
      onCheckedChange={handleErudaToggle}
      aria-label="Toggle Eruda debug console"
    />
  );

  const LogsToggleComponent = (
    <Switch
      checked={isDebugLogsEnabled}
      onCheckedChange={handleLogsToggle}
      aria-label="Toggle debug logs"
    />
  );

  return (
    <>
      <SettingsItem
        icon={Bug}
        iconColor="bg-red-500"
        label="Console (Eruda)"
        value={ErudaToggleComponent}
        isLast={false}
      />
      <SettingsItem
        icon={MessageSquareWarning}
        iconColor="bg-blue-500"
        label="Logs de Depuração"
        value={LogsToggleComponent}
        isLast={true}
      />
    </>
  );
};

export default DebugSettings;
