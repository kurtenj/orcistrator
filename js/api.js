import { DND_API_BASE_URL } from './constants.js';
import { elements } from './dom.js';
import { addMonsterData } from './state.js';

// Fetch monsters from the D&D 5e API
export async function fetchMonsters() {
    try {
        const response = await fetch(`${DND_API_BASE_URL}/monsters`);
        const data = await response.json();
        
        if (data && data.results) {
            populateMonsterList(data.results);
            return data.results;
        }
    } catch (error) {
        console.error('Error fetching monsters:', error);
        elements.turnInfoElement.textContent = 'Error loading monsters. Please refresh the page.';
    }
}

// Populate the monster datalist with options
function populateMonsterList(monsters) {
    elements.monsterList.innerHTML = '';
    
    monsters.forEach(monster => {
        const option = document.createElement('option');
        option.value = monster.name;
        option.dataset.index = monster.index;
        elements.monsterList.appendChild(option);
    });
}

// Fetch detailed monster data
export async function fetchMonsterDetails(monsterIndex) {
    try {
        console.log('Fetching monster details for:', monsterIndex);
        const response = await fetch(`${DND_API_BASE_URL}/monsters/${monsterIndex}`);
        const data = await response.json();
        console.log('Monster API response:', data);
        console.log('Monster actions from API:', data.actions);
        addMonsterData(monsterIndex, data);
        return data;
    } catch (error) {
        console.error('Error fetching monster details:', error);
        throw error;
    }
} 