
import React from 'react';
import { LucideIcon, ArrowRight } from 'lucide-react';

interface LoginRoleButtonProps {
  onClick: () => void;
  icon: LucideIcon;
  title: string;
  description: string;
}

export const LoginRoleButton: React.FC<LoginRoleButtonProps> = ({ onClick, icon: Icon, title, description }) => {
  return (
    <button
      onClick={onClick}
      className="w-full group bg-muted/50 hover:bg-primary/10 border-2 border-transparent hover:border-primary/20 p-6 rounded-[2rem] flex items-center gap-4 transition-all active:scale-[0.98]"
    >
      <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
        <Icon size={28} />
      </div>
      <div className="text-left">
        <h3 className="font-bold text-lg">{title}</h3>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <ArrowRight className="ml-auto text-muted-foreground group-hover:text-primary transition-colors" size={20} />
    </button>
  );
};
