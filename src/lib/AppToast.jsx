import { X } from 'lucide-react';
import { toast } from 'react-hot-toast';

export function AppToast({ t, type = 'success', heading, message, showClose = true }) {
  const variants = {
    success: 'bg-green-50 text-green-900 border-green-200 shadow-green-100/50',
    error: 'bg-red-50 text-red-900 border-red-200 shadow-red-100/50',
    info: 'bg-blue-50 text-blue-900 border-blue-200 shadow-blue-100/50',
    loading: 'bg-gray-50 text-gray-900 border-gray-200 shadow-gray-100/50',
  };

  const icons = {
    success: <span className="text-green-600 font-bold text-base">✓</span>,
    error: <span className="text-red-600 font-bold text-base">⚠</span>,
    info: <span className="text-blue-600 font-bold text-base bg-blue-100 rounded-full w-5 h-5 flex items-center justify-center text-xs">i</span>,
    loading: <span className="animate-spin text-gray-600 text-base">◐</span>,
  };

  return (
    <div
      className={`
        flex items-center justify-between gap-3 px-4 py-3 rounded-xl 
        shadow-lg border min-w-[280px] max-w-[420px] text-sm font-normal
        transform transition-all duration-300 ease-out font-sans
        ${variants[type]}
        ${
          t.visible 
            ? 'opacity-100 translate-y-0 scale-100' 
            : 'opacity-0 translate-y-1 scale-95'
        }
      `}
    >
      <div className="flex items-start gap-3">
        <div className="mt-1 flex-shrink-0">{icons[type]}</div>
        <div className="flex-1 min-w-0">
          {heading && (
            <div className="font-semibold text-sm leading-tight mb-1.5 tracking-tight">
              {typeof heading === 'string' ? (
                <span style={{ whiteSpace: 'pre-line' }}>{heading}</span>
              ) : (
                heading
              )}
            </div>
          )}
          {message && (
            <div className={`leading-relaxed tracking-wide ${heading ? 'text-xs opacity-95' : 'text-sm font-medium'}`}>
              {typeof message === 'string' ? (
                <span style={{ whiteSpace: 'pre-line' }}>{message}</span>
              ) : (
                message
              )}
            </div>
          )}
        </div>
      </div>

      {showClose && (
        <button
          onClick={() => toast.dismiss(t.id)}
          className="
            p-1 rounded-lg text-gray-400 hover:text-gray-700 
            hover:bg-white/70 transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-gray-300/50
            flex-shrink-0 mt-0.5 group
          "
          aria-label="Close"
        >
          <X size={16} strokeWidth={2.5} className="group-hover:rotate-90 transition-transform duration-200" />
        </button>
      )}
    </div>
  );
}
