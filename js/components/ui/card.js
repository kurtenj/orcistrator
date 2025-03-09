import { cn } from '../../utils.js';

/**
 * Creates a card container element
 * @param {Object} options - Card options
 * @param {string} options.className - Additional class names
 * @param {HTMLElement[]} options.children - Child elements
 * @returns {HTMLDivElement} - Card element
 */
export function createCard({ className, children = [], ...props }) {
  const card = document.createElement('div');
  card.className = cn('rounded-lg border bg-card text-card-foreground shadow-sm', className);
  
  children.forEach(child => {
    card.appendChild(child);
  });
  
  // Apply additional properties
  Object.entries(props).forEach(([key, value]) => {
    if (key.startsWith('data-')) {
      card.setAttribute(key, value);
    } else {
      card[key] = value;
    }
  });
  
  return card;
}

/**
 * Creates a card header element
 * @param {Object} options - Card header options
 * @param {string} options.className - Additional class names
 * @param {HTMLElement[]} options.children - Child elements
 * @returns {HTMLDivElement} - Card header element
 */
export function createCardHeader({ className, children = [], ...props }) {
  const header = document.createElement('div');
  header.className = cn('flex flex-col space-y-1.5 p-6', className);
  
  children.forEach(child => {
    header.appendChild(child);
  });
  
  // Apply additional properties
  Object.entries(props).forEach(([key, value]) => {
    if (key.startsWith('data-')) {
      header.setAttribute(key, value);
    } else {
      header[key] = value;
    }
  });
  
  return header;
}

/**
 * Creates a card title element
 * @param {Object} options - Card title options
 * @param {string} options.className - Additional class names
 * @param {string} options.text - Title text
 * @returns {HTMLHeadingElement} - Card title element
 */
export function createCardTitle({ className, text, ...props }) {
  const title = document.createElement('h3');
  title.className = cn('text-lg font-semibold leading-none tracking-tight', className);
  title.textContent = text;
  
  // Apply additional properties
  Object.entries(props).forEach(([key, value]) => {
    if (key.startsWith('data-')) {
      title.setAttribute(key, value);
    } else {
      title[key] = value;
    }
  });
  
  return title;
}

/**
 * Creates a card description element
 * @param {Object} options - Card description options
 * @param {string} options.className - Additional class names
 * @param {string} options.text - Description text
 * @returns {HTMLParagraphElement} - Card description element
 */
export function createCardDescription({ className, text, ...props }) {
  const description = document.createElement('p');
  description.className = cn('text-sm text-muted-foreground', className);
  description.textContent = text;
  
  // Apply additional properties
  Object.entries(props).forEach(([key, value]) => {
    if (key.startsWith('data-')) {
      description.setAttribute(key, value);
    } else {
      description[key] = value;
    }
  });
  
  return description;
}

/**
 * Creates a card content element
 * @param {Object} options - Card content options
 * @param {string} options.className - Additional class names
 * @param {HTMLElement[]} options.children - Child elements
 * @returns {HTMLDivElement} - Card content element
 */
export function createCardContent({ className, children = [], ...props }) {
  const content = document.createElement('div');
  content.className = cn('p-6 pt-0', className);
  
  children.forEach(child => {
    content.appendChild(child);
  });
  
  // Apply additional properties
  Object.entries(props).forEach(([key, value]) => {
    if (key.startsWith('data-')) {
      content.setAttribute(key, value);
    } else {
      content[key] = value;
    }
  });
  
  return content;
}

/**
 * Creates a card footer element
 * @param {Object} options - Card footer options
 * @param {string} options.className - Additional class names
 * @param {HTMLElement[]} options.children - Child elements
 * @returns {HTMLDivElement} - Card footer element
 */
export function createCardFooter({ className, children = [], ...props }) {
  const footer = document.createElement('div');
  footer.className = cn('flex items-center p-6 pt-0', className);
  
  children.forEach(child => {
    footer.appendChild(child);
  });
  
  // Apply additional properties
  Object.entries(props).forEach(([key, value]) => {
    if (key.startsWith('data-')) {
      footer.setAttribute(key, value);
    } else {
      footer[key] = value;
    }
  });
  
  return footer;
} 