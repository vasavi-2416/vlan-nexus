import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'error' | 'warning' | 'info' | 'purple' | 'cyan' | 'slate';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'info',
  size = 'sm',
}) => {
  const variantStyles = {
    success: 'bg-emerald-950/80 text-emerald-400 border-emerald-800/60',
    error: 'bg-rose-950/80 text-rose-400 border-rose-800/60',
    warning: 'bg-amber-950/80 text-amber-400 border-amber-800/60',
    info: 'bg-blue-950/80 text-blue-400 border-blue-800/60',
    purple: 'bg-purple-950/80 text-purple-400 border-purple-800/60',
    cyan: 'bg-cyan-950/80 text-cyan-400 border-cyan-800/60',
    slate: 'bg-slate-800 text-slate-300 border-slate-700',
  }[variant];

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-[10px] tracking-wide font-medium',
    md: 'px-2.5 py-1 text-xs font-semibold',
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border ${variantStyles} ${sizeStyles}`}
    >
      {children}
    </span>
  );
};
