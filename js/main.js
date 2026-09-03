// Main game controller
let currentTurn = 1;

/**
 * Initialize the game
 */
function initializeGame() {
    console.log('Initializing Rune Clash...');
    
    // Hide game container initially
    const gameContainer = document.getElementById('game-container');
    if (gameContainer) {
        gameContainer.classList.remove('visible');
    }
    
    // Initialize juiciness system
    if (typeof initJuiciness === 'function') {
        initJuiciness();
    }
    
    // Initialize hero selection
    if (typeof initializeHeroSelection === 'function') {
        initializeHeroSelection();
    }
    
    // Setup event listeners
    setupEventListeners();
    
    // Prevent mobile gestures
    preventMobileGestures();
    
    // Register service worker
    registerServiceWorker();
    
    console.log('Game initialized. Waiting for hero selection...');
}

/**
 * Start the game after hero selection
 */
function startGame() {
    console.log('Starting game with hero:', currentHeroClass);
    
    try {
        // Verify game container exists
        const gameContainer = document.getElementById('game-container');
        if (!gameContainer) {
            console.error('Game container not found!');
            return;
        }
        
        // Initialize dungeon
        if (typeof initializeDungeon === 'function') {
            initializeDungeon();
        } else {
            console.error('initializeDungeon function not found');
        }
        
        // Initialize combat
        if (typeof initializeCombat === 'function') {
            initializeCombat();
        } else {
            console.error('initializeCombat function not found');
        }
        
        // Create first enemy
        if (typeof createEnemy === 'function') {
            createEnemy(1);
        } else {
            console.error('createEnemy function not found');
        }
        
        // Initialize board
        if (typeof initializeBoard === 'function') {
            initializeBoard();
        } else {
            console.error('initializeBoard function not found');
        }
        
        // Verify board was created and make it visible
        const board = document.getElementById('board');
        if (board) {
            if (board.children.length === 0) {
                console.error('Board is empty after initialization!');
            } else {
                console.log('Board has', board.children.length, 'cards');
            }
            // Force board visibility
            board.style.display = 'grid';
            board.style.visibility = 'visible';
        } else {
            console.error('Board element not found after initialization');
        }
        
        // Ensure game container is visible
        if (gameContainer) {
            gameContainer.classList.add('visible');
            console.log('Game container visibility forced');
        }
        
        // Set initial state
        if (typeof resetState === 'function') {
            resetState();
        } else {
            console.error('resetState function not found');
        }
        
        // Update turn display
        updateTurnDisplay();
        
        console.log('Game started successfully!');
        console.log('Current state:', getCurrentState());
        console.log('Can interact with cards:', canInteractWithCards());
    } catch (error) {
        console.error('Error starting game:', error);
        console.error('Error stack:', error.stack);
    }
}

/**
 * Reset the entire game
 */
function resetGame() {
    console.log('Resetting game...');
    
    // Reset player
    if (typeof resetPlayer === 'function') {
        resetPlayer();
    }
    
    // Reset hero
    if (typeof resetHero === 'function') {
        resetHero();
    }
    
    // Reset dungeon
    if (typeof resetDungeon === 'function') {
        resetDungeon();
    }
    
    // Reset turn counter
    currentTurn = 1;
    
    // Hide all modals
    hideModals();
    
    // Hide game container
    document.getElementById('game-container').classList.remove('active');
    
    // Show hero selection modal
    document.getElementById('hero-selection-modal').style.display = 'flex';
    
    return true;
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Card match event
    document.addEventListener('cardMatch', (event) => {
        const { cardType } = event.detail;
        console.log('Cards matched:', cardType);
        
        // Apply rune effect
        if (typeof resolveRuneEffect === 'function') {
            resolveRuneEffect(cardType);
        }
        
        // Increment turn
        incrementTurn();
        
        // Return to idle state after effect resolution
        setTimeout(() => {
            if (getCurrentState() === GameState.RESOLVING_EFFECT) {
                setState(GameState.PLAYER_TURN_IDLE);
            }
        }, 500);
    });
    
    // Card mismatch event
    document.addEventListener('cardMismatch', () => {
        console.log('Cards mismatched');
        
        // Check if rogue dodges turn loss
        let skipEnemyTurn = false;
        if (typeof checkRogueDodge === 'function') {
            skipEnemyTurn = checkRogueDodge();
        }
        
        if (skipEnemyTurn) {
            // Rogue keeps turn
            setTimeout(() => {
                setState(GameState.PLAYER_TURN_IDLE);
            }, 800);
        } else {
            // Normal enemy turn
            setTimeout(() => {
                setState(GameState.ENEMY_TURN);
                if (typeof enemyAttack === 'function') {
                    enemyAttack();
                }
            }, 800);
        }
    });
    
    // All cards matched event
    document.addEventListener('allCardsMatched', () => {
        console.log('All cards matched in current room');
        // Room completion is handled by combat system
    });
    
    // State change event
    document.addEventListener('stateChange', (event) => {
        const { state } = event.detail;
        console.log('State changed to:', state);
        
        // Handle state-specific UI updates
        handleStateChange(state);
    });
    
    // Restart button (game over)
    const restartBtn = document.getElementById('restart-btn');
    if (restartBtn) {
        restartBtn.addEventListener('click', handleRestart);
    }
    
    // Restart button (victory)
    const victoryRestartBtn = document.getElementById('victory-restart-btn');
    if (victoryRestartBtn) {
        victoryRestartBtn.addEventListener('click', handleRestart);
    }
}

