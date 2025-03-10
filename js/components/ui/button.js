import { cva } from 'class-variance-authority';

import { cn } from '../../utils.js';

/**
 * Button component with variants
 * @param {Object} options - Button options
 * @param {string} options.className - Additional class names
 * @param {string} options.variant - Button variant (default, primary, destructive, outline, ghost)
 * @param {string} options.size - Button size (default, sm, lg)
 * @returns {HTMLButtonElement} - Button element
 */
export function createButton({ className, variant = 'default', size = 'default', ...props }) {
  const buttonVariants = cva(
    'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
    {
      variants: {
        variant: {
          default: 'bg-primary text-primary-foreground hover:bg-primary/90',
          destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
          outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
          secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
          ghost: 'hover:bg-accent hover:text-accent-foreground',
          link: 'text-primary underline-offset-4 hover:underline',
        },
        size: {
          default: 'h-10 px-4 py-2',
          sm: 'h-8 rounded-md px-3 text-xs',
          lg: 'h-11 rounded-md px-8',
          icon: 'h-10 w-10',
        },
      },
      defaultVariants: {
        variant: 'default',
        size: 'default',
      },
    }
  );

  const button = document.createElement('button');
  button.className = cn(buttonVariants({ variant, size }), className);

  // Apply additional properties
  Object.entries(props).forEach(([key, value]) => {
    if (key === 'children') {
      if (typeof value === 'string') {
        button.textContent = value;
      } else if (value instanceof HTMLElement) {
        button.appendChild(value);
      }
    } else if (key === 'disabled') {
      button.disabled = value;
    } else if (key === 'type') {
      button.type = value;
    } else if (key === 'onClick') {
      button.addEventListener('click', value);
    } else if (key.startsWith('data-')) {
      button.setAttribute(key, value);
    } else {
      button[key] = value;
    }
  });

  return button;
}
