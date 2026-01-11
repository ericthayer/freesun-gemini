
import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary';
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'primary'
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm" 
        onClick={onClose}
      />
      <div className="relative bg-card border shadow-2xl rounded-[2.5rem] w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div className={`p-3 rounded-2xl ${variant === 'danger' ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
              <AlertTriangle size={24} />
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-full text-muted-foreground transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          
          <h3 className="text-2xl font-bold mb-3">{title}</h3>
          <p className="text-muted-foreground leading-relaxed mb-8">
            {message}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3.5 text-sm font-bold bg-muted hover:bg-muted/80 rounded-2xl transition-all active:scale-95"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`flex-1 px-6 py-3.5 text-sm font-bold text-white rounded-2xl shadow-lg transition-all active:scale-95 ${
                variant === 'danger' 
                  ? 'bg-destructive shadow-destructive/20 hover:bg-destructive/90' 
                  : 'bg-primary shadow-primary/20 hover:bg-primary/90'
              }`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
