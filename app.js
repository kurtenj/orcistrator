// Constants
const DND_API_BASE_URL = 'https://www.dnd5eapi.co/api';

// DOM Elements
const pcForm = document.getElementById('pc-form');
const pcNameInput = document.getElementById('pc-name');
const pcInitiativeInput = document.getElementById('pc-initiative');
const pcAcInput = document.getElementById('pc-ac');

const monsterForm = document.getElementById('monster-form');
const monsterSearchInput = document.getElementById('monster-search');
const monsterCountInput = document.getElementById('monster-count');
const monsterList = document.getElementById('monster-list');

const initiativeListElement = document.getElementById('initiative-list');
const startCombatButton = document.getElementById('start-combat');
const nextTurnButton = document.getElementById('next-turn');
const turnInfoElement = document.getElementById('turn-info');
const activeStatBlockElement = document.getElementById('active-stat-block');

// State
let monsters = [];
let participants = [];
let currentTurnIndex = -1;
let combatStarted = false;
let monsterData = {};

// Initialize the application
document.addEventListener('DOMContentLoaded', initialize);

function initialize() {
    fetchMonsters();
    setupEventListeners();
}

// Fetch monsters from the D&D 5e API
async function fetchMonsters() {
    try {
        const response = await fetch(`${DND_API_BASE_URL}/monsters`);
        const data = await response.json();
        
        if (data && data.results) {
            populateMonsterList(data.results);
        }
    } catch (error) {
        console.error('Error fetching monsters:', error);
        turnInfoElement.textContent = 'Error loading monsters. Please refresh the page.';
    }
}

// Populate the monster datalist with options
function populateMonsterList(monsters) {
    monsterList.innerHTML = '';
    
    monsters.forEach(monster => {
        const option = document.createElement('option');
        option.value = monster.name;
        option.dataset.index = monster.index;
        monsterList.appendChild(option);
    });
}

// Set up event listeners
function setupEventListeners() {
    pcForm.addEventListener('submit', handleAddPC);
    monsterForm.addEventListener('submit', handleAddMonster);
    startCombatButton.addEventListener('click', startCombat);
    nextTurnButton.addEventListener('click', nextTurn);
    
    // Event delegation for HP management and action selection
    initiativeListElement.addEventListener('click', handleInitiativeListClick);
}

// Handle adding a PC to the initiative order
function handleAddPC(event) {
    event.preventDefault();
    
    const name = pcNameInput.value.trim();
    const initiative = parseInt(pcInitiativeInput.value);
    const ac = parseInt(pcAcInput.value);
    
    if (name && !isNaN(initiative) && !isNaN(ac)) {
        const pc = {
            id: `pc-${Date.now()}`,
            name,
            initiative,
            ac,
            type: 'pc'
        };
        
        participants.push(pc);
        updateInitiativeList();
        
        // Reset form
        pcForm.reset();
        pcNameInput.focus();
    }
}

