import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { AlertCircle, Heart, Sparkles, X } from 'lucide-react';

export interface ToastData {
  id: number;
  message: string;
  title?: string;
  type?: 'success' | 'error' | 'info';
}

interface ToastProps {
  toast: ToastData | null;
  onClose: () => void;
}

export function Toast({ toast, onClose }: ToastProps) {
  const reduced = useReducedMotion();

  return createPortal(
    <div className="toast-portal-root" aria-live="polite" aria-atomic="true">
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            className={`wedding-toast wedding-toast-${toast.type || 'success'}`}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: -24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: -18, scale: 0.95 }}
            transition={reduced ? { duration: 0.15 } : { type: 'spring', stiffness: 380, damping: 28 }}
            role="status"
          >
            <div className="toast-icon-wrapper" aria-hidden="true">
              {toast.type === 'error' ? (
                <AlertCircle size={18} strokeWidth={2.2} />
              ) : toast.type === 'info' ? (
                <Sparkles size={18} strokeWidth={2} />
              ) : (
                <Heart size={17} strokeWidth={2.2} fill="currentColor" />
              )}
            </div>
            <div className="toast-body">
              <div className="toast-title">
                {toast.title || (toast.type === 'error' ? 'Thông báo' : toast.type === 'info' ? 'Ghi chú' : 'Cảm ơn bạn!')}
              </div>
              <div className="toast-message">{toast.message}</div>
            </div>
            <button
              type="button"
              className="toast-close"
              onClick={onClose}
              aria-label="Đóng thông báo"
            >
              <X size={15} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>,
    document.body
  );
}
