import { createContext, useContext, useState, useCallback } from 'react';
import { X, Check, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = 'info') => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message, type }]);

        // Auto remove after 3 seconds
        setTimeout(() => {
            removeToast(id);
        }, 3000);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed top-4 right-4 z-[200] flex flex-col gap-2">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`
                            min-w-[300px] p-4 rounded-xl shadow-lg border flex items-start gap-3 animate-slide-in relative
                            ${toast.type === 'success' ? 'bg-white border-green-100/50 shadow-green-500/10' : ''}
                            ${toast.type === 'error' ? 'bg-white border-red-100/50 shadow-red-500/10' : ''}
                            ${toast.type === 'warning' ? 'bg-white border-amber-100/50 shadow-amber-500/10' : ''}
                            ${toast.type === 'info' ? 'bg-white border-blue-100/50 shadow-blue-500/10' : ''}
                        `}
                    >
                        <div className={`
                            p-2 rounded-full shrink-0
                            ${toast.type === 'success' ? 'bg-green-100 text-green-600' : ''}
                            ${toast.type === 'error' ? 'bg-red-100 text-red-600' : ''}
                            ${toast.type === 'warning' ? 'bg-amber-100 text-amber-600' : ''}
                            ${toast.type === 'info' ? 'bg-blue-100 text-blue-600' : ''}
                        `}>
                            {toast.type === 'success' && <Check size={18} />}
                            {toast.type === 'error' && <AlertCircle size={18} />}
                            {toast.type === 'warning' && <AlertTriangle size={18} />}
                            {toast.type === 'info' && <Info size={18} />}
                        </div>

                        <div className="flex-1 pt-1">
                            <h4 className={`text-sm font-bold leading-none mb-1
                                ${toast.type === 'success' ? 'text-green-900' : ''}
                                ${toast.type === 'error' ? 'text-red-900' : ''}
                                ${toast.type === 'warning' ? 'text-amber-900' : ''}
                                ${toast.type === 'info' ? 'text-blue-900' : ''}
                            `}>
                                {toast.type === 'success' ? 'Başarılı' : ''}
                                {toast.type === 'error' ? 'Hata' : ''}
                                {toast.type === 'warning' ? 'Dikkat' : ''}
                                {toast.type === 'info' ? 'Bilgi' : ''}
                            </h4>
                            <p className="text-sm text-slate-600 leading-snug">{toast.message}</p>
                        </div>

                        <button
                            onClick={() => removeToast(toast.id)}
                            className="text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};