// Handle adding monsters to the initiative order
async function handleAddMonster(event) {
    event.preventDefault();
    
    const monsterName = monsterSearchInput.value.trim();
    const count = parseInt(monsterCountInput.value);
    
    if (monsterName && count > 0) {
        // Find the monster index from the datalist
        const option = Array.from(monsterList.options).find(opt => opt.value === monsterName);
        
        if (option) {
            const monsterIndex = option.dataset.index;
            
            try {
                // Fetch detailed monster data if not already cached
                if (!monsterData[monsterIndex]) {
                    const response = await fetch(`${DND_API_BASE_URL}/monsters/${monsterIndex}`);
                    const data = await response.json();
                    monsterData[monsterIndex] = data;
                }
                
                const monster = monsterData[monsterIndex];
                
                // Calculate Dexterity modifier for initiative
                const dexMod = Math.floor((monster.dexterity - 10) / 2);
                
                // Add the specified number of monster instances
                for (let i = 0; i < count; i++) {
                    // Roll initiative: d20 + dexterity modifier
                    const initiativeRoll = rollDice(20) + dexMod;
                    
                    // Calculate HP: if hit_points is available, use it; otherwise, use hit_dice to calculate
                    let maxHp = monster.hit_points;
                    if (!maxHp && monster.hit_dice) {
                        maxHp = calculateHpFromHitDice(monster.hit_dice, Math.floor((monster.constitution - 10) / 2));
                    }
                    
                    // Extract ability scores and modifiers
                    const abilityScores = {
                        str: { score: monster.strength, mod: Math.floor((monster.strength - 10) / 2) },
                        dex: { score: monster.dexterity, mod: Math.floor((monster.dexterity - 10) / 2) },
                        con: { score: monster.constitution, mod: Math.floor((monster.constitution - 10) / 2) },
                        int: { score: monster.intelligence, mod: Math.floor((monster.intelligence - 10) / 2) },
                        wis: { score: monster.wisdom, mod: Math.floor((monster.wisdom - 10) / 2) },
                        cha: { score: monster.charisma, mod: Math.floor((monster.charisma - 10) / 2) }
                    };
                    
                    const monsterInstance = {
                        id: `monster-${Date.now()}-${i}`,
                        name: `${monster.name} ${i + 1}`,
                        initiative: initiativeRoll,
                        ac: monster.armor_class,
                        type: 'monster',
                        monsterIndex: monsterIndex,
                        actions: monster.actions || [],
                        maxHp: maxHp || 10, // Fallback to 10 HP if no data available
                        currentHp: maxHp || 10,
                        abilityScores: abilityScores,
                        speed: monster.speed,
                        challenge_rating: monster.challenge_rating,
                        size: monster.size,
                        monsterType: monster.type,
                        subtype: monster.subtype || '',
                        alignment: monster.alignment || 'unaligned',
                        senses: monster.senses || {},
                        languages: monster.languages || 'None',
                        special_abilities: monster.special_abilities || []
                    };
                    
                    participants.push(monsterInstance);
                }
                
                updateInitiativeList();
                
                // Reset form
                monsterForm.reset();
                monsterSearchInput.focus();
                
            } catch (error) {
                console.error('Error fetching monster details:', error);
                turnInfoElement.textContent = `Error loading details for ${monsterName}.`;
            }
        } else {
            turnInfoElement.textContent = `Monster "${monsterName}" not found.`;
        }
    }
}

// Calculate HP from hit dice (e.g., "3d8+6")
function calculateHpFromHitDice(hitDice, conMod) {
    const match = hitDice.match(/(\d+)d(\d+)(?:\+(\d+))?/);
    
    if (match) {
        const numDice = parseInt(match[1]);
        const diceSides = parseInt(match[2]);
        const bonus = match[3] ? parseInt(match[3]) : 0;
        
        // Calculate average HP: numDice * (diceSides + 1) / 2 + bonus
        // This gives the average roll for each die
        return Math.floor(numDice * ((diceSides + 1) / 2)) + bonus;
    }
    
    return 10; // Fallback
}

// Handle clicks on the initiative list (for HP management and action selection)
function handleInitiativeListClick(event) {
    // Check if the click was on a damage button
    if (event.target.classList.contains('damage-btn')) {
        const monsterId = event.target.dataset.id;
        const damageAmount = parseInt(prompt('Enter damage amount:'));
        
        if (!isNaN(damageAmount) && damageAmount > 0) {
            applyDamageToMonster(monsterId, damageAmount);
        }
    }
    // Check if the click was on a heal button
    else if (event.target.classList.contains('heal-btn')) {
        const monsterId = event.target.dataset.id;
        const healAmount = parseInt(prompt('Enter healing amount:'));
        
        if (!isNaN(healAmount) && healAmount > 0) {
            healMonster(monsterId, healAmount);
        }
    }
    // Check if the click was on a toggle stat block button
    else if (event.target.classList.contains('toggle-stats-btn')) {
        const monsterId = event.target.dataset.id;
        const monsterIndex = participants.findIndex(p => p.id === monsterId);
        
        if (monsterIndex !== -1 && participants[monsterIndex].type === 'monster') {
            displayMonsterStatBlock(participants[monsterIndex]);
        }
    }
    // Check if the click was on an action button
    else if (event.target.classList.contains('action-btn')) {
        const monsterId = event.target.dataset.monsterId;
        const actionIndex = event.target.dataset.actionIndex;
        
        if (monsterId && actionIndex !== undefined) {
            performMonsterAction(monsterId, parseInt(actionIndex));
        }
    }
}

