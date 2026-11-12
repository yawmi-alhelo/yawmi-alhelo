import { AlertCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning' | 'info';
}

export default function ConfirmModal({
  isOpen, title, message, confirmText = 'تأكيد', cancelText = 'إلغاء',
  onConfirm, onCancel, variant = 'warning'
}: Props) {
  if (!isOpen) return null;

  const colors = {
    danger: 'from-rose-500 to-red-500',
    warning: 'from-peach-300 to-rose-400',
    info: 'from-lavender-300 to-rose-400'
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={onCancel}>
      <div 
        className="bg-white dark:bg-[#252532] rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden"
        style={{ animation: 'popIn 0.3s ease-out' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 text-center">
          <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-br ${colors[variant]} flex items-center justify-center mb-4 shadow-lg`}>
            <AlertCircle size={32} className="text-white" />
          </div>
          <h3 className="text-xl font-extrabold text-ink-900 dark:text-rose-100 mb-2">{title}</h3>
          <p className="text-sm text-ink-500 dark:text-rose-300/80 leading-relaxed mb-6">{message}</p>
          
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 py-3 rounded-xl2 bg-rose-50 dark:bg-[#1a1a24] text-ink-700 dark:text-rose-200 font-bold active:scale-95 transition-transform"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 py-3 rounded-xl2 bg-gradient-to-r ${colors[variant]} text-white font-bold shadow-soft active:scale-95 transition-transform`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
