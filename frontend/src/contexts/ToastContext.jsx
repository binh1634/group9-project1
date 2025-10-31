import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', timeout = 4000) => {
    const id = Date.now() + Math.random().toString(36).slice(2,9);
    const t = { id, message, type };
    setToasts((s) => [t, ...s]);
    if (timeout) setTimeout(() => setToasts((s) => s.filter(x => x.id !== id)), timeout);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((s) => s.filter(x => x.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="toast-wrap">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type}`} onClick={() => removeToast(t.id)}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
export default ToastContext;
