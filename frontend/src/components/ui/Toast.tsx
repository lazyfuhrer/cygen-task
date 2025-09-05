import { createContext, useCallback, useContext, useMemo, useState } from 'react';

export type Toast = { id: number; type: 'success' | 'error' | 'info'; message: string };

type ToastContextValue = {
  toasts: Toast[];
  show: (t: Omit<Toast, 'id'>) => void;
  remove: (id: number) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback((t: Omit<Toast, 'id'>) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { ...t, id }]);
    setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 3000);
  }, []);

  const remove = useCallback((id: number) => setToasts((prev) => prev.filter((x) => x.id !== id)), []);

  const value = useMemo(() => ({ toasts, show, remove }), [toasts, show, remove]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-50 flex flex-col gap-2">
        {toasts.map((t) => (
          <div key={t.id} className={`rounded-md px-4 py-2 shadow text-white ${t.type === 'error' ? 'bg-red-600' : t.type === 'success' ? 'bg-green-600' : 'bg-slate-700'}`}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
