import { cn } from '../../utils.js';

/**
 * Creates an input element with shadcn/ui styling
 * @param {Object} options - Input options
 * @param {string} options.className - Additional class names
 * @param {string} options.type - Input type (text, number, etc.)
 * @param {string} options.placeholder - Input placeholder
 * @param {string} options.value - Input value
 * @param {boolean} options.disabled - Whether the input is disabled
 * @param {boolean} options.required - Whether the input is required
 * @param {Function} options.onChange - Change event handler
 * @returns {HTMLInputElement} - Input element
 */
export function createInput({ 
  className, 
  type = 'text', 
  placeholder = '', 
  value = '', 
  disabled = false, 
  required = false, 
  onChange = null,
  ...props 
}) {
  const input = document.createElement('input');
  input.className = cn(
    'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
    className
  );
  
  input.type = type;
  input.placeholder = placeholder;
  input.value = value;
  input.disabled = disabled;
  input.required = required;
  
  if (onChange) {
    input.addEventListener('input', onChange);
  }
  
  // Apply additional properties
  Object.entries(props).forEach(([key, value]) => {
    if (key.startsWith('data-')) {
      input.setAttribute(key, value);
    } else if (key === 'min' || key === 'max' || key === 'step') {
      input.setAttribute(key, value);
    } else if (key === 'id') {
      input.id = value;
    } else if (key === 'name') {
      input.name = value;
    } else {
      input[key] = value;
    }
  });
  
  return input;
}

/**
 * Creates a form group with label and input
 * @param {Object} options - Form group options
 * @param {string} options.className - Additional class names
 * @param {string} options.labelText - Label text
 * @param {HTMLInputElement} options.input - Input element
 * @returns {HTMLDivElement} - Form group element
 */
export function createFormGroup({ className, labelText, input, ...props }) {
  const formGroup = document.createElement('div');
  formGroup.className = cn('space-y-2', className);
  
  const label = document.createElement('label');
  label.className = 'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70';
  label.textContent = labelText;
  label.htmlFor = input.id;
  
  formGroup.appendChild(label);
  formGroup.appendChild(input);
  
  // Apply additional properties
  Object.entries(props).forEach(([key, value]) => {
    if (key.startsWith('data-')) {
      formGroup.setAttribute(key, value);
    } else {
      formGroup[key] = value;
    }
  });
  
  return formGroup;
} 