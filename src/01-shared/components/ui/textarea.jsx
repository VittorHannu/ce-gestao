import * as React from 'react';
import { cva } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const textareaVariants = cva(
  'flex w-full', // Common base styles
  {
    variants: {
      variant: {
        default:
          'min-h-16 rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:ring-[3px] focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        unstyled:
          'p-0 text-base bg-transparent border-0 resize-none overflow-hidden outline-none focus:outline-none focus-visible:outline-none focus:shadow-none appearance-none'
      }
    },
    defaultVariants: {
      variant: 'default'
    }
  }
);

const Textarea = React.forwardRef(({ className, variant, ...props }, ref) => {
  return (
    <textarea
      className={cn(textareaVariants({ variant, className }))}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = 'Textarea';

export { Textarea };
