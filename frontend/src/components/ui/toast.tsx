import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface ToastMessage {
  id: number;
  message: string;
  type: 'default' | 'destructive' | 'success';
}

interface ToastContextType {
  addToast: (message: string, type?: ToastMessage['type']) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    // This console.error is a fallback for development if the provider is missing.
    console.error('useToast must be used within a ToastProvider. A fallback function will be used.');
    return { 
      toast: ({ title, description, variant }: { title?: string, description: string, variant?: string }) => {
        console.log(`Toast: ${title || ''}`, description, `(${variant || 'default'})`);
      } 
    };
  }
  // Adapt the context's addToast to the object structure expected by the components
  return {
    toast: ({ description, variant = 'default' }: { description: string; variant?: 'default' | 'destructive' | 'success' }) => {
      context.addToast(description, variant);
    }
  };
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((message: string, type: ToastMessage['type'] = 'default') => {
    const id = Date.now();
    setToasts(currentToasts => [...currentToasts, { id, message, type }]);
    setTimeout(() => {
      setToasts(currentToasts => currentToasts.filter(toast => toast.id !== id));
    }, 5000); // Auto-dismiss after 5 seconds
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <Toaster toasts={toasts} />
    </ToastContext.Provider>
  );
};

const Toaster = ({ toasts }: { toasts: ToastMessage[] }) => {
  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <Toast key={toast.id} message={toast.message} type={toast.type} />
      ))}
    </div>
  );
};

const Toast = ({ message, type }: Omit<ToastMessage, 'id'>) => {
  const baseClasses = "p-4 rounded-md shadow-lg text-white text-sm animate-fade-in-up";
  const typeClasses = {
    default: "bg-gray-800",
    destructive: "bg-red-600",
    success: "bg-green-600",
  };

  return (
    <div className={`${baseClasses} ${typeClasses[type]}`}>
      {message}
    </div>
  );
}; 