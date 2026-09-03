// Combat system
const player = {
    maxHealth: 100,
    currentHealth: 100,
    shield: 0,
    baseAttack: 15,
    ultimateCharge: 0,
    maxUltimateCharge: 100
};

const enemy = {
    maxHealth: 50,
    currentHealth: 50,
    attackDamage: 10
};

// Game statistics
let gameStats = {
    roomsCleared: 0,
    pairsMatched: 0,
    totalDamageDealt: 0,
    totalDamageTaken: 0
};

// Rune effects configuration
const runeEffects = {
    [CardTypes.SWORD]: {
        name: 'Espada',
        damage: 15,
        description: 'Inflige daño al enemigo'
    },
    [CardTypes.SHIELD]: {
        name: 'Escudo',
        shield: 10,
        description: 'Aumenta el escudo del jugador'
    },
    [CardTypes.POTION]: {
        name: 'Poción',
        healing: 15,
        description: 'Cura al jugador'
    },
    [CardTypes.TRAP]: {
        name: 'Trampa',
        damage: 10,
        description: 'Inflige daño al jugador'
    },
    [CardTypes.ULTIMATE]: {
        name: 'Carga Suprema',
        charge: 25,
        description: 'Carga la habilidad especial'
    }
};

/**
 * Initialize combat system
 */
function initializeCombat() {
    console.log('Initializing combat system...');
    player.currentHealth = player.maxHealth;
    player.shield = 0;
    player.ultimateCharge = 0;
    
    enemy.currentHealth = enemy.maxHealth;
    
    updateCombatUI();
    console.log('Combat system initialized');
}

/**
 * Reset player for new game
 */
function resetPlayer() {
    player.maxHealth = 100;
    player.currentHealth = 100;
    player.shield = 0;
    player.baseAttack = 15;
    player.ultimateCharge = 0;
    
    gameStats = {
        roomsCleared: 0,
        pairsMatched: 0,
        totalDamageDealt: 0,
        totalDamageTaken: 0
    };
}

/**
 * Create new enemy with scaling difficulty
 * @param {number} roomLevel - Current room level
 */
function createEnemy(roomLevel) {
    const scalingFactor = 1 + (roomLevel - 1) * 0.15;
    
    enemy.maxHealth = Math.floor(50 * scalingFactor);
    enemy.currentHealth = enemy.maxHealth;
    enemy.attackDamage = Math.floor(10 * scalingFactor);
    
    updateCombatUI();
}

/**
 * Resolve rune effect when player matches cards
 * @param {string} cardType - Type of matched rune
 */
function resolveRuneEffect(cardType) {
    const effect = runeEffects[cardType];
    if (!effect) return;
    
    gameStats.pairsMatched++;
    
    // Apply relic bonuses if available
    let modifiedEffect = { ...effect };
    if (typeof applyRelicBonuses === 'function') {
        modifiedEffect = applyRelicBonuses(cardType, effect);
    }
    
    switch (cardType) {
        case CardTypes.SWORD:
            // Deal damage to enemy
            const totalDamage = player.baseAttack + modifiedEffect.damage;
            dealDamageToEnemy(totalDamage);
            showFloatingText(`-${totalDamage}`, 'damage');
            break;
            
        case CardTypes.SHIELD:
            // Add shield to player
            addShield(modifiedEffect.shield);
            showFloatingText(`+${modifiedEffect.shield} Escudo`, 'shield');
            break;
            
        case CardTypes.POTION:
            // Heal player
            healPlayer(modifiedEffect.healing);
            showFloatingText(`+${modifiedEffect.healing} HP`, 'heal');
            break;
            
        case CardTypes.TRAP:
            // Deal damage to player
            takeDamage(modifiedEffect.damage);
            showFloatingText(`-${modifiedEffect.damage}`, 'trap');
            break;
            
        case CardTypes.ULTIMATE:
            // Charge ultimate
            chargeUltimate(modifiedEffect.charge);
            showFloatingText(`+${modifiedEffect.charge} Carga`, 'ultimate');
            break;
    }
    
    updateCombatUI();
    
    // Check combat end after a short delay
    setTimeout(() => {
        checkCombatEnd();
    }, 300);
}

/**
 * Deal damage to enemy
 * @param {number} damage - Amount of damage
 */
