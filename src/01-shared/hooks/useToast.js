import { useContext } from 'react';
import { ToastContext } from '@/01-shared/context/ToastProvider';

// This hook now provides a function that matches the shadcn/ui `useToast` hook signature.
// It allows calling `toast({ title, description, ... })`
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return {
    toast: context.showToast,
    dismiss: context.hideToast // Add dismiss for completeness
  };
};