// DOM Elements
export const elements = {
  // PC Form Elements
  pcForm: document.getElementById('pc-form'),
  pcNameInput: document.getElementById('pc-name'),
  pcInitiativeInput: document.getElementById('pc-initiative'),
  pcAcInput: document.getElementById('pc-ac'),
  randomPcButton: document.getElementById('random-pc-button'),
  randomPcDropdown: document.getElementById('random-pc-dropdown'),
  randomPcCountButtons: document.querySelectorAll('.random-pc-count-btn'),

  // Monster Form Elements
  monsterForm: document.getElementById('monster-form'),
  monsterSearchInput: document.getElementById('monster-search'),
  monsterCountInput: document.getElementById('monster-count'),
  monsterList: document.getElementById('monster-list'),

  // Combat Elements
  initiativeListElement: document.getElementById('initiative-list'),
  startCombatButton: document.getElementById('start-combat'),
  nextTurnButton: document.getElementById('next-turn'),
  turnInfoElement: document.getElementById('turn-info'),
  activeStatBlockElement: document.getElementById('active-stat-block'),

  // Combat Toolbar Elements
  combatToolbar: document.getElementById('combat-toolbar'),
  combatCounters: document.getElementById('combat-counters'),
  roundCounter: document.getElementById('round-counter'),
  turnCounter: document.getElementById('turn-counter'),
};
