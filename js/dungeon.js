// Dungeon progression system
let currentRoom = 1;
const maxRooms = 10; // Total rooms in the dungeon
let isDungeonComplete = false;

/**
 * Initialize dungeon system
 */
function initializeDungeon() {
    currentRoom = 1;
    isDungeonComplete = false;
    updateRoomDisplay();
}

/**
 * Advance to the next room
 */
function advanceRoom() {
    if (currentRoom >= maxRooms) {
        // Dungeon complete
        isDungeonComplete = true;
        showVictoryModal();
        if (typeof playVictorySound === 'function') {
            playVictorySound();
        }
        if (typeof hapticFeedback === 'function') {
            hapticFeedback('victory');
        }
        return;
    }
    
    currentRoom++;
    updateRoomDisplay();
    
    // Create new enemy with increased difficulty
    createEnemy(currentRoom);
    
    // Reset board for new room
    resetBoard();
    
    // Reset game state
    setState(GameState.PLAYER_TURN_IDLE);
    
    // Partial healing between rooms
    healBetweenRooms();
}

/**
 * Heal player between rooms
 */
function healBetweenRooms() {
    const healAmount = Math.floor(player.maxHealth * 0.2); // 20% heal
    player.currentHealth = Math.min(player.maxHealth, player.currentHealth + healAmount);
    updateCombatUI();
}

/**
 * Update room display
 */
function updateRoomDisplay() {
    document.getElementById('room-number').textContent = currentRoom;
}

/**
 * Show room completion modal with relic selection
 */
function showRoomModal() {
    const relicsContainer = document.getElementById('relics-container');
    relicsContainer.innerHTML = '';
    
    // Get random relics
    const availableRelics = getRandomRelics(3);
    
    if (availableRelics.length === 0) {
        // No more relics available, just advance
        setTimeout(() => {
            hideModals();
            advanceRoom();
        }, 1000);
        return;
    }
    
    // Create relic cards
    availableRelics.forEach(relicKey => {
        const relic = relicDefinitions[relicKey];
        const relicCard = document.createElement('div');
        relicCard.className = 'relic-card';
        relicCard.dataset.relic = relicKey;
        
        relicCard.innerHTML = `
            <div class="relic-icon">${relic.icon}</div>
            <div class="relic-info">
                <div class="relic-name">${relic.name}</div>
                <div class="relic-description">${relic.description}</div>
            </div>
        `;
        
        relicCard.addEventListener('click', () => {
            selectRelic(relicKey);
        });
        
        relicsContainer.appendChild(relicCard);
    });
    
    // Show modal
    document.getElementById('modal-overlay').classList.remove('hidden');
    document.getElementById('room-modal').classList.remove('hidden');
}

/**
 * Select a relic
 * @param {string} relicKey - Relic identifier
 */
function selectRelic(relicKey) {
    addRelic(relicKey);
    
    // Hide modal and advance to next room
    hideModals();
    setTimeout(() => {
        advanceRoom();
    }, 500);
}

/**
 * Get current room number
 * @returns {number} Current room
 */
function getCurrentRoom() {
    return currentRoom;
}

/**
 * Check if dungeon is complete
 * @returns {boolean} True if dungeon is complete
 */
function getIsDungeonComplete() {
    return isDungeonComplete;
}

/**
 * Reset dungeon for new game
 */
function resetDungeon() {
    currentRoom = 1;
    isDungeonComplete = false;
    updateRoomDisplay();
}