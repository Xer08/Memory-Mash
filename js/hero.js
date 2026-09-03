// Hero class system
let currentHeroClass = null;

// Hero class definitions
const heroClasses = {
    warrior: {
        name: 'Guerrero',
        icon: '⚔️',
        description: 'El exceso de curación se convierte en escudo',
        passiveEffect: 'excessHealingToShield'
    },
    mage: {
        name: 'Mago',
        icon: '🔮',
        description: 'Puede revelar cartas temporalmente',
        passiveEffect: 'cardReveal',
        abilityCost: 50,
        abilityName: 'Visión Arcana',
        abilityDescription: 'Revela 2 cartas aleatorias durante 1 segundo'
    },
    rogue: {
        name: 'Pícaro',
        icon: '🗡️',
        description: '25% de probabilidad de no perder turno al fallar',
        passiveEffect: 'turnRetention',
        dodgeChance: 0.25
    }
};

// Relics (passive bonuses)
let activeRelics = [];

const relicDefinitions = {
    fireRing: {
        name: 'Anillo de Fuego',
        description: '+5 daño extra con runas de espada',
        icon: '🔥',
        effect: 'swordDamageBonus',
        value: 5
    },
    spiritShield: {
        name: 'Escudo Espiritual',
        description: '+3 escudo extra con runas de escudo',
        icon: '🛡️',
        effect: 'shieldBonus',
        value: 3
    },
    lifeGem: {
        name: 'Gema de Vida',
        description: '+5 curación extra con pociones',
        icon: '💎',
        effect: 'healingBonus',
        value: 5
    },
    trapDisarm: {
        name: 'Desarmador de Trampas',
        description: '-50% daño de trampas',
        icon: '🔧',
        effect: 'trapDamageReduction',
        value: 0.5
    },
    chargeAmulet: {
        name: 'Amuleto de Carga',
        description: '+10 carga extra con runas supremas',
        icon: '⚡',
        effect: 'ultimateChargeBonus',
        value: 10
    },
    healthBoost: {
        name: 'Tomo de Vitalidad',
        description: '+20 vida máxima',
        icon: '📖',
        effect: 'maxHealthBonus',
        value: 20
    }
};

/**
 * Initialize hero selection
 */
function initializeHeroSelection() {
    const heroCards = document.querySelectorAll('.hero-card');
    heroCards.forEach(card => {
        card.addEventListener('click', () => {
            const heroClass = card.dataset.hero;
            console.log('Hero selected:', heroClass);
            selectHero(heroClass);
        });
    });
}

/**
 * Select a hero class
 * @param {string} heroClass - Hero class identifier
 */
function selectHero(heroClass) {
    console.log('=== HERO SELECTION START ===');
    
    if (!heroClasses[heroClass]) {
        console.error('Invalid hero class:', heroClass);
        return;
    }
    
    currentHeroClass = heroClass;
    console.log('Hero class set to:', currentHeroClass);
    
    // Apply hero-specific bonuses
    applyHeroBonuses();
    
    // Hide hero selection modal
    const heroModal = document.getElementById('hero-selection-modal');
    if (heroModal) {
        heroModal.style.display = 'none';
        console.log('Hero modal hidden');
    }
    
    // Show game container
    const gameContainer = document.getElementById('game-container');
    if (gameContainer) {
        gameContainer.classList.add('visible');
        console.log('Game container displayed and visible');
    } else {
        console.error('Game container not found');
    }
    
    // Small delay to ensure DOM updates
    setTimeout(() => {
        console.log('Starting game after delay...');
        try {
            if (typeof startGame === 'function') {
                startGame();
            } else {
                console.error('startGame function not found');
            }
        } catch (error) {
            console.error('Error starting game:', error);
        }
    }, 50);
    
    console.log('=== HERO SELECTION END ===');
}

/**
 * Apply hero-specific bonuses
 */
function applyHeroBonuses() {
    if (!currentHeroClass) return;
    
    const hero = heroClasses[currentHeroClass];
    if (!hero) return;
    
    switch (hero.passiveEffect) {
        case 'excessHealingToShield':
            // This is handled in combat.js healPlayer function
            break;
        case 'cardReveal':
            // Setup mage ability button
            setupMageAbility();
            break;
        case 'turnRetention':
            // This is handled in board.js handleMismatch function
            break;
    }
}

/**
 * Setup mage ability button
 */
function setupMageAbility() {
    const abilityBtn = document.getElementById('hero-ability-btn');
    if (abilityBtn) {
        // Remove any existing listeners to prevent duplicates
        const newBtn = abilityBtn.cloneNode(true);
        abilityBtn.parentNode.replaceChild(newBtn, abilityBtn);
        newBtn.addEventListener('click', useMageAbility);
    }
}

/**
 * Use mage ability to reveal cards
 */
