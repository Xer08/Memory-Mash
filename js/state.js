// Game State Machine
const GameState = {
    PLAYER_TURN_IDLE: 'PLAYER_TURN_IDLE',
    PLAYER_TURN_CARD1: 'PLAYER_TURN_CARD1',
    EVALUATING_MATCH: 'EVALUATING_MATCH',
    RESOLVING_EFFECT: 'RESOLVING_EFFECT',
    ENEMY_TURN: 'ENEMY_TURN',
    VICTORY: 'VICTORY',
    GAME_OVER: 'GAME_OVER'
};

// Current game state
let currentState = GameState.PLAYER_TURN_IDLE;

// Valid state transitions
const validTransitions = {
    [GameState.PLAYER_TURN_IDLE]: [GameState.PLAYER_TURN_CARD1, GameState.VICTORY, GameState.GAME_OVER],
    [GameState.PLAYER_TURN_CARD1]: [GameState.EVALUATING_MATCH],
    [GameState.EVALUATING_MATCH]: [GameState.RESOLVING_EFFECT, GameState.ENEMY_TURN],
    [GameState.RESOLVING_EFFECT]: [GameState.PLAYER_TURN_IDLE, GameState.VICTORY, GameState.GAME_OVER],
    [GameState.ENEMY_TURN]: [GameState.PLAYER_TURN_IDLE, GameState.GAME_OVER],
    [GameState.VICTORY]: [GameState.PLAYER_TURN_IDLE], // For restart
    [GameState.GAME_OVER]: [GameState.PLAYER_TURN_IDLE] // For restart
};

/**
 * Get the current game state
 * @returns {string} Current state
 */
function getCurrentState() {
    return currentState;
}

/**
 * Check if a state transition is valid
 * @param {string} fromState - Current state
 * @param {string} toState - Target state
 * @returns {boolean} True if transition is valid
 */
function isValidTransition(fromState, toState) {
    const validNextStates = validTransitions[fromState];
    return validNextStates && validNextStates.includes(toState);
}

/**
 * Change the game state
 * @param {string} newState - New state to transition to
 * @returns {boolean} True if state change was successful
 */
function setState(newState) {
    if (isValidTransition(currentState, newState)) {
        console.log(`State transition: ${currentState} -> ${newState}`);
        currentState = newState;
        
        // Dispatch state change event
        dispatchStateChangeEvent(newState);
        
        return true;
    } else {
        console.error(`Invalid state transition: ${currentState} -> ${newState}`);
        console.log('Valid transitions from', currentState, ':', validTransitions[currentState]);
        return false;
    }
}

/**
 * Reset the game state to initial state
 */
function resetState() {
    currentState = GameState.PLAYER_TURN_IDLE;
    console.log('State reset to:', currentState);
    dispatchStateChangeEvent(currentState);
}

/**
 * Check if it's the player's turn (any player turn state)
 * @returns {boolean}
 */
function isPlayerTurn() {
    return currentState === GameState.PLAYER_TURN_IDLE || 
           currentState === GameState.PLAYER_TURN_CARD1;
}

/**
 * Check if player can interact with cards
 * @returns {boolean}
 */
function canInteractWithCards() {
    return currentState === GameState.PLAYER_TURN_IDLE || currentState === GameState.PLAYER_TURN_CARD1;
}

/**
 * Dispatch state change event for other modules to listen to
 * @param {string} newState 
 */
function dispatchStateChangeEvent(newState) {
    const event = new CustomEvent('stateChange', { detail: { state: newState } });
    document.dispatchEvent(event);
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        GameState,
        getCurrentState,
        setState,
        resetState,
        isPlayerTurn,
        canInteractWithCards
    };
}