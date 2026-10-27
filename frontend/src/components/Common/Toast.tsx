import React, { useEffect } from 'react';
import { Check, Info, X } from 'lucide-react';
import styles from './Toast.module.scss';

export interface ToastProps {
  id?: string;
  message: string;
  type?: 'success' | 'info';
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'success',
  onClose,
  duration = 4000,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      className={`${styles.toast} ${styles[`toast--${type}`]}`}
      role="status"
      aria-live="polite"
    >
      <div className={styles.iconWrapper}>
        {type === 'success' ? <Check size={18} /> : <Info size={18} />}
      </div>
      <span className={styles.message}>{message}</span>
      <button
        type="button"
        className={styles.closeButton}
        onClick={onClose}
        aria-label="Fechar notificação"
      >
        <X size={16} />
      </button>
    </div>
  );
};