// Apply damage to a monster
function applyDamageToMonster(monsterId, amount) {
    const monsterIndex = participants.findIndex(p => p.id === monsterId);
    
    if (monsterIndex !== -1 && participants[monsterIndex].type === 'monster') {
        participants[monsterIndex].currentHp = Math.max(0, participants[monsterIndex].currentHp - amount);
        
        // Check if monster is defeated
        if (participants[monsterIndex].currentHp === 0) {
            participants[monsterIndex].defeated = true;
        }
        
        updateInitiativeList();
        
        // If this is the active monster, update the stat block
        if (combatStarted && monsterIndex === currentTurnIndex) {
            displayMonsterStatBlock(participants[monsterIndex]);
        }
    }
}

// Heal a monster
function healMonster(monsterId, amount) {
    const monsterIndex = participants.findIndex(p => p.id === monsterId);
    
    if (monsterIndex !== -1 && participants[monsterIndex].type === 'monster') {
        participants[monsterIndex].currentHp = Math.min(
            participants[monsterIndex].maxHp,
            participants[monsterIndex].currentHp + amount
        );
        
        // If monster was defeated but now has HP, mark as not defeated
        if (participants[monsterIndex].defeated && participants[monsterIndex].currentHp > 0) {
            participants[monsterIndex].defeated = false;
        }
        
        updateInitiativeList();
        
        // If this is the active monster, update the stat block
        if (combatStarted && monsterIndex === currentTurnIndex) {
            displayMonsterStatBlock(participants[monsterIndex]);
        }
    }
}

// Format modifier for display (e.g., +2 or -1)
function formatModifier(mod) {
    return mod >= 0 ? `+${mod}` : `${mod}`;
}

// Update the initiative list display
function updateInitiativeList() {
    initiativeListElement.innerHTML = '';
    
    // Sort participants by initiative (highest first)
    const sortedParticipants = [...participants].sort((a, b) => b.initiative - a.initiative);
    
    sortedParticipants.forEach((participant, index) => {
        const item = document.createElement('div');
        item.classList.add('initiative-item');
        
        if (participant.type === 'monster') {
            item.classList.add('monster');
            
            // Add defeated class if monster is at 0 HP
            if (participant.currentHp === 0 || participant.defeated) {
                item.classList.add('defeated');
            }
        }
        
        if (combatStarted && sortedParticipants[currentTurnIndex].id === participant.id) {
            item.classList.add('active');
        }
        
        // Basic participant info
        let itemContent = `
            <div class="participant-info">
                <span>${participant.name}</span>
                <span>Initiative: ${participant.initiative}</span>
            </div>
        `;
        
        // Add HP display and controls for monsters
        if (participant.type === 'monster') {
            const hpPercentage = Math.floor((participant.currentHp / participant.maxHp) * 100);
            
            itemContent += `
                <div class="monster-hp">
                    <div class="hp-bar">
                        <div class="hp-fill" style="width: ${hpPercentage}%"></div>
                    </div>
                    <div class="hp-text">
                        HP: ${participant.currentHp}/${participant.maxHp}
                    </div>
                    <div class="hp-controls">
                        <button class="btn btn-small damage-btn" data-id="${participant.id}">Damage</button>
                        <button class="btn btn-small heal-btn" data-id="${participant.id}">Heal</button>
                        <button class="btn btn-small toggle-stats-btn" data-id="${participant.id}">Stats</button>
                    </div>
                </div>
            `;
        }
        
        item.innerHTML = itemContent;
        initiativeListElement.appendChild(item);
    });
    
    // Update participants with sorted order
    participants = sortedParticipants;
}

