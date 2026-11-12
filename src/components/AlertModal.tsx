import { CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

interface Props {
  isOpen: boolean;
  title: string;
  message: string;
  buttonText?: string;
  onClose: () => void;
  variant?: 'success' | 'warning' | 'error' | 'info';
}

export default function AlertModal({ isOpen, title, message, buttonText = 'حسنًا', onClose, variant = 'info' }: Props) {
  if (!isOpen) return null;

  const colors = {
    success: 'from-mint-200 to-mint-300 text-mint-300',
    warning: 'from-peach-200 to-peach-300 text-peach-300',
    error: 'from-rose-400 to-rose-500 text-rose-500',
    info: 'from-lavender-300 to-rose-400 text-lavender-300'
  };

  const icons = {
    success: <CheckCircle2 size={36} className="text-white" />,
    warning: <AlertCircle size={36} className="text-white" />,
    error: <AlertCircle size={36} className="text-white" />,
    info: <Sparkles size={36} className="text-white" />
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-white dark:bg-[#252532] rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden"
        style={{ animation: 'popIn 0.3s ease-out' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 text-center">
          <div className={`w-20 h-20 mx-auto rounded-full bg-gradient-to-br ${colors[variant].split(' ')[0]} ${colors[variant].split(' ')[1]} flex items-center justify-center mb-4 shadow-lg`}>
            {icons[variant]}
          </div>
          <h3 className="text-xl font-extrabold text-ink-900 dark:text-rose-100 mb-2">{title}</h3>
          <p className="text-sm text-ink-500 dark:text-rose-300/80 leading-relaxed mb-6">{message}</p>
          
          <button
            onClick={onClose}
            className={`w-full py-3.5 rounded-xl2 bg-gradient-to-r ${colors[variant].split(' ')[0]} ${colors[variant].split(' ')[1]} text-white font-bold shadow-soft active:scale-95 transition-transform`}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
}
