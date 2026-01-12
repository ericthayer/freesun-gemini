
import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Drawer: React.FC<DrawerProps> = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <div 
      className={`fixed inset-0 z-[110] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
    >
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      {/* Panel */}
      <div 
        className={`absolute top-0 right-0 h-full w-full max-w-lg bg-card border-l dark:border-primary/30 shadow-2xl transition-transform duration-300 ease-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="p-6 border-b dark:border-primary/30 flex items-center justify-between bg-muted/20">
          <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full transition-colors"
            aria-label="Close drawer"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="flex-grow overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-muted">
          {children}
        </div>
      </div>
    </div>
  );
};
