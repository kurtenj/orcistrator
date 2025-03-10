import { elements } from './dom.js';
import {
  addParticipant,
  getParticipants,
  setParticipants,
  _getMonsterData,
  removeParticipant,
  _getCurrentTurnIndex,
  getCombatStarted,
} from './state.js';
import { fetchMonsterDetails } from './api.js';
import { updateInitiativeList } from './ui.js';
import { calculateHpFromHitDice, rollDice } from './utils.js';
import { applyDamageToMonster, healMonster, displayMonsterStatBlock } from './monster.js';
import { performMonsterAction } from './combat.js';
import { createHealthDialog } from './components/ui/dialog.js';

// Handle adding a PC to the initiative order
export function handleAddPC(event) {
  event.preventDefault();

  const name = elements.pcNameInput.value.trim();
  const initiative = parseInt(elements.pcInitiativeInput.value);
  const ac = parseInt(elements.pcAcInput.value);

  if (name && !isNaN(initiative) && !isNaN(ac)) {
    const pc = {
      id: `pc-${Date.now()}`,
      name,
      initiative,
      ac,
      type: 'player',
    };

    addParticipant(pc);
    updateInitiativeList();

    // Reset form
    elements.pcForm.reset();
    elements.pcNameInput.focus();
  }
}

// Handle adding a random PC to the initiative order
export function handleAddRandomPC(count = 1) {
  // Array of fantasy character names
  const characterNames = [
    'Aragorn',
    'Gandalf',
    'Legolas',
    'Gimli',
    'Frodo',
    'Samwise',
    'Meriadoc',
    'Peregrin',
    'Boromir',
    'Faramir',
    'Éowyn',
    'Éomer',
    'Théoden',
    'Galadriel',
    'Elrond',
    'Arwen',
    'Bilbo',
    'Thorin',
    'Balin',
    'Dwalin',
    'Fíli',
    'Kíli',
    'Glóin',
    'Óin',
    'Dori',
    'Nori',
    'Ori',
    'Bifur',
    'Bofur',
    'Bombur',
    'Thranduil',
    'Tauriel',
    'Bard',
    'Beorn',
    'Radagast',
    'Saruman',
    'Gollum',
    'Smaug',
    'Denethor',
    'Celeborn',
    'Haldir',
    'Glorfindel',
    'Círdan',
    'Elendil',
    'Isildur',
    'Gil-galad',
    'Celebrimbor',
    'Thingol',
    'Lúthien',
    'Beren',
  ];

  // Ensure count is a valid number
  count = Math.max(1, Math.min(10, parseInt(count) || 1));

  // Keep track of used names to avoid duplicates
  const usedNames = new Set();
  let addedPCs = [];

  // Generate the specified number of random PCs
  for (let i = 0; i < count; i++) {
    // Find an unused name
    let randomName;
    do {
      randomName = characterNames[Math.floor(Math.random() * characterNames.length)];
    } while (usedNames.has(randomName) && usedNames.size < characterNames.length);

    // If all names are used, add a number suffix
    if (usedNames.has(randomName)) {
      randomName = `${randomName} ${i + 1}`;
    }

    usedNames.add(randomName);

    // Generate random values
    const randomInitiative = rollDice(20) + Math.floor(Math.random() * 5); // d20 + random modifier (0-4)
    const randomAC = Math.floor(Math.random() * 8) + 12; // AC between 12 and 19

    // Create the PC object
    const pc = {
      id: `pc-${Date.now()}-${i}`,
      name: randomName,
      initiative: randomInitiative,
      ac: randomAC,
      type: 'player',
    };

    // Add to participants
    addParticipant(pc);
    addedPCs.push(pc);

    // Log to console
    console.log(
      `Added random PC: ${randomName} (Initiative: ${randomInitiative}, AC: ${randomAC})`
    );
  }

  // Update the initiative list
  updateInitiativeList();

  // Show visual feedback
  elements.turnInfoElement.classList.remove('hidden');

  if (count === 1) {
    const pc = addedPCs[0];
    elements.turnInfoElement.innerHTML = `
            <div class="bg-green-100 border-l-4 border-green-500 text-green-700 p-2 mb-2">
                Added random PC: <strong>${pc.name}</strong> (Initiative: ${pc.initiative}, AC: ${pc.ac})
            </div>
        `;
  } else {
    elements.turnInfoElement.innerHTML = `
            <div class="bg-green-100 border-l-4 border-green-500 text-green-700 p-2 mb-2">
                Added ${count} random PCs to the initiative order.
            </div>
        `;
  }

  // Clear the feedback after 3 seconds
  setTimeout(() => {
    if (!getCombatStarted()) {
      elements.turnInfoElement.innerHTML = '';
      elements.turnInfoElement.classList.add('hidden');
    }
  }, 3000);
}

