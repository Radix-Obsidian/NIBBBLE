import { forwardRef, HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined';
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    const variants = {
      default: 'bg-white rounded-2xl shadow-lg',
      elevated: 'bg-white rounded-2xl shadow-xl hover:shadow-2xl',
      outlined: 'bg-white rounded-2xl border border-gray-200'
    };
    
    return (
      <div
        ref={ref}
        className={cn(
          variants[variant],
          'transition-all duration-300',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export { Card };