function dealDamageToEnemy(damage) {
    enemy.currentHealth = Math.max(0, enemy.currentHealth - damage);
    gameStats.totalDamageDealt += damage;
    
    // Play damage sound
    playAttackSound();
    
    // Screen shake effect
    triggerScreenShake();
}

/**
 * Add shield to player
 * @param {number} amount - Amount of shield to add
 */
function addShield(amount) {
    player.shield += amount;
    
    // Play shield sound
    if (typeof playShieldSound === 'function') {
        playShieldSound();
    }
}

/**
 * Heal player
 * @param {number} amount - Amount to heal
 */
function healPlayer(amount) {
    const oldHealth = player.currentHealth;
    player.currentHealth = Math.min(player.maxHealth, player.currentHealth + amount);
    const actualHealing = player.currentHealth - oldHealth;
    
    // Warrior class bonus: excess healing becomes shield
    if (currentHeroClass === 'warrior' && actualHealing < amount) {
        const excessHealing = amount - actualHealing;
        player.shield += excessHealing;
        showFloatingText(`+${excessHealing} Escudo (Bono)`, 'shield');
    }
    
    // Play heal sound
    if (typeof playHealSound === 'function') {
        playHealSound();
    }
}

/**
 * Deal damage to player
 * @param {number} damage - Amount of damage
 */
function takeDamage(damage) {
    let remainingDamage = damage;
    
    // First deduct from shield
    if (player.shield > 0) {
        if (player.shield >= remainingDamage) {
            player.shield -= remainingDamage;
            remainingDamage = 0;
        } else {
            remainingDamage -= player.shield;
            player.shield = 0;
        }
    }
    
    // Then deduct from health
    if (remainingDamage > 0) {
        player.currentHealth = Math.max(0, player.currentHealth - remainingDamage);
        gameStats.totalDamageTaken += remainingDamage;
        
        // Haptic feedback
        if (typeof hapticFeedback === 'function') {
            hapticFeedback('damage');
        }
        
        // Screen shake
        triggerScreenShake();
        
        // Play damage sound
    }
    
    // Play damage sound
    if (typeof playDamageSound === 'function') {
        playDamageSound();
    }
}

/**
 * Charge ultimate ability
 * @param {number} amount - Amount of charge to add
 */
function chargeUltimate(amount) {
    player.ultimateCharge = Math.min(player.maxUltimateCharge, player.ultimateCharge + amount);
    
    // Update ability button state
    updateAbilityButton();
    
    // Play charge sound
    if (typeof playChargeSound === 'function') {
        playChargeSound();
    }
}

/**
 * Enemy attack turn
 */
function enemyAttack() {
    if (getCurrentState() !== GameState.ENEMY_TURN) return;
    
    setTimeout(() => {
        // Check if player is still alive
        if (player.currentHealth <= 0) {
            setState(GameState.GAME_OVER);
            showGameOverModal();
            return;
        }
        
        // Enemy attacks
        takeDamage(enemy.attackDamage);
        showFloatingText(`-${enemy.attackDamage}`, 'enemy-attack');
        
        updateCombatUI();
        
        // Check if player died
        if (player.currentHealth <= 0) {
            setState(GameState.GAME_OVER);
            showGameOverModal();
        } else {
            // Return control to player
            setState(GameState.PLAYER_TURN_IDLE);
        }
    }, 600);
}

/**
 * Check if combat has ended
 */
function checkCombatEnd() {
    if (enemy.currentHealth <= 0) {
        // Enemy defeated
        console.log('Enemy defeated!');
        setState(GameState.VICTORY);
        handleRoomComplete();
    } else if (player.currentHealth <= 0) {
        // Player defeated
        console.log('Player defeated!');
        setState(GameState.GAME_OVER);
        showGameOverModal();
    } else {
        // Combat continues, ensure we're in idle state
        if (getCurrentState() === GameState.RESOLVING_EFFECT) {
            setState(GameState.PLAYER_TURN_IDLE);
        }
    }
}

/**
 * Update combat UI elements
 */