// Handle adding monsters to the initiative order
export async function handleAddMonster(event) {
  event.preventDefault();

  const monsterName = elements.monsterSearchInput.value.trim();
  const count = parseInt(elements.monsterCountInput.value);

  if (monsterName && count > 0) {
    // Show loading indicator
    elements.monsterForm.classList.add('loading');

    // Find the monster index from the datalist
    const option = Array.from(elements.monsterList.options).find(opt => opt.value === monsterName);

    if (option) {
      const monsterIndex = option.dataset.index;
      console.log('Selected monster index:', monsterIndex);

      try {
        // Fetch monster details
        const monsterData = await fetchMonsterDetails(monsterIndex);

        if (monsterData) {
          console.log('Monster data fetched:', monsterData);
          console.log('Monster armor class:', monsterData.armor_class);

          // Calculate HP from hit dice
          const hp = calculateHpFromHitDice(monsterData.hit_dice, monsterData.constitution);

          // Add monsters to the initiative
          for (let i = 0; i < count; i++) {
            // Roll initiative for each monster
            const initiative = rollDice(1, 20) + Math.floor((monsterData.dexterity - 10) / 2);

            // Create a unique name if there are multiple monsters
            const name = count > 1 ? `${monsterData.name} ${i + 1}` : monsterData.name;

            // Create ability scores object
            const abilityScores = {
              str: {
                score: monsterData.strength,
                mod: Math.floor((monsterData.strength - 10) / 2),
              },
              dex: {
                score: monsterData.dexterity,
                mod: Math.floor((monsterData.dexterity - 10) / 2),
              },
              con: {
                score: monsterData.constitution,
                mod: Math.floor((monsterData.constitution - 10) / 2),
              },
              int: {
                score: monsterData.intelligence,
                mod: Math.floor((monsterData.intelligence - 10) / 2),
              },
              wis: { score: monsterData.wisdom, mod: Math.floor((monsterData.wisdom - 10) / 2) },
              cha: {
                score: monsterData.charisma,
                mod: Math.floor((monsterData.charisma - 10) / 2),
              },
            };

            // Extract AC from the new armor_class structure
            let armorClass = 10; // Default AC
            if (
              monsterData.armor_class &&
              Array.isArray(monsterData.armor_class) &&
              monsterData.armor_class.length > 0
            ) {
              armorClass = monsterData.armor_class[0].value;
              console.log('Monster armor class extracted:', armorClass);
            } else {
              console.warn(
                'Could not extract armor class from monster data:',
                monsterData.armor_class
              );
            }

            const monster = {
              id: `monster-${Date.now()}-${i}`,
              name,
              initiative,
              ac: armorClass,
              type: 'monster',
              index: monsterIndex,
              monsterIndex: monsterIndex,
              maxHp: hp,
              currentHp: hp,
              defeated: false,
              size: monsterData.size,
              monsterType: monsterData.type,
              subtype: monsterData.subtype,
              alignment: monsterData.alignment,
              speed: monsterData.speed,
              abilityScores: abilityScores,
              challenge_rating: monsterData.challenge_rating,
              actions: monsterData.actions,
              special_abilities: monsterData.special_abilities,
            };

            console.log('Adding monster to participants:', monster);
            addParticipant(monster);
          }

          updateInitiativeList();

          // Reset form
          elements.monsterForm.reset();
          elements.monsterSearchInput.focus();
        }
      } catch (error) {
        console.error('Error adding monster:', error);
        alert('Error adding monster. Please try again.');
      } finally {
        // Hide loading indicator
        elements.monsterForm.classList.remove('loading');
      }
    } else {
      alert('Monster not found. Please select a monster from the list.');
      elements.monsterForm.classList.remove('loading');
    }
  }
}

// Handle clicks on the initiative list (for HP management, etc.)
export function handleInitiativeListClick(event) {
  // console.log('Initiative list clicked:', event.target);

  // Get the action from the data-action attribute
  const action = event.target.dataset.action;

  if (!action) {
    return; // No action specified
  }

  // Find the closest parent with a data-id attribute
  const listItem = event.target.closest('[data-id]');
  if (!listItem) {
    console.error('Could not find parent list item with data-id');
    return;
  }

  const participantId = listItem.dataset.id;
  if (!participantId) {
    console.error('Missing participant ID');
    return;
  }

  // Handle different actions
  switch (action) {
    case 'damage':
      createHealthDialog({
        title: 'Apply Damage',
        type: 'damage',
        onConfirm: (amount) => {
          applyDamageToMonster(participantId, amount);
        }
      });
      break;

    case 'heal':
      createHealthDialog({
        title: 'Apply Healing',
        type: 'heal',
        onConfirm: (amount) => {
          healMonster(participantId, amount);
        }
      });
      break;

    default:
      console.warn('Unknown action:', action);
  }
}
