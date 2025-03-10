import { elements } from './dom.js';
import {
  getParticipants,
  setParticipants,
  getCurrentTurnIndex,
  setCurrentTurnIndex,
  setCombatStarted,
  _getCombatStarted,
  getMonsterData,
  updateParticipant,
  _getCurrentRound,
  _getTotalTurns,
  setCurrentRound,
  incrementCurrentRound,
  setTotalTurns,
  incrementTotalTurns,
} from './state.js';
import { displayMonsterStatBlock } from './monster.js';
import { rollDice, rollDamageDice } from './utils.js';
import { updateInitiativeList, updateCombatToolbar } from './ui.js';

// Start combat
export function startCombat() {
  const participants = getParticipants();

  if (participants.length < 2) {
    elements.turnInfoElement.textContent = 'Add at least one PC and one monster to start combat.';
    elements.turnInfoElement.classList.remove('hidden');
    return;
  }

  setCombatStarted(true);
  setCurrentTurnIndex(0);
  setCurrentRound(1); // Start at round 1
  setTotalTurns(1); // Start at turn 1

  // Update UI
  updateInitiativeList();
  updateCombatToolbar(); // Update the toolbar with round/turn info
  processTurn();
}

// Process the current turn
export function processTurn() {
  const participants = getParticipants();
  const currentTurnIndex = getCurrentTurnIndex();
  const currentParticipant = participants[currentTurnIndex];

  // Skip defeated monsters
  if (
    currentParticipant.type === 'monster' &&
    (currentParticipant.currentHp === 0 || currentParticipant.defeated)
  ) {
    nextTurn();
    return;
  }

  // Make sure the turn info element is visible
  elements.turnInfoElement.classList.remove('hidden');

  if (currentParticipant.type === 'player') {
    // PC turn - just display info
    elements.turnInfoElement.innerHTML = `<strong>${currentParticipant.name}'s turn</strong>`;

    // Clear the stat block area but keep it visible
    elements.activeStatBlockElement.innerHTML = `
            <div class="p-4 bg-gray-50 rounded-md text-center">
                <p class="text-gray-500">No stat block available for player characters.</p>
            </div>
        `;
  } else {
    // Monster turn - display prompt for DM to select an action
    elements.turnInfoElement.innerHTML = `<strong>${currentParticipant.name}'s turn</strong><br>
            Select an action from the monster's stat block.`;

    // Display the monster's stat block
    displayMonsterStatBlock(currentParticipant);
  }
}

// Perform a monster action
export function performMonsterAction(monsterId, actionIndex) {
  console.log('performMonsterAction called with:', { monsterId, actionIndex });

  const participants = getParticipants();
  const monsterIndex = participants.findIndex(p => p.id === monsterId);

  console.log('Monster index in participants:', monsterIndex);

  if (monsterIndex === -1 || participants[monsterIndex].type !== 'monster') {
    console.error('Monster not found or not a monster type');
    return;
  }

  const monster = participants[monsterIndex];
  console.log('Monster from participants:', monster);

  // Check if monster has actions directly
  if (monster.actions && Array.isArray(monster.actions) && monster.actions.length > actionIndex) {
    console.log('Using actions from monster instance');
    const selectedAction = monster.actions[actionIndex];
    processMonsterAction(monster, selectedAction);
    return;
  }

  // Fallback to monsterData if monster instance doesn't have actions
  const monsterDetails = getMonsterData()[monster.index || monster.monsterIndex];

  console.log('Monster details from state:', monsterDetails);
  console.log('Monster actions from state:', monsterDetails?.actions);

  if (!monsterDetails || !monsterDetails.actions || actionIndex >= monsterDetails.actions.length) {
    console.error('Action not available:', {
      hasMonsterDetails: !!monsterDetails,
      hasActions: !!(monsterDetails && monsterDetails.actions),
      actionIndex,
      actionsLength: monsterDetails?.actions?.length,
    });
    elements.turnInfoElement.innerHTML += '<br>Action not available.';
    return;
  }

  const selectedAction = monsterDetails.actions[actionIndex];
  console.log('Selected action:', selectedAction);

  // Update the monster with actions if they're missing
  if (!monster.actions && monsterDetails.actions) {
    monster.actions = monsterDetails.actions;
    updateParticipant(monster.id, { actions: monsterDetails.actions });
  }

  processMonsterAction(monster, selectedAction);
}

// Process the selected monster action
function processMonsterAction(monster, selectedAction) {
  console.log('Processing monster action:', selectedAction);

  const participants = getParticipants();

  // Get all PCs as potential targets
  const targets = participants.filter(p => p.type === 'player');

  if (targets.length === 0) {
    elements.turnInfoElement.innerHTML = `<strong>${monster.name}'s turn</strong><br>No targets available.`;
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

    elements.turnInfoElement.innerHTML = resultHTML;
  } else {
    // Non-attack action, just display the description
    elements.turnInfoElement.innerHTML = `
            <strong>${monster.name}'s turn</strong><br>
            ${monster.name} uses ${selectedAction.name}.<br>
            ${selectedAction.desc || 'No description available.'}
        `;
  }
}

// Move to the next turn
export function nextTurn() {
  const participants = getParticipants();
  const currentTurnIndex = getCurrentTurnIndex();

  // Calculate the next turn index
  const nextTurnIndex = (currentTurnIndex + 1) % participants.length;

  // If we're looping back to the first participant, increment the round counter
  if (nextTurnIndex === 0) {
    incrementCurrentRound();
  }

  // Always increment the total turn counter
  incrementTotalTurns();

  // Update the current turn index
  setCurrentTurnIndex(nextTurnIndex);

  // Update the UI
  updateInitiativeList();
  updateCombatToolbar(); // Update the toolbar with round/turn info
  processTurn();
}
