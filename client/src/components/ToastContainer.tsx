import { useLocation, useNavigationType } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { useEffect, useState } from 'react';
import { useUIStore } from '../store/uiStore';
import { X } from 'lucide-react';

export function ToastContainer() {
  const { toasts, removeToast } = useUIStore();
  const location = useLocation();
  const navigationType = useNavigationType();
  const [displayToasts, setDisplayToasts] = useState(toasts);

  useEffect(() => {
    if (navigationType === 'POP') {
      setDisplayToasts([]);
    }
  }, [location.key, navigationType]);

  useEffect(() => {
    setDisplayToasts(toasts);
  }, [toasts]);

  if (displayToasts.length === 0) return null;

  return createPortal(
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {displayToasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg min-w-[300px]
            ${toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}
          `}
        >
          <span className="flex-1">{toast.message}</span>
          <button onClick={() => removeToast(toast.id)} className="hover:opacity-80">
            <X size={16} />
          </button>
        </div>
      ))}
    </div>,
    document.body
  );
}