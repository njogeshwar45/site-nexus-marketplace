import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function GlassCard({ children, className, hover = true, ...props }: GlassCardProps) {
  return (
    <div className={cn(
      hover ? 'glass-card' : 'glass',
      'rounded-xl p-6',
      className
    )} {...props}>
      {children}
    </div>
  );
}
