import { elements } from './dom.js';
import { getMonsterData, getParticipants, getCurrentTurnIndex, getCombatStarted, updateParticipant } from './state.js';
import { formatModifier } from './utils.js';
import { updateInitiativeList } from './ui.js';

// Apply damage to a monster
export function applyDamageToMonster(monsterId, amount) {
    console.log('Applying damage to monster:', monsterId, 'amount:', amount);
    
    const participants = getParticipants();
    console.log('All participants:', participants);
    
    const monsterIndex = participants.findIndex(p => p.id === monsterId);
    console.log('Monster index:', monsterIndex);
    
    if (monsterIndex !== -1 && participants[monsterIndex].type === 'monster') {
        const monster = participants[monsterIndex];
        console.log('Monster before damage:', monster);
        
        const newHp = Math.max(0, monster.currentHp - amount);
        const defeated = newHp === 0;
        
        console.log('New HP:', newHp, 'Defeated:', defeated);
        
        // Update the monster in the state
        updateParticipant(monsterId, {
            currentHp: newHp,
            defeated: defeated
        });
        
        // Get the updated participants array and monster
        const updatedParticipants = getParticipants();
        const updatedMonsterIndex = updatedParticipants.findIndex(p => p.id === monsterId);
        const updatedMonster = updatedParticipants[updatedMonsterIndex];
        
        console.log('Monster after update:', updatedMonster);
        
        // Update the initiative list to reflect the changes
        updateInitiativeList();
        
        // If this is the active monster, update the stat block
        if (getCombatStarted() && getCurrentTurnIndex() === updatedMonsterIndex) {
            displayMonsterStatBlock(updatedMonster);
        }
    } else {
        console.error('Monster not found or not a monster type');
    }
}

// Heal a monster
export function healMonster(monsterId, amount) {
    console.log('Healing monster:', monsterId, 'amount:', amount);
    
    const participants = getParticipants();
    console.log('All participants:', participants);
    
    const monsterIndex = participants.findIndex(p => p.id === monsterId);
    console.log('Monster index:', monsterIndex);
    
    if (monsterIndex !== -1 && participants[monsterIndex].type === 'monster') {
        const monster = participants[monsterIndex];
        console.log('Monster before healing:', monster);
        
        const newHp = Math.min(monster.maxHp, monster.currentHp + amount);
        // A monster is only defeated if its HP is 0
        const defeated = newHp === 0;
        
        console.log('New HP:', newHp, 'Defeated:', defeated);
        
        // Update the monster in the state
        updateParticipant(monsterId, {
            currentHp: newHp,
            defeated: defeated
        });
        
        // Get the updated participants array and monster
        const updatedParticipants = getParticipants();
        const updatedMonsterIndex = updatedParticipants.findIndex(p => p.id === monsterId);
        const updatedMonster = updatedParticipants[updatedMonsterIndex];
        
        console.log('Monster after update:', updatedMonster);
        
        // Update the initiative list to reflect the changes
        updateInitiativeList();
        
        // If this is the active monster, update the stat block
        if (getCombatStarted() && getCurrentTurnIndex() === updatedMonsterIndex) {
            displayMonsterStatBlock(updatedMonster);
        }
    } else {
        console.error('Monster not found or not a monster type');
    }
}

