import React, { useEffect } from 'react';
import { XCircleIcon, CheckCircleIcon, InfoIcon } from './icons';
import type { ToastMessage } from '../types';

interface ToastProps {
  toast: ToastMessage;
  onRemove: (id: number) => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onRemove }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onRemove(toast.id);
        }, 5000); // Auto-dismiss after 5 seconds

        return () => {
            clearTimeout(timer);
        };
    }, [toast.id, onRemove]);

    const icons = {
        success: <CheckCircleIcon className="w-6 h-6 text-green-400" />,
        error: <XCircleIcon className="w-6 h-6 text-red-400" />,
        info: <InfoIcon className="w-6 h-6 text-blue-400" />,
    };

    const baseClasses = "flex items-start w-full max-w-sm p-4 mb-4 rounded-lg shadow-lg text-white border";
    const typeClasses = {
        success: 'bg-green-900/80 border-green-700 backdrop-blur-sm',
        error: 'bg-red-900/80 border-red-700 backdrop-blur-sm',
        info: 'bg-blue-900/80 border-blue-700 backdrop-blur-sm',
    };

    return (
        <div className={`${baseClasses} ${typeClasses[toast.type]}`} role="alert">
            <div className="flex-shrink-0">{icons[toast.type]}</div>
            <div className="ml-3 flex-1">
                <p className="text-sm font-medium">{toast.message}</p>
            </div>
            <div className="ml-4 flex-shrink-0 flex">
                <button 
                    onClick={() => onRemove(toast.id)} 
                    className="inline-flex rounded-md text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500"
                    aria-label="Close"
                >
                    <span className="sr-only">Close</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

interface ToastContainerProps {
    toasts: ToastMessage[];
    onRemove: (id: number) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
    return (
        <div className="fixed top-5 right-5 z-[100] w-full max-w-sm">
            {toasts.map(toast => (
                <Toast key={toast.id} toast={toast} onRemove={onRemove} />
            ))}
        </div>
    );
};