// Display monster stat block in the active stat block area
function displayMonsterStatBlock(monster) {
    if (!monster || monster.type !== 'monster') {
        activeStatBlockElement.innerHTML = '';
        return;
    }
    
    const monsterDetails = monsterData[monster.monsterIndex];
    if (!monsterDetails) {
        activeStatBlockElement.innerHTML = '<div class="turn-info">Monster details not available.</div>';
        return;
    }
    
    const abilityScores = monster.abilityScores;
    const isCurrentTurn = combatStarted && participants[currentTurnIndex].id === monster.id;
    
    let statBlockHTML = `
        <div class="monster-stat-block">
            <div class="stat-block-name-bar">${monster.name}</div>
            <div class="stat-block-type-bar">
                ${monster.size} ${monster.monsterType}${monster.subtype ? ` (${monster.subtype})` : ''}, ${monster.alignment}
            </div>
            <div class="stat-block-content">
                <div class="stat-block-section">
                    <div class="stat-block-property"><strong>Armor Class</strong> ${monster.ac}</div>
                    <div class="stat-block-property"><strong>Hit Points</strong> ${monster.currentHp}/${monster.maxHp}</div>
                    <div class="stat-block-property"><strong>Speed</strong> ${Object.entries(monster.speed).map(([type, speed]) => 
                        type === 'walk' ? `${speed} ft.` : `${type} ${speed} ft.`).join(', ')}</div>
                </div>
                
                <div class="stat-block-section">
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
                </div>
    `;
    
    // Add senses, languages, etc.
    statBlockHTML += `
        <div class="stat-block-section">
    `;
    
    if (monsterDetails.senses) {
        const senses = Object.entries(monsterDetails.senses)
            .map(([key, value]) => `${key.replace(/_/g, ' ')} ${value}`)
            .join(', ');
        if (senses) {
            statBlockHTML += `<div class="stat-block-property"><strong>Senses</strong> ${senses}</div>`;
        }
    }
    
    if (monsterDetails.languages) {
        statBlockHTML += `<div class="stat-block-property"><strong>Languages</strong> ${monsterDetails.languages}</div>`;
    }
    
    statBlockHTML += `<div class="stat-block-property"><strong>Challenge</strong> ${monster.challenge_rating}</div>
        </div>
    `;
    
    // Add special abilities
    if (monster.special_abilities && monster.special_abilities.length > 0) {
        statBlockHTML += `<div class="stat-block-section">`;
        
        monster.special_abilities.forEach(ability => {
            statBlockHTML += `
                <div class="stat-block-property">
                    <strong>${ability.name}.</strong> ${ability.desc}
                </div>
            `;
        });
        
        statBlockHTML += `</div>`;
    }
    
    // Add actions section
    if (monster.actions && monster.actions.length > 0) {
        statBlockHTML += `
            <div class="stat-block-actions-header">Actions</div>
            <div class="stat-block-section">
        `;
        
        monster.actions.forEach(action => {
            statBlockHTML += `
                <div class="stat-block-property">
                    <strong>${action.name}.</strong> ${action.desc}
                </div>
            `;
        });
        
        // Add action buttons if it's the monster's turn
        if (isCurrentTurn) {
            statBlockHTML += `<div class="action-buttons">`;
            
            monster.actions.forEach((action, actionIndex) => {
                statBlockHTML += `
                    <button class="btn action-btn" data-monster-id="${monster.id}" data-action-index="${actionIndex}">
                        Use ${action.name}
                    </button>
                `;
            });
            
            statBlockHTML += `</div>`;
        }
        
        statBlockHTML += `</div>`;
    }
    
    statBlockHTML += `</div></div>`;
    
    activeStatBlockElement.innerHTML = statBlockHTML;
}

// Start combat
function startCombat() {
    if (participants.length < 2) {
        turnInfoElement.textContent = 'Add at least one PC and one monster to start combat.';
        return;
    }
    
    combatStarted = true;
    currentTurnIndex = 0;
    startCombatButton.disabled = true;
    nextTurnButton.disabled = false;
    
    updateInitiativeList();
    processTurn();
}

