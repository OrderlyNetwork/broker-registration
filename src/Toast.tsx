import * as ToastPrimitive from '@radix-ui/react-toast';
import { Callout, Flex, IconButton } from '@radix-ui/themes';
import { createContext, useContext, useState } from 'react';

type ToastContextType = {
  showToast: (message: string, type?: 'success' | 'error') => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: 'success' | 'error' }>>([]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    const id = Math.random().toString(36).substring(7);
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastPrimitive.Provider swipeDirection="right">
        {toasts.map((toast) => (
          <ToastPrimitive.Root
            key={toast.id}
            open={true}
            onOpenChange={(open) => {
              if (!open) {
                removeToast(toast.id);
              }
            }}
            duration={5000}
          >
            <Callout.Root
              color={toast.type === 'error' ? 'red' : 'green'}
              variant="soft"
              style={{
                minWidth: '300px',
                maxWidth: '400px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                position: 'relative',
                backgroundColor: '#ffffff',
                border: `1px solid ${toast.type === 'error' ? '#ff6b6b' : '#51cf66'}`,
                borderRadius: '8px'
              }}
            >
              <Flex align="center" justify="between" gap="3">
                <Callout.Text style={{ flex: 1, margin: 0 }}>
                  {toast.message}
                </Callout.Text>
                <ToastPrimitive.Close asChild>
                  <IconButton size="1" variant="ghost" style={{ cursor: 'pointer' }}>
                    ×
                  </IconButton>
                </ToastPrimitive.Close>
              </Flex>
            </Callout.Root>
          </ToastPrimitive.Root>
        ))}
        <ToastPrimitive.Viewport
          style={{
            position: 'fixed',
            bottom: 0,
            right: 0,
            display: 'flex',
            flexDirection: 'column',
            padding: '1rem',
            gap: '0.5rem',
            width: '390px',
            maxWidth: '100vw',
            margin: 0,
            listStyle: 'none',
            outline: 'none'
          }}
        />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
};