// Display monster stat block in the active stat block area
export function displayMonsterStatBlock(monster) {
    console.log('Displaying stat block for monster:', monster);
    console.log('Monster AC value:', monster.ac);
    
    if (!monster || monster.type !== 'monster') {
        elements.activeStatBlockElement.innerHTML = '';
        return;
    }
    
    const monsterData = getMonsterData()[monster.index || monster.monsterIndex];
    console.log('Monster data from state:', monsterData);
    
    if (!monsterData) {
        elements.activeStatBlockElement.innerHTML = '<div class="turn-info">Monster details not available.</div>';
        return;
    }
    
    // Check if we already have a stat block for this monster and it's up to date
    const existingStatBlock = elements.activeStatBlockElement.querySelector('.monster-stat-block');
    if (existingStatBlock && 
        existingStatBlock.dataset.monsterId === monster.id && 
        existingStatBlock.dataset.monsterHp === String(monster.currentHp)) {
        // Stat block is already up to date, no need to rebuild
        return;
    }
    
    // Ensure monster has actions from monsterData if not already present
    if (!monster.actions && monsterData.actions) {
        monster.actions = monsterData.actions;
    }
    
    // Ensure monster has special abilities from monsterData if not already present
    if (!monster.special_abilities && monsterData.special_abilities) {
        monster.special_abilities = monsterData.special_abilities;
    }
    
    // Ensure monster has ability scores
    const abilityScores = monster.abilityScores || {
        str: { score: monsterData.strength, mod: Math.floor((monsterData.strength - 10) / 2) },
        dex: { score: monsterData.dexterity, mod: Math.floor((monsterData.dexterity - 10) / 2) },
        con: { score: monsterData.constitution, mod: Math.floor((monsterData.constitution - 10) / 2) },
        int: { score: monsterData.intelligence, mod: Math.floor((monsterData.intelligence - 10) / 2) },
        wis: { score: monsterData.wisdom, mod: Math.floor((monsterData.wisdom - 10) / 2) },
        cha: { score: monsterData.charisma, mod: Math.floor((monsterData.charisma - 10) / 2) }
    };
    
    const isCurrentTurn = getCombatStarted() && getParticipants()[getCurrentTurnIndex()]?.id === monster.id;
    
    console.log('Is current turn:', isCurrentTurn);
    console.log('Monster actions:', monster.actions);
    
    // Create a more compact stat block
    let statBlockHTML = `
        <div class="stat-block" data-monster-id="${monster.id}" data-monster-hp="${monster.currentHp}">
            <div class="stat-block-name-bar">
                <h3 class="card-title">${monster.name}</h3>
            </div>
            <div class="stat-block-type-bar">
                ${monster.size || monsterData.size} ${monster.monsterType || monsterData.type}${monster.subtype || monsterData.subtype ? ` (${monster.subtype || monsterData.subtype})` : ''}, ${monster.alignment || monsterData.alignment}
            </div>
            
            <div class="stat-block-content">
                <!-- Top row with core stats -->
                <div class="grid grid-cols-3 gap-2 mb-4">
                    <div class="text-sm"><strong>AC</strong> ${monster.ac !== undefined ? monster.ac : 'N/A'}</div>
                    <div class="text-sm"><strong>HP</strong> ${monster.currentHp}/${monster.maxHp}</div>
                    <div class="text-sm"><strong>Speed</strong> ${Object.entries(monster.speed || monsterData.speed).map(([type, speed]) => 
                        type === 'walk' ? `${speed} ft.` : `${type} ${speed} ft.`).join(', ')}</div>
                </div>
                
                <!-- Ability scores in a compact row -->
                <div class="stat-block-abilities">
                    <div class="ability">
                        <div class="ability-name">STR</div>
                        <div class="ability-score">${abilityScores.str.score} (${formatModifier(abilityScores.str.mod)})</div>
                    </div>
                    <div class="ability">
                        <div class="ability-name">DEX</div>
                        <div class="ability-score">${abilityScores.dex.score} (${formatModifier(abilityScores.dex.mod)})</div>
                    </div>
                    <div class="ability">
                        <div class="ability-name">CON</div>
                        <div class="ability-score">${abilityScores.con.score} (${formatModifier(abilityScores.con.mod)})</div>
                    </div>
                    <div class="ability">
                        <div class="ability-name">INT</div>
                        <div class="ability-score">${abilityScores.int.score} (${formatModifier(abilityScores.int.mod)})</div>
                    </div>
                    <div class="ability">
                        <div class="ability-name">WIS</div>
                        <div class="ability-score">${abilityScores.wis.score} (${formatModifier(abilityScores.wis.mod)})</div>
                    </div>
                    <div class="ability">
                        <div class="ability-name">CHA</div>
                        <div class="ability-score">${abilityScores.cha.score} (${formatModifier(abilityScores.cha.mod)})</div>
                    </div>
                </div>
                
                <!-- Tabbed interface for details, abilities, and actions -->
                <div class="border-t border-gray-200 mt-4 pt-4">
                    <div class="flex border-b border-gray-200 mb-4">
                        <button class="px-4 py-2 text-sm font-medium border-b-2 border-primary -mb-px tab-button active" data-tab="details">Details</button>
                        ${monster.special_abilities && monster.special_abilities.length > 0 ? 
                            `<button class="px-4 py-2 text-sm font-medium border-b-2 border-transparent hover:border-gray-300 -mb-px tab-button" data-tab="abilities">Abilities</button>` : ''}
                        ${monster.actions && monster.actions.length > 0 ? 
                            `<button class="px-4 py-2 text-sm font-medium border-b-2 border-transparent hover:border-gray-300 -mb-px tab-button" data-tab="actions">Actions</button>` : ''}
                    </div>
                    
                    <!-- Details tab -->
                    <div class="tab-content active" id="details-tab">
                        <div class="space-y-2">
    `;
    
    // Add senses, languages, etc.
    if (monsterData.senses) {
        const senses = Object.entries(monsterData.senses)
            .map(([key, value]) => `${key.replace(/_/g, ' ')} ${value}`)
            .join(', ');
        if (senses) {
            statBlockHTML += `<div class="text-sm mb-1"><strong>Senses</strong> ${senses}</div>`;
        }
    }
    
    if (monsterData.languages) {
        statBlockHTML += `<div class="text-sm mb-1"><strong>Languages</strong> ${monsterData.languages}</div>`;
    }
    
    statBlockHTML += `<div class="text-sm mb-1"><strong>Challenge</strong> ${monster.challenge_rating || monsterData.challenge_rating}</div>
                        </div>
                    </div>
    `;
    
    // Add special abilities tab
    const specialAbilities = monster.special_abilities || monsterData.special_abilities;
    if (specialAbilities && specialAbilities.length > 0) {
        statBlockHTML += `
                    <div class="tab-content" id="abilities-tab">
                        <div class="space-y-2">
        `;
        
        specialAbilities.forEach(ability => {
            statBlockHTML += `
                <div class="text-sm mb-2">
                    <strong>${ability.name}.</strong> ${ability.desc}
                </div>
            `;
        });
        
        statBlockHTML += `
                        </div>
                    </div>
        `;
    }
    
    // Add actions tab
    const actions = monster.actions || monsterData.actions;
    if (actions && actions.length > 0) {
        statBlockHTML += `
                    <div class="tab-content" id="actions-tab">
                        <div class="space-y-2">
        `;
        
        actions.forEach(action => {
            statBlockHTML += `
                <div class="text-sm mb-2">
                    <strong>${action.name}.</strong> ${action.desc}
                </div>
            `;
        });
        
        statBlockHTML += `
                        </div>
        `;
        
        // Add action buttons if it's the monster's turn
        if (isCurrentTurn) {
            console.log('Adding action buttons for current monster');
            statBlockHTML += `<div class="action-buttons">`;
            
            actions.forEach((action, actionIndex) => {
                console.log(`Adding button for action: ${action.name}, index: ${actionIndex}`);
                statBlockHTML += `
                    <button class="btn btn-small btn-outline" 
                        data-action="monster-action" 
                        data-monster-id="${monster.id}" 
                        data-action-index="${actionIndex}">
                        Use ${action.name}
                    </button>
                `;
            });
            
            statBlockHTML += `</div>`;
        }
        
        statBlockHTML += `
                    </div>
        `;
    }
    
    statBlockHTML += `
                </div>
            </div>
        </div>
    `;
    
    elements.activeStatBlockElement.innerHTML = statBlockHTML;
    
    // Add event listeners for tabs
    const tabButtons = elements.activeStatBlockElement.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and content
            tabButtons.forEach(btn => {
                btn.classList.remove('active');
                btn.classList.remove('border-primary');
                btn.classList.add('border-transparent');
            });
            
            const tabContents = elements.activeStatBlockElement.querySelectorAll('.tab-content');
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked button and corresponding content
            button.classList.add('active');
            button.classList.remove('border-transparent');
            button.classList.add('border-primary');
            
            const tabName = button.dataset.tab;
            const tabContent = elements.activeStatBlockElement.querySelector(`#${tabName}-tab`);
            if (tabContent) {
                tabContent.classList.add('active');
            }
        });
    });
    
    // Add event listeners for action buttons
    if (isCurrentTurn && actions && actions.length > 0) {
        const actionButtons = elements.activeStatBlockElement.querySelectorAll('[data-action="monster-action"]');
        
        actionButtons.forEach(button => {
            button.addEventListener('click', function(event) {
                const monsterId = this.dataset.monsterId;
                const actionIndex = parseInt(this.dataset.actionIndex);
                
                // Import the performMonsterAction function dynamically to avoid circular dependencies
                import('./combat.js').then(module => {
                    module.performMonsterAction(monsterId, actionIndex);
                }).catch(error => {
                    console.error('Error importing combat module:', error);
                });
            });
        });
    }
} 