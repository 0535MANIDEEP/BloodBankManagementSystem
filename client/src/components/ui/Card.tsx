import React from 'react';
import type { ReactNode } from 'react';

interface CardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  subtitle?: string;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  title,
  value,
  icon,
  subtitle,
  className = ''
}) => {
  return (
    <div className={`glass-card p-6 flex flex-col justify-between hover:shadow-glass-hover hover:-translate-y-0.5 transition-all duration-300 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {title}
          </span>
          <span className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
            {value}
          </span>
        </div>
        {icon && (
          <div className="p-3 bg-red-50 dark:bg-red-950/20 text-blood rounded-2xl flex items-center justify-center border border-red-100/50 dark:border-red-950/30">
            {icon}
          </div>
        )}
      </div>
      {subtitle && (
        <span className="text-xs text-slate-400 dark:text-slate-500 mt-4 flex items-center gap-1 font-medium">
          {subtitle}
        </span>
      )}
    </div>
  );
};
export default Card;
