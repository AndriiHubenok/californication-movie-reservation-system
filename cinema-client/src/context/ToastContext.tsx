import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from 'react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastItem {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

interface ToastBannerProps {
    toast: ToastItem;
    onDismiss: (id: string) => void;
}

const ToastBanner = ({ toast, onDismiss }: ToastBannerProps) => {
    useEffect(() => {
        const timerId = window.setTimeout(() => {
            onDismiss(toast.id);
        }, 4000);

        return () => window.clearTimeout(timerId);
    }, [toast.id, onDismiss]);

    return (
        <div className={`toast-item toast-${toast.type}`} role="status">
            <span>{toast.message}</span>
            <button
                type="button"
                className="toast-close"
                aria-label="Close"
                onClick={() => onDismiss(toast.id)}
            >
                ×
            </button>
        </div>
    );
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    const dismissToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((item) => item.id !== id));
    }, []);

    const showToast = useCallback((message: string, type: ToastType = 'info') => {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        setToasts((prev) => [...prev, { id, message, type }]);
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="toast-container" aria-live="polite">
                {toasts.map((toast) => (
                    <ToastBanner
                        key={toast.id}
                        toast={toast}
                        onDismiss={dismissToast}
                    />
                ))}
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = (): ToastContextType => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};