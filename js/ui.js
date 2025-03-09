import { elements } from './dom.js';
import { 
    getParticipants, 
    getCurrentTurnIndex, 
    getCombatStarted, 
    setParticipants,
    setCurrentTurnIndex,
    getCurrentRound,
    getTotalTurns
} from './state.js';

// Update the combat toolbar with round and turn information
export function updateCombatToolbar() {
    const currentRound = getCurrentRound();
    const totalTurns = getTotalTurns();
    const participants = getParticipants();
    const combatStarted = getCombatStarted();
    
    // Update round counter
    elements.roundCounter.textContent = `Round: ${currentRound}`;
    
    // Update turn counter
    if (participants.length > 0) {
        const currentTurn = (totalTurns - 1) % participants.length + 1;
        elements.turnCounter.textContent = `Turn: ${currentTurn}/${participants.length}`;
    } else {
        elements.turnCounter.textContent = `Turn: 0/0`;
    }
    
    // Show/hide elements based on combat state
    if (combatStarted) {
        // Show next turn button and counters when combat is started
        elements.nextTurnButton.classList.remove('hidden');
        elements.nextTurnButton.disabled = false;
        elements.combatCounters.classList.remove('hidden');
        elements.startCombatButton.disabled = true;
    } else {
        // Hide next turn button and counters when combat is not started
        elements.nextTurnButton.classList.add('hidden');
        elements.nextTurnButton.disabled = true;
        elements.combatCounters.classList.add('hidden');
        elements.startCombatButton.disabled = false;
    }
}

// Update the initiative list display
export function updateInitiativeList() {
    // Remove debug logs in production
    // console.log('Updating initiative list');
    
    const participants = getParticipants();
    // console.log('Participants for initiative list:', participants);
    
    const currentTurnIndex = getCurrentTurnIndex();
    const combatStarted = getCombatStarted();
    
    // console.log('Current turn index:', currentTurnIndex);
    // console.log('Combat started:', combatStarted);
    
    // Store the ID of the current participant before sorting
    const currentParticipantId = combatStarted && currentTurnIndex >= 0 && currentTurnIndex < participants.length
        ? participants[currentTurnIndex].id
        : null;
    
    // console.log('Current participant ID:', currentParticipantId);
    
    // Sort participants by initiative (highest first)
    const sortedParticipants = [...participants].sort((a, b) => b.initiative - a.initiative);
    
    // Find the new index of the current participant after sorting
    let newCurrentTurnIndex = -1;
    if (currentParticipantId) {
        newCurrentTurnIndex = sortedParticipants.findIndex(p => p.id === currentParticipantId);
    }
    
    // Only rebuild the DOM if necessary
    const needsRebuild = shouldRebuildInitiativeList(sortedParticipants);
    
    if (needsRebuild) {
        elements.initiativeListElement.innerHTML = '';
        
        sortedParticipants.forEach((participant, index) => {
            const item = document.createElement('div');
            
            // Base classes for all initiative items
            let itemClasses = 'initiative-item';
            
            // Add type-specific classes
            if (participant.type === 'monster') {
                itemClasses += ' monster';
                
                if (participant.defeated) {
                    itemClasses += ' defeated';
                }
            }
            
            // Add active classes if this is the current turn
            if (combatStarted && index === newCurrentTurnIndex) {
                itemClasses += ' active';
            }
            
            item.className = itemClasses;
            item.dataset.id = participant.id;
            
            const participantInfo = document.createElement('div');
            participantInfo.className = 'participant-info';
            
            const nameInitiative = document.createElement('div');
            nameInitiative.className = 'name-initiative';
            
            const name = document.createElement('span');
            name.className = 'name';
            name.textContent = participant.name;
            
            const initiative = document.createElement('span');
            initiative.className = 'initiative';
            initiative.textContent = `Initiative: ${participant.initiative}`;
            
            nameInitiative.appendChild(name);
            nameInitiative.appendChild(initiative);
            
            const acInfo = document.createElement('div');
            acInfo.className = 'ac-info';
            acInfo.textContent = `AC: ${participant.ac}`;
            
            participantInfo.appendChild(nameInitiative);
            participantInfo.appendChild(acInfo);
            
            item.appendChild(participantInfo);
            
            if (participant.type === 'monster') {
                const monsterControls = document.createElement('div');
                monsterControls.className = 'monster-controls';
                
                const hpContainer = document.createElement('div');
                hpContainer.className = 'monster-hp';
                
                const hpText = document.createElement('span');
                hpText.className = 'hp-text';
                hpText.textContent = `${participant.currentHp}/${participant.maxHp}`;
                
                const hpBarContainer = document.createElement('div');
                hpBarContainer.className = 'hp-bar';
                
                const hpPercentage = (participant.currentHp / participant.maxHp) * 100;
                const hpFill = document.createElement('div');
                let hpFillClass = 'hp-fill';
                
                // Add color class based on HP percentage
                if (hpPercentage <= 25) {
                    hpFillClass += ' low';
                } else if (hpPercentage <= 50) {
                    hpFillClass += ' medium';
                }
                
                hpFill.className = hpFillClass;
                hpFill.style.width = `${hpPercentage}%`;
                
                hpBarContainer.appendChild(hpFill);
                
                const hpControls = document.createElement('div');
                hpControls.className = 'hp-controls';
                
                const damageBtn = document.createElement('button');
                damageBtn.className = 'btn btn-small damage-btn';
                damageBtn.textContent = '-';
                damageBtn.dataset.action = 'damage';
                
                const healBtn = document.createElement('button');
                healBtn.className = 'btn btn-small heal-btn';
                healBtn.textContent = '+';
                healBtn.dataset.action = 'heal';
                
                hpControls.appendChild(damageBtn);
                hpControls.appendChild(healBtn);
                
                hpContainer.appendChild(hpText);
                hpContainer.appendChild(hpBarContainer);
                
                monsterControls.appendChild(hpContainer);
                monsterControls.appendChild(hpControls);
                
                item.appendChild(monsterControls);
            }
            
            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-btn';
            removeBtn.textContent = '×';
            removeBtn.dataset.action = 'remove';
            
            item.appendChild(removeBtn);
            
            elements.initiativeListElement.appendChild(item);
        });
        
        // Update the state with the sorted participants
        setParticipants(sortedParticipants);
        
        // Update the current turn index if needed
        if (newCurrentTurnIndex !== -1 && newCurrentTurnIndex !== currentTurnIndex) {
            setCurrentTurnIndex(newCurrentTurnIndex);
        }
    } else {
        // Just update the existing items without rebuilding the DOM
        updateExistingInitiativeItems(sortedParticipants, newCurrentTurnIndex, combatStarted);
    }
}

