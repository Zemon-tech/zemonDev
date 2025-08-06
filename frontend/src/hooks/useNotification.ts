import { useRef } from 'react';
import Toaster, { ToasterRef } from '@/components/ui/toast';

type Variant = 'default' | 'success' | 'error' | 'warning';
type Position = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';

interface NotificationOptions {
  title?: string;
  message: string;
  variant?: Variant;
  duration?: number;
  position?: Position;
  onDismiss?: () => void;
}

export const useNotification = () => {
  const toasterRef = useRef<ToasterRef>(null);

  const showNotification = (options: NotificationOptions) => {
    toasterRef.current?.show(options);
  };

  const showSuccess = (message: string, title?: string) => {
    showNotification({
      title: title || 'Success',
      message,
      variant: 'success',
      duration: 3000,
    });
  };

  const showError = (message: string, title?: string) => {
    showNotification({
      title: title || 'Error',
      message,
      variant: 'error',
      duration: 5000,
    });
  };

  const showWarning = (message: string, title?: string) => {
    showNotification({
      title: title || 'Warning',
      message,
      variant: 'warning',
      duration: 4000,
    });
  };

  const showInfo = (message: string, title?: string) => {
    showNotification({
      title: title || 'Info',
      message,
      variant: 'default',
      duration: 3000,
    });
  };

  return {
    toasterRef,
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
}; 