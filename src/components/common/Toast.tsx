import React from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const iconMap = {
          success: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />,
          error: <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />,
          info: <Info className="w-4 h-4 text-cyan-400 shrink-0" />,
          warning: <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />,
        };

        const borderMap = {
          success: 'border-emerald-800/80 bg-slate-900/95',
          error: 'border-rose-800/80 bg-slate-900/95',
          info: 'border-cyan-800/80 bg-slate-900/95',
          warning: 'border-amber-800/80 bg-slate-900/95',
        };

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3.5 rounded-xl border ${borderMap[toast.type]} shadow-2xl shadow-black backdrop-blur-md flex items-start justify-between gap-3 animate-in fade-in slide-in-from-right-5`}
          >
            <div className="flex items-start gap-2.5">
              {iconMap[toast.type]}
              <div>
                <div className="text-xs font-semibold text-slate-100">{toast.title}</div>
                {toast.message && (
                  <div className="text-[11px] text-slate-400 mt-0.5 leading-tight">
                    {toast.message}
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-slate-400 hover:text-white p-0.5 rounded-md hover:bg-slate-800"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
