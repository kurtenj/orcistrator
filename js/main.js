import { elements } from './dom.js';
import { fetchMonsters } from './api.js';
import { handleAddPC, handleAddMonster, handleInitiativeListClick, handleAddRandomPC } from './handlers.js';
import { startCombat, nextTurn, performMonsterAction } from './combat.js';
import { updateCombatToolbar } from './ui.js';

// Initialize the application
function initialize() {
    console.log('Initializing application');
    fetchMonsters();
    setupEventListeners();
    updateCombatToolbar(); // Initialize the combat toolbar
}

// Set up event listeners
function setupEventListeners() {
    console.log('Setting up event listeners');
    console.log('DOM elements:', elements);
    
    elements.pcForm.addEventListener('submit', handleAddPC);
    
    // Random PC button and dropdown
    elements.randomPcButton.addEventListener('click', (event) => {
        event.stopPropagation(); // Prevent the click from propagating to the document
        elements.randomPcDropdown.classList.toggle('show');
    });
    
    // Double-click on Random PC button to add a single PC directly
    elements.randomPcButton.addEventListener('dblclick', (event) => {
        event.stopPropagation();
        elements.randomPcDropdown.classList.remove('show');
        handleAddRandomPC(1);
    });
    
    // Right-click on Random PC button to add a single PC directly
    elements.randomPcButton.addEventListener('contextmenu', (event) => {
        event.preventDefault(); // Prevent the default context menu
        event.stopPropagation();
        elements.randomPcDropdown.classList.remove('show');
        handleAddRandomPC(1);
    });
    
    // Handle clicks on random PC count buttons
    elements.randomPcCountButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const count = parseInt(event.target.dataset.count);
            handleAddRandomPC(count);
            elements.randomPcDropdown.classList.remove('show');
        });
    });
    
    // Close dropdown when clicking elsewhere
    document.addEventListener('click', (event) => {
        if (!elements.randomPcDropdown.contains(event.target) && event.target !== elements.randomPcButton) {
            elements.randomPcDropdown.classList.remove('show');
        }
    });
    
    elements.monsterForm.addEventListener('submit', handleAddMonster);
    elements.startCombatButton.addEventListener('click', startCombat);
    elements.nextTurnButton.addEventListener('click', nextTurn);
    
    // Event delegation for HP management and action selection
    console.log('Setting up initiative list click handler');
    elements.initiativeListElement.addEventListener('click', handleInitiativeListClick);
    
    // Add event delegation for action buttons in the active stat block
    console.log('Setting up active stat block click handler');
    elements.activeStatBlockElement.addEventListener('click', (event) => {
        console.log('Active stat block clicked:', event.target);
        
        // Check if the clicked element has a data-action attribute of "monster-action"
        if (event.target.dataset.action === 'monster-action') {
            console.log('Monster action button clicked');
            const monsterId = event.target.dataset.monsterId;
            const actionIndex = event.target.dataset.actionIndex;
            
            console.log('Monster ID:', monsterId);
            console.log('Action Index:', actionIndex);
            
            if (monsterId && actionIndex !== undefined) {
                console.log('Calling performMonsterAction from stat block');
                performMonsterAction(monsterId, parseInt(actionIndex));
            } else {
                console.error('Missing monsterId or actionIndex in stat block:', { monsterId, actionIndex });
            }
        }
    });
    
    console.log('Event listeners set up');
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', initialize); 