/**
 * Handle state changes
 * @param {string} state - New state
 */
function handleStateChange(state) {
    switch (state) {
        case GameState.PLAYER_TURN_IDLE:
            // Enable card interactions
            break;
        case GameState.ENEMY_TURN:
            // Disable card interactions
            break;
        case GameState.VICTORY:
            // Handle room victory
            break;
        case GameState.GAME_OVER:
            // Handle game over
            if (typeof playGameOverSound === 'function') {
                playGameOverSound();
            }
            if (typeof hapticFeedback === 'function') {
                hapticFeedback('gameOver');
            }
            break;
    }
}

/**
 * Increment turn counter
 */
function incrementTurn() {
    currentTurn++;
    updateTurnDisplay();
}

/**
 * Update turn display
 */
function updateTurnDisplay() {
    document.getElementById('turn-number').textContent = currentTurn;
}

/**
 * Handle game restart
 */
function handleRestart() {
    console.log('Restarting game...');
    
    // Play restart sound
    if (typeof playCardFlipSound === 'function') {
        playCardFlipSound();
    }
    
    // Hide all modals
    hideModals();
    
    // Reset player
    if (typeof resetPlayer === 'function') {
        resetPlayer();
    }
    
    // Reset dungeon
    if (typeof resetDungeon === 'function') {
        resetDungeon();
    }
    
    // Reset turn counter
    currentTurn = 1;
    
    // Keep current hero class
    const heroClass = currentHeroClass;
    
    // Apply hero bonuses again
    if (typeof applyHeroBonuses === 'function') {
        applyHeroBonuses();
    }
    
    // Show game container
    document.getElementById('game-container').classList.add('active');
    
    // Start game
    startGame();
}

/**
 * Prevent unwanted mobile gestures
 */
function preventMobileGestures() {
    // Prevent pull-to-refresh
    document.body.addEventListener('touchstart', (e) => {
        if (e.touches.length > 1) {
            e.preventDefault();
        }
    }, { passive: false });
    
    // Prevent context menu on long press
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });
    
    // Prevent double-tap zoom
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (e) => {
        const now = (new Date()).getTime();
        if (now - lastTouchEnd <= 300) {
            e.preventDefault();
        }
        lastTouchEnd = now;
    }, false);
    
    // Prevent scrolling
    document.body.addEventListener('touchmove', (e) => {
        if (e.target.closest('#board')) {
            e.preventDefault();
        }
    }, { passive: false });
}

/**
 * Register service worker for PWA
 */
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then((registration) => {
                    console.log('ServiceWorker registration successful:', registration.scope);
                })
                .catch((error) => {
                    console.log('ServiceWorker registration failed:', error);
                });
        });
    }
}

/**
 * Game initialization when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing game...');
    console.log('Game container exists:', !!document.getElementById('game-container'));
    console.log('Hero modal exists:', !!document.getElementById('hero-selection-modal'));
    console.log('Board exists:', !!document.getElementById('board'));
    
    // Small delay to ensure all scripts are loaded
    setTimeout(() => {
        try {
            initializeGame();
        } catch (error) {
            console.error('Error initializing game:', error);
        }
    }, 100);
});

// Make functions globally available
window.startGame = startGame;
window.handleRestart = handleRestart;