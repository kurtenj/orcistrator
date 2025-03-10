import { elements } from './dom.js';
import {
  getParticipants,
  getCurrentTurnIndex,
  getCombatStarted,
  setParticipants,
  setCurrentTurnIndex,
  getCurrentRound,
  getTotalTurns,
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
    const currentTurn = ((totalTurns - 1) % participants.length) + 1;
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
  console.info('updateInitiativeList called');
  const participants = getParticipants();
  console.info('participants from getParticipants:', participants);
  const currentTurnIndex = getCurrentTurnIndex();
  const combatStarted = getCombatStarted();

  // Store the ID of the current participant before sorting
  const currentParticipantId =
    combatStarted && currentTurnIndex >= 0 && currentTurnIndex < participants.length
      ? participants[currentTurnIndex].id
      : null;

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

      if (participant.type === 'player') {
        // Create the start container for player items (following Figma design)
        const startContainer = document.createElement('div');
        startContainer.className = 'start';

        // Add arrow icon for active player (only in active state)
        if (combatStarted && index === newCurrentTurnIndex) {
          const arrowIcon = document.createElement('div');
          arrowIcon.className = 'icon-arrow';
          arrowIcon.innerHTML = `<img src="icons/arrow-icon.svg" alt="Active" />`;
          startContainer.appendChild(arrowIcon);
        }

        // Player name
        const name = document.createElement('div');
        name.className = 'name';
        name.textContent = participant.name;
        startContainer.appendChild(name);

        // Initiative container with icon and value
        const initiativeContainer = document.createElement('div');
        initiativeContainer.className = 'initiative';

        const initiativeIconContainer = document.createElement('div');
        initiativeIconContainer.className = 'icon-initiative';
        initiativeIconContainer.innerHTML = `<img src="icons/initiative-icon.svg" alt="Initiative" />`;

        const initiativeValue = document.createElement('div');
        initiativeValue.className = 'initiative-value';
        initiativeValue.textContent = participant.initiative;

        initiativeContainer.appendChild(initiativeIconContainer);
        initiativeContainer.appendChild(initiativeValue);
        startContainer.appendChild(initiativeContainer);

        // Armor class container with icon and value
        const acContainer = document.createElement('div');
        acContainer.className = 'armor-class';

        const acIconContainer = document.createElement('div');
        acIconContainer.className = 'icon-shield';
        acIconContainer.innerHTML = `<img src="icons/shield-icon.svg" alt="AC" />`;

        const acValue = document.createElement('div');
        acValue.className = 'ac-value';
        acValue.textContent = participant.ac;

        acContainer.appendChild(acIconContainer);
        acContainer.appendChild(acValue);
        startContainer.appendChild(acContainer);

        item.appendChild(startContainer);
      } else {
        // Monster implementation - use the same layout as players
        const startContainer = document.createElement('div');
        startContainer.className = 'start';

        // Add arrow icon for active monster (only in active state)
        if (combatStarted && index === newCurrentTurnIndex) {
          const arrowIcon = document.createElement('div');
          arrowIcon.className = 'icon-arrow';
          arrowIcon.innerHTML = `<img src="icons/arrow-icon.svg" alt="Active" />`;
          startContainer.appendChild(arrowIcon);
        }

        // Monster name
        const name = document.createElement('div');
        name.className = 'name';
        name.textContent = participant.name;
        startContainer.appendChild(name);

        // Initiative container with icon and value
        const initiativeContainer = document.createElement('div');
        initiativeContainer.className = 'initiative';

        const initiativeIconContainer = document.createElement('div');
        initiativeIconContainer.className = 'icon-initiative';
        initiativeIconContainer.innerHTML = `<img src="icons/initiative-icon.svg" alt="Initiative" />`;

        const initiativeValue = document.createElement('div');
        initiativeValue.className = 'initiative-value';
        initiativeValue.textContent = participant.initiative;

        initiativeContainer.appendChild(initiativeIconContainer);
        initiativeContainer.appendChild(initiativeValue);
        startContainer.appendChild(initiativeContainer);

        // Armor class container with icon and value
        const acContainer = document.createElement('div');
        acContainer.className = 'armor-class';

        const acIconContainer = document.createElement('div');
        acIconContainer.className = 'icon-shield';
        acIconContainer.innerHTML = `<img src="icons/shield-icon.svg" alt="AC" />`;

        const acValue = document.createElement('div');
        acValue.className = 'ac-value';
        acValue.textContent = participant.ac;

        acContainer.appendChild(acIconContainer);
        acContainer.appendChild(acValue);
        startContainer.appendChild(acContainer);

        // Add the start container to the item
        item.appendChild(startContainer);

        // Create a wrapper div for monster-specific content
        const monsterContentWrapper = document.createElement('div');
        monsterContentWrapper.className = 'monster-content-wrapper';
        
        // For monsters, add HP controls
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

          hpContainer.appendChild(hpText);
          hpContainer.appendChild(hpBarContainer);

          const hpControls = document.createElement('div');
          hpControls.className = 'hp-controls';

          const damageBtn = document.createElement('button');
          damageBtn.className = 'damage-btn';
          damageBtn.textContent = '-';
          damageBtn.dataset.action = 'damage';

          const healBtn = document.createElement('button');
          healBtn.className = 'heal-btn';
          healBtn.textContent = '+';
          healBtn.dataset.action = 'heal';

          hpControls.appendChild(damageBtn);
          hpControls.appendChild(healBtn);

          monsterControls.appendChild(hpContainer);
          monsterControls.appendChild(hpControls);

          monsterContentWrapper.appendChild(monsterControls);
          item.appendChild(monsterContentWrapper);
        }
      }

      elements.initiativeListElement.appendChild(item);
    });

    // Update the state with the sorted participants
    console.info('About to call setParticipants with:', sortedParticipants);
    setParticipants(sortedParticipants);
    console.info('setParticipants called');

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

      // For player and monster items, add the arrow icon if it doesn't exist
      const startContainer = item.querySelector('.start');
      if (startContainer) {
        let arrowIcon = startContainer.querySelector('.icon-arrow');
        if (!arrowIcon) {
          arrowIcon = document.createElement('div');
          arrowIcon.className = 'icon-arrow';
          arrowIcon.innerHTML = `<img src="icons/arrow-icon.svg" alt="Active" />`;
          startContainer.insertBefore(arrowIcon, startContainer.firstChild);
        }
      }
    } else {
      item.classList.remove('active');

      // For player and monster items, remove the arrow icon if it exists
      const arrowIcon = item.querySelector('.icon-arrow');
      if (arrowIcon) {
        arrowIcon.remove();
      }
    }

    // Update monster HP if needed
    if (participant.type === 'monster') {
      const hpText = item.querySelector('.hp-text');
      if (hpText) {
        hpText.textContent = `${participant.currentHp}/${participant.maxHp}`;
      }

      const hpFill = item.querySelector('div.hp-fill');
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
        item.classList.add('defeated');
      } else {
        item.classList.remove('defeated');
        item.classList.remove('opacity-60');
      }
    }
  });
}