function updateCombatUI() {
    console.log('Updating combat UI...');
    
    // Player health
    const playerHealthPercent = (player.currentHealth / player.maxHealth) * 100;
    const playerHealthFill = document.getElementById('player-health-fill');
    const playerHealthText = document.getElementById('player-health-text');
    
    if (playerHealthFill) {
        playerHealthFill.style.width = `${playerHealthPercent}%`;
    }
    if (playerHealthText) {
        playerHealthText.textContent = `${player.currentHealth}/${player.maxHealth}`;
    }
    
    // Player shield
    const playerShieldPercent = Math.min(100, (player.shield / player.maxHealth) * 100);
    const playerShieldFill = document.getElementById('player-shield-fill');
    const playerShieldText = document.getElementById('player-shield-text');
    
    if (playerShieldFill) {
        playerShieldFill.style.width = `${playerShieldPercent}%`;
    }
    if (playerShieldText) {
        playerShieldText.textContent = player.shield;
    }
    
    // Enemy health
    const enemyHealthPercent = (enemy.currentHealth / enemy.maxHealth) * 100;
    const enemyHealthFill = document.getElementById('enemy-health-fill');
    const enemyHealthText = document.getElementById('enemy-health-text');
    
    if (enemyHealthFill) {
        enemyHealthFill.style.width = `${enemyHealthPercent}%`;
    }
    if (enemyHealthText) {
        enemyHealthText.textContent = `${enemy.currentHealth}/${enemy.maxHealth}`;
    }
    
    // Update ability button
    updateAbilityButton();
    
    console.log('Combat UI updated');
}

/**
 * Update ability button state
 */
function updateAbilityButton() {
    const abilityBtn = document.getElementById('hero-ability-btn');
    if (player.ultimateCharge >= player.maxUltimateCharge) {
        abilityBtn.classList.add('ready');
        abilityBtn.disabled = false;
    } else {
        abilityBtn.classList.remove('ready');
        abilityBtn.disabled = true;
    }
}

/**
 * Handle room completion
 */
function handleRoomComplete() {
    gameStats.roomsCleared++;
    if (typeof showRoomModal === 'function') {
        showRoomModal();
    } else {
        // Fallback if dungeon.js isn't loaded yet
        setTimeout(() => {
            if (typeof advanceRoom === 'function') {
                advanceRoom();
            }
        }, 1000);
    }
}

/**
 * Show floating text effect
 * @param {string} text - Text to display
 * @param {string} type - Type of effect (damage, heal, shield, etc.)
 */
function showFloatingText(text, type) {
    const floatingText = document.createElement('div');
    floatingText.className = `floating-text ${type}`;
    floatingText.textContent = text;
    
    // Position randomly in the center area
    const randomX = Math.random() * 40 - 20; // -20 to 20
    const randomY = Math.random() * 40 - 20; // -20 to 20
    
    floatingText.style.left = `calc(50% + ${randomX}px)`;
    floatingText.style.top = `calc(50% + ${randomY}px)`;
    
    document.getElementById('game-container').appendChild(floatingText);
    
    // Remove after animation
    setTimeout(() => {
        floatingText.remove();
    }, 1000);
}

/**
 * Trigger screen shake effect
 */
function triggerScreenShake() {
    const gameContainer = document.getElementById('game-container');
    gameContainer.classList.add('shake');
    
    setTimeout(() => {
        gameContainer.classList.remove('shake');
    }, 500);
}

/**
 * Show game over modal
 */
function showGameOverModal() {
    document.getElementById('final-rooms').textContent = gameStats.roomsCleared;
    document.getElementById('final-pairs').textContent = gameStats.pairsMatched;
    document.getElementById('final-damage').textContent = gameStats.totalDamageDealt;
    
    document.getElementById('modal-overlay').classList.remove('hidden');
    document.getElementById('game-over-modal').classList.remove('hidden');
}

/**
 * Show victory modal
 */
function showVictoryModal() {
    document.getElementById('victory-rooms').textContent = gameStats.roomsCleared;
    document.getElementById('victory-pairs').textContent = gameStats.pairsMatched;
    document.getElementById('victory-damage').textContent = gameStats.totalDamageDealt;
    
    document.getElementById('modal-overlay').classList.remove('hidden');
    document.getElementById('victory-modal').classList.remove('hidden');
}

/**
 * Hide all modals
 */
function hideModals() {
    document.getElementById('modal-overlay').classList.add('hidden');
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.add('hidden');
    });
}

// Sound functions (will be implemented in juiciness.js)
function playAttackSound() {
    // Placeholder
}

function playShieldSound() {
    // Placeholder
}

function playHealSound() {
    // Placeholder
}

function playDamageSound() {
    // Placeholder
}

function playChargeSound() {
    // Placeholder
}