// Process the current turn
function processTurn() {
    const currentParticipant = participants[currentTurnIndex];
    
    // Skip defeated monsters
    if (currentParticipant.type === 'monster' && 
        (currentParticipant.currentHp === 0 || currentParticipant.defeated)) {
        nextTurn();
        return;
    }
    
    if (currentParticipant.type === 'pc') {
        // PC turn - just display info
        turnInfoElement.innerHTML = `<strong>${currentParticipant.name}'s turn</strong>`;
        activeStatBlockElement.innerHTML = ''; // Clear the stat block area
    } else {
        // Monster turn - display prompt for DM to select an action
        turnInfoElement.innerHTML = `<strong>${currentParticipant.name}'s turn</strong><br>
            Select an action from the monster's stat block.`;
        
        // Display the monster's stat block
        displayMonsterStatBlock(currentParticipant);
    }
}

// Perform a monster action
function performMonsterAction(monsterId, actionIndex) {
    const monsterIndex = participants.findIndex(p => p.id === monsterId);
    
    if (monsterIndex === -1 || participants[monsterIndex].type !== 'monster') {
        return;
    }
    
    const monster = participants[monsterIndex];
    const monsterDetails = monsterData[monster.monsterIndex];
    
    if (!monsterDetails || !monsterDetails.actions || actionIndex >= monsterDetails.actions.length) {
        turnInfoElement.innerHTML += '<br>Action not available.';
        return;
    }
    
    const selectedAction = monsterDetails.actions[actionIndex];
    
    // Get all PCs as potential targets
    const targets = participants.filter(p => p.type === 'pc');
    
    if (targets.length === 0) {
        turnInfoElement.innerHTML = `<strong>${monster.name}'s turn</strong><br>No targets available.`;
        return;
    }
    
    // Randomly select a target
    const target = targets[Math.floor(Math.random() * targets.length)];
    
    // Check if this is an attack action
    if (selectedAction.attack_bonus !== undefined) {
        // Roll to hit: d20 + attack bonus
        const attackRoll = rollDice(20);
        const totalAttackRoll = attackRoll + selectedAction.attack_bonus;
        
        let resultHTML = `
            <strong>${monster.name}'s turn</strong><br>
            ${monster.name} uses ${selectedAction.name} on ${target.name}.<br>
            Attack roll: ${attackRoll} + ${selectedAction.attack_bonus} = ${totalAttackRoll} vs AC ${target.ac}
        `;
        
        // Check if the attack hits
        if (totalAttackRoll >= target.ac) {
            // Hit! Roll damage
            let totalDamage = 0;
            let damageDetails = '';
            
            if (selectedAction.damage && selectedAction.damage.length > 0) {
                selectedAction.damage.forEach(damage => {
                    if (damage.damage_dice) {
                        const damageRoll = rollDamageDice(damage.damage_dice);
                        const damageBonus = damage.damage_bonus || 0;
                        const damageTotal = damageRoll + damageBonus;
                        
                        totalDamage += damageTotal;
                        damageDetails += `${damageRoll} + ${damageBonus} ${damage.damage_type.name}, `;
                    }
                });
                
                damageDetails = damageDetails.slice(0, -2); // Remove trailing comma and space
            }
            
            resultHTML += `<br>Hit! Deals ${totalDamage} damage (${damageDetails}).`;
        } else {
            resultHTML += '<br>Misses!';
        }
        
        turnInfoElement.innerHTML = resultHTML;
    } else {
        // Non-attack action, just display the description
        turnInfoElement.innerHTML = `
            <strong>${monster.name}'s turn</strong><br>
            ${monster.name} uses ${selectedAction.name}.<br>
            ${selectedAction.desc || 'No description available.'}
        `;
    }
}

// Move to the next turn
function nextTurn() {
    currentTurnIndex = (currentTurnIndex + 1) % participants.length;
    updateInitiativeList();
    processTurn();
}

// Utility function to roll a die
function rollDice(sides) {
    return Math.floor(Math.random() * sides) + 1;
}

// Utility function to roll damage dice (e.g., "2d6+2")
function rollDamageDice(damageDice) {
    // Parse the damage dice string (e.g., "2d6")
    const match = damageDice.match(/(\d+)d(\d+)/);
    
    if (match) {
        const numDice = parseInt(match[1]);
        const diceSides = parseInt(match[2]);
        
        let total = 0;
        for (let i = 0; i < numDice; i++) {
            total += rollDice(diceSides);
        }
        
        return total;
    }
    
    return 0;
} 