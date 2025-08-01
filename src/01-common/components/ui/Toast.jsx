import React, { useState, useEffect } from 'react';
import { XCircle, CheckCircle, Info, X } from 'lucide-react';

const Toast = ({ message, type, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 5000); // Toast disappears after 5 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = {
    error: 'bg-red-500',
    success: 'bg-green-500',
    info: 'bg-blue-500'
  }[type] || 'bg-gray-500';

  const Icon = {
    error: XCircle,
    success: CheckCircle,
    info: Info
  }[type] || Info;

  if (!isVisible) return null;

  return (
    <div className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg text-white flex items-center space-x-3 ${bgColor} z-50`}>
      <Icon className="w-6 h-6" />
      <p className="flex-1">{message}</p>
      <button onClick={() => {
        setIsVisible(false);
        onClose();
      }} className="ml-4 p-1 rounded-full hover:bg-white hover:bg-opacity-20">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Toast;
