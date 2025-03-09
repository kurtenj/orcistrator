// Application State
const state = {
  monsters: [],
  participants: [],
  currentTurnIndex: -1,
  combatStarted: false,
  monsterData: {},
  currentRound: 0,
  totalTurns: 0,
};

// State Getters
export const getState = () => state;
export const getMonsters = () => state.monsters;
export const getParticipants = () => state.participants;
export const getCurrentTurnIndex = () => state.currentTurnIndex;
export const getCombatStarted = () => state.combatStarted;
export const getMonsterData = () => state.monsterData;
export const getCurrentRound = () => state.currentRound;
export const getTotalTurns = () => state.totalTurns;
export const getCurrentParticipant = () => {
  if (state.currentTurnIndex >= 0 && state.currentTurnIndex < state.participants.length) {
    return state.participants[state.currentTurnIndex];
  }
  return null;
};

// Underscore-prefixed exports for linting purposes
export const _getCombatStarted = getCombatStarted;
export const _getCurrentRound = getCurrentRound;
export const _getTotalTurns = getTotalTurns;
export const _getMonsterData = getMonsterData;
export const _getCurrentTurnIndex = getCurrentTurnIndex;

// State Setters
export const setMonsters = monsters => {
  if (!Array.isArray(monsters)) {
    console.error('setMonsters: Expected an array, got', typeof monsters);
    return;
  }
  state.monsters = monsters;
};

export const setParticipants = participants => {
  console.info('setParticipants called with:', participants);
  if (!Array.isArray(participants)) {
    console.error('setParticipants: Expected an array, got', typeof participants);
    return;
  }
  state.participants = participants;
  console.info('state.participants updated to:', state.participants);
};

export const setCurrentTurnIndex = index => {
  if (typeof index !== 'number' || index < -1) {
    console.error('setCurrentTurnIndex: Expected a non-negative number or -1, got', index);
    return;
  }

  // Ensure the index is within bounds
  if (index >= state.participants.length) {
    console.warn(
      `setCurrentTurnIndex: Index ${index} is out of bounds, clamping to ${state.participants.length - 1}`
    );
    index = Math.max(-1, state.participants.length - 1);
  }

  state.currentTurnIndex = index;
};

export const setCombatStarted = started => {
  if (typeof started !== 'boolean') {
    console.error('setCombatStarted: Expected a boolean, got', typeof started);
    return;
  }
  state.combatStarted = started;
};

export const addMonsterData = (monsterIndex, data) => {
  if (!monsterIndex || typeof monsterIndex !== 'string') {
    console.error('addMonsterData: Invalid monster index', monsterIndex);
    return;
  }

  if (!data || typeof data !== 'object') {
    console.error('addMonsterData: Invalid monster data', data);
    return;
  }

  state.monsterData[monsterIndex] = data;
};

export const addParticipant = participant => {
  if (!participant || typeof participant !== 'object') {
    console.error('addParticipant: Invalid participant', participant);
    return;
  }

  if (!participant.id) {
    console.error('addParticipant: Participant missing ID', participant);
    return;
  }

  // Check for duplicate IDs
  if (state.participants.some(p => p.id === participant.id)) {
    console.error('addParticipant: Participant with ID already exists', participant.id);
    return;
  }

  state.participants.push(participant);
};

export const updateParticipant = (id, updates) => {
  // console.log('Updating participant:', id, 'with updates:', updates);

  if (!id) {
    console.error('updateParticipant: Missing ID');
    return;
  }

  if (!updates || typeof updates !== 'object') {
    console.error('updateParticipant: Invalid updates', updates);
    return;
  }

  const index = state.participants.findIndex(p => p.id === id);
  // console.log('Participant index:', index);

  if (index !== -1) {
    // console.log('Participant before update:', state.participants[index]);
    state.participants[index] = { ...state.participants[index], ...updates };
    // console.log('Participant after update:', state.participants[index]);
  } else {
    console.error('Participant not found with ID:', id);
  }
};

export const removeParticipant = id => {
  if (!id) {
    console.error('removeParticipant: Missing ID');
    return;
  }

  const index = state.participants.findIndex(p => p.id === id);

  if (index !== -1) {
    state.participants.splice(index, 1);

    // Adjust current turn index if needed
    if (state.currentTurnIndex >= state.participants.length) {
      state.currentTurnIndex = state.participants.length - 1;
    }
  } else {
    console.error('removeParticipant: Participant not found with ID:', id);
  }
};

export const sortParticipantsByInitiative = () => {
  state.participants.sort((a, b) => b.initiative - a.initiative);
};

export const setCurrentRound = round => {
  if (typeof round !== 'number' || round < 0) {
    console.error('setCurrentRound: Expected a non-negative number, got', round);
    return;
  }
  state.currentRound = round;
};

export const incrementCurrentRound = () => {
  state.currentRound++;
  return state.currentRound;
};

export const setTotalTurns = turns => {
  if (typeof turns !== 'number' || turns < 0) {
    console.error('setTotalTurns: Expected a non-negative number, got', turns);
    return;
  }
  state.totalTurns = turns;
};

export const incrementTotalTurns = () => {
  state.totalTurns++;
  return state.totalTurns;
};