function useMageAbility() {
    if (currentHeroClass !== 'mage') return;
    if (player.ultimateCharge < heroClasses.mage.abilityCost) return;
    
    // Deduct charge
    player.ultimateCharge -= heroClasses.mage.abilityCost;
    updateCombatUI();
    
    // Find 2 random unrevealed cards
    const unrevealedCards = Array.from(document.querySelectorAll('.card:not(.flipped):not(.matched)'));
    if (unrevealedCards.length < 2) return;
    
    // Randomly select 2 cards
    const shuffled = unrevealedCards.sort(() => Math.random() - 0.5);
    const cardsToReveal = shuffled.slice(0, 2);
    
    // Reveal cards temporarily
    cardsToReveal.forEach(card => {
        card.classList.add('temporarily-revealed');
        card.classList.add('flipped');
    });
    
    // Play reveal sound
    playRevealSound();
    
    // Hide after 1 second
    setTimeout(() => {
        cardsToReveal.forEach(card => {
            card.classList.remove('temporarily-revealed');
            card.classList.remove('flipped');
        });
    }, 1000);
}

/**
 * Check if rogue dodges turn loss
 * @returns {boolean} True if rogue dodges
 */
function checkRogueDodge() {
    if (currentHeroClass !== 'rogue') return false;
    
    const dodgeChance = heroClasses.rogue.dodgeChance;
    const roll = Math.random();
    
    if (roll < dodgeChance) {
        // Rogue dodged!
        showFloatingText('¡Esquivado!', 'dodge');
        if (typeof hapticFeedback === 'function') {
            hapticFeedback('dodge');
        }
        return true;
    }
    
    return false;
}

/**
 * Apply relic bonuses to rune effects
 * @param {string} cardType - Type of rune
 * @param {Object} effect - Original effect
 * @returns {Object} Modified effect
 */
function applyRelicBonuses(cardType, effect) {
    let modifiedEffect = { ...effect };
    
    activeRelics.forEach(relicKey => {
        const relic = relicDefinitions[relicKey];
        if (!relic) return;
        
        switch (relic.effect) {
            case 'swordDamageBonus':
                if (cardType === CardTypes.SWORD) {
                    modifiedEffect.damage = (modifiedEffect.damage || 0) + relic.value;
                }
                break;
            case 'shieldBonus':
                if (cardType === CardTypes.SHIELD) {
                    modifiedEffect.shield = (modifiedEffect.shield || 0) + relic.value;
                }
                break;
            case 'healingBonus':
                if (cardType === CardTypes.POTION) {
                    modifiedEffect.healing = (modifiedEffect.healing || 0) + relic.value;
                }
                break;
            case 'trapDamageReduction':
                if (cardType === CardTypes.TRAP) {
                    modifiedEffect.damage = Math.floor((modifiedEffect.damage || 0) * relic.value);
                }
                break;
            case 'ultimateChargeBonus':
                if (cardType === CardTypes.ULTIMATE) {
                    modifiedEffect.charge = (modifiedEffect.charge || 0) + relic.value;
                }
                break;
            case 'maxHealthBonus':
                player.maxHealth += relic.value;
                player.currentHealth += relic.value;
                break;
        }
    });
    
    return modifiedEffect;
}

/**
 * Add a relic to the player
 * @param {string} relicKey - Relic identifier
 */
function addRelic(relicKey) {
    if (!relicDefinitions[relicKey]) return;
    
    // Check if relic is already active
    if (activeRelics.includes(relicKey)) return;
    
    activeRelics.push(relicKey);
    
    // Apply immediate effects
    const relic = relicDefinitions[relicKey];
    if (relic.effect === 'maxHealthBonus') {
        player.maxHealth += relic.value;
        player.currentHealth += relic.value;
        updateCombatUI();
    }
    
    showFloatingText(`¡${relic.name} obtenido!`, 'relic');
}

/**
 * Get available relics for selection
 * @returns {Array} Array of available relic keys
 */
function getRandomRelics(count = 3) {
    const relicKeys = Object.keys(relicDefinitions);
    const availableRelics = relicKeys.filter(key => !activeRelics.includes(key));
    
    // Shuffle and pick
    const shuffled = availableRelics.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, availableRelics.length));
}

/**
 * Reset hero and relics
 */
function resetHero() {
    currentHeroClass = null;
    activeRelics = [];
}

/**
 * Get current hero class
 * @returns {string|null} Current hero class
 */
function getCurrentHeroClass() {
    return currentHeroClass;
}

/**
 * Get active relics
 * @returns {Array} Array of active relic keys
 */
function getActiveRelics() {
    return [...activeRelics];
}

// Sound function placeholder
function playRevealSound() {
    // Placeholder - will be implemented in juiciness.js
}

// Make functions globally available
window.selectHero = selectHero;
window.initializeHeroSelection = initializeHeroSelection;