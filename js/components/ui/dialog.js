/**
 * Creates a styled dialog for health modification
 * @param {Object} options - Dialog options
 * @param {string} options.title - Dialog title
 * @param {string} options.type - Dialog type ('damage' or 'heal')
 * @param {Function} options.onConfirm - Callback function when confirmed
 * @param {Function} options.onCancel - Callback function when canceled
 * @returns {HTMLElement} - The dialog element
 */
export function createHealthDialog(options) {
  const { title, type, onConfirm, onCancel } = options;

  // Create the dialog backdrop
  const backdrop = document.createElement('div');
  backdrop.className = 'dialog-backdrop';
  
  // Create the dialog container
  const dialog = document.createElement('div');
  dialog.className = 'dialog';
  
  // Create the dialog header
  const header = document.createElement('div');
  header.className = 'dialog-header';
  
  const headerTitle = document.createElement('h3');
  headerTitle.textContent = title || (type === 'damage' ? 'Apply Damage' : 'Apply Healing');
  headerTitle.className = 'dialog-title';
  
  header.appendChild(headerTitle);
  
  // Create the dialog content
  const content = document.createElement('div');
  content.className = 'dialog-content';
  
  const inputLabel = document.createElement('label');
  inputLabel.textContent = type === 'damage' ? 'Damage amount:' : 'Healing amount:';
  inputLabel.htmlFor = 'health-amount';
  inputLabel.className = 'dialog-label';
  
  const input = document.createElement('input');
  input.type = 'number';
  input.id = 'health-amount';
  input.className = 'dialog-input';
  input.min = '1';
  input.value = '1';
  
  content.appendChild(inputLabel);
  content.appendChild(input);
  
  // Create the dialog footer with buttons
  const footer = document.createElement('div');
  footer.className = 'dialog-footer';
  
  const cancelButton = document.createElement('button');
  cancelButton.textContent = 'Cancel';
  cancelButton.className = 'dialog-button dialog-button-cancel';
  
  const confirmButton = document.createElement('button');
  confirmButton.textContent = type === 'damage' ? 'Apply Damage' : 'Apply Healing';
  confirmButton.className = `dialog-button dialog-button-${type === 'damage' ? 'damage' : 'heal'}`;
  
  footer.appendChild(cancelButton);
  footer.appendChild(confirmButton);
  
  // Assemble the dialog
  dialog.appendChild(header);
  dialog.appendChild(content);
  dialog.appendChild(footer);
  backdrop.appendChild(dialog);
  
  // Add event listeners
  cancelButton.addEventListener('click', () => {
    document.body.removeChild(backdrop);
    if (onCancel) onCancel();
  });
  
  confirmButton.addEventListener('click', () => {
    const amount = parseInt(input.value);
    if (!isNaN(amount) && amount > 0) {
      document.body.removeChild(backdrop);
      if (onConfirm) onConfirm(amount);
    } else {
      input.classList.add('error');
      setTimeout(() => input.classList.remove('error'), 500);
    }
  });
  
  // Close on backdrop click
  backdrop.addEventListener('click', (event) => {
    if (event.target === backdrop) {
      document.body.removeChild(backdrop);
      if (onCancel) onCancel();
    }
  });
  
  // Handle Enter key
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      confirmButton.click();
    }
  });
  
  // Focus the input when the dialog opens
  setTimeout(() => input.focus(), 0);
  
  // Add the dialog to the body
  document.body.appendChild(backdrop);
  
  return backdrop;
} 