// Helper function to determine if we need to rebuild the initiative list
function shouldRebuildInitiativeList(participants) {
    // Check if the number of participants matches the number of items in the DOM
    const initiativeItems = elements.initiativeListElement.querySelectorAll('[data-id]');
    
    if (initiativeItems.length !== participants.length) {
        return true;
    }
    
    // Check if the IDs match in order
    for (let i = 0; i < participants.length; i++) {
        const itemId = initiativeItems[i].dataset.id;
        const participantId = participants[i].id;
        
        if (itemId !== participantId) {
            return true;
        }
    }
    
    return false;
}

// Update existing initiative items without rebuilding the DOM
function updateExistingInitiativeItems(participants, currentTurnIndex, combatStarted) {
    const initiativeItems = elements.initiativeListElement.querySelectorAll('[data-id]');
    
    initiativeItems.forEach((item, index) => {
        const participant = participants.find(p => p.id === item.dataset.id);
        
        if (!participant) return;
        
        // Update active state
        if (combatStarted && index === currentTurnIndex) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
        
        // Update monster HP if needed
        if (participant.type === 'monster') {
            const hpText = item.querySelector('.hp-text');
            if (hpText) {
                hpText.textContent = `${participant.currentHp}/${participant.maxHp}`;
            }
            
            const hpFill = item.querySelector('div.h-full');
            if (hpFill) {
                const hpPercentage = (participant.currentHp / participant.maxHp) * 100;
                hpFill.style.width = `${hpPercentage}%`;
                
                // Update HP fill color based on percentage
                hpFill.classList.remove('low', 'medium');
                if (hpPercentage <= 25) {
                    hpFill.classList.add('low');
                } else if (hpPercentage <= 50) {
                    hpFill.classList.add('medium');
                }
            }
            
            // Update defeated state
            if (participant.defeated) {
                item.classList.add('opacity-60');
            } else {
                item.classList.remove('opacity-60');
            }
        }
    });
} 