// Card types and their properties
const CardTypes = {
    SWORD: 'sword',
    SHIELD: 'shield',
    POTION: 'potion',
    TRAP: 'trap',
    ULTIMATE: 'ultimate'
};

// Card icons for display
const CardIcons = {
    [CardTypes.SWORD]: '⚔️',
    [CardTypes.SHIELD]: '🛡️',
    [CardTypes.POTION]: '🧪',
    [CardTypes.TRAP]: '💀',
    [CardTypes.ULTIMATE]: '⚡'
};

// Game board state
let cards = [];
let flippedCards = [];
let matchedPairs = 0;
let totalPairs = 8;

/**
 * Generate a deck of 16 cards (8 pairs) with specified types
 * @returns {Array} Array of card objects
 */
function generateDeck() {
    const deck = [];
    
    // Create pairs of each type
    const typeDistribution = [
        CardTypes.SWORD, CardTypes.SWORD,
        CardTypes.SWORD, CardTypes.SWORD,
        CardTypes.SHIELD, CardTypes.SHIELD,
        CardTypes.POTION, CardTypes.POTION,
        CardTypes.TRAP, CardTypes.TRAP,
        CardTypes.TRAP, CardTypes.TRAP,
        CardTypes.ULTIMATE, CardTypes.ULTIMATE,
        CardTypes.ULTIMATE, CardTypes.ULTIMATE
    ];
    
    typeDistribution.forEach((type, index) => {
        deck.push({
            id: index,
            type: type,
            icon: CardIcons[type],
            isFlipped: false,
            isMatched: false
        });
    });
    
    return deck;
}

/**
 * Shuffle array using Fisher-Yates algorithm
 * @param {Array} array - Array to shuffle
 * @returns {Array} Shuffled array
 */
function fisherYatesShuffle(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/**
 * Initialize the game board
 */
function initializeBoard() {
    const board = document.getElementById('board');
    if (!board) {
        console.error('Board element not found!');
        return;
    }
    
    console.log('Initializing board...');
    board.innerHTML = '';
    
    // Generate and shuffle deck
    cards = fisherYatesShuffle(generateDeck());
    flippedCards = [];
    matchedPairs = 0;
    
    console.log('Generated deck with', cards.length, 'cards');
    console.log('Card types:', cards.map(c => c.type));
    
    // Create card elements
    cards.forEach((card, index) => {
        console.log(`Creating card ${index}: type=${card.type}, icon=${card.icon}`);
        const cardElement = createCardElement(card);
        board.appendChild(cardElement);
    });
    
    console.log('Board initialized with', board.children.length, 'card elements');
    
    // Force board to be visible
    board.style.display = 'grid';
    board.style.visibility = 'visible';
}

/**
 * Create a card DOM element
 * @param {Object} card - Card data object
 * @returns {HTMLElement} Card element
 */
function createCardElement(card) {
    const cardElement = document.createElement('div');
    cardElement.className = 'card';
    cardElement.dataset.id = card.id;
    cardElement.dataset.type = card.type;
    
    // Create card faces
    const cardBack = document.createElement('div');
    cardBack.className = 'card-face card-back';
    
    const cardFront = document.createElement('div');
    cardFront.className = 'card-face card-front';
    cardFront.textContent = card.icon;
    
    cardElement.appendChild(cardBack);
    cardElement.appendChild(cardFront);
    
    // Add touch/click event listener
    cardElement.addEventListener('click', handleCardClick);
    cardElement.addEventListener('touchstart', handleCardTouch, { passive: true });
    
    return cardElement;
}

/**
 * Handle card click event
 * @param {Event} event - Click event
 */
function handleCardClick(event) {
    event.preventDefault();
    const cardElement = event.currentTarget;
    processCardInteraction(cardElement);
}

/**
 * Handle card touch event
 * @param {Event} event - Touch event
 */
function handleCardTouch(event) {
    event.preventDefault();
    const cardElement = event.currentTarget;
    processCardInteraction(cardElement);
}

/**
 * Process card interaction
 * @param {HTMLElement} cardElement - Card element
 */
function processCardInteraction(cardElement) {
    // Check if player can interact with cards
    if (!canInteractWithCards()) {
        console.log('Cannot interact with cards, current state:', getCurrentState());
        return;
    }
    
    const cardId = parseInt(cardElement.dataset.id);
    const card = cards[cardId];
    
    if (!card) {
        console.error('Card not found with ID:', cardId);
        return;
    }
    
    // Ignore if card is already flipped or matched
    if (card.isFlipped || card.isMatched) {
        console.log('Card already flipped or matched');
        return;
    }
    
    // Haptic feedback
    if (typeof hapticFeedback === 'function') {
        hapticFeedback('cardFlip');
    }
    
    // Flip the card
    flipCard(cardElement, card);
}

/**
 * Flip a card
 * @param {HTMLElement} cardElement - Card element
 * @param {Object} card - Card data object
 */
function flipCard(cardElement, card) {
    card.isFlipped = true;
    cardElement.classList.add('flipped');
    
    flippedCards.push({ element: cardElement, data: card });
    
    console.log('Card flipped, total flipped:', flippedCards.length);
    
    // Play card flip sound
    if (typeof playCardFlipSound === 'function') {
        playCardFlipSound();
    }
    
    // Update game state based on number of flipped cards
    if (flippedCards.length === 1) {
        setState(GameState.PLAYER_TURN_CARD1);
        console.log('State set to PLAYER_TURN_CARD1');
    } else if (flippedCards.length === 2) {
        setState(GameState.EVALUATING_MATCH);
        console.log('State set to EVALUATING_MATCH');
        // Disable all cards during evaluation
        disableAllCards();
        // Evaluate the match after a short delay
        setTimeout(evaluateMatch, 500);
    }
}

/**
 * Evaluate if the two flipped cards match
 */
function evaluateMatch() {
    const [card1, card2] = flippedCards;
    
    if (card1.data.type === card2.data.type) {
        // Match found
        handleMatch(card1, card2);
    } else {
        // No match
        handleMismatch(card1, card2);
    }
}

/**
 * Handle a successful match
 * @param {Object} card1 - First card
 * @param {Object} card2 - Second card
 */
function handleMatch(card1, card2) {
    card1.data.isMatched = true;
    card2.data.isMatched = true;
    card1.element.classList.add('matched');
    card2.element.classList.add('matched');
    
    matchedPairs++;
    
    // Haptic feedback for match
    if (typeof hapticFeedback === 'function') {
        hapticFeedback('match');
    }
    
    // Play match sound
    if (typeof playMatchSound === 'function') {
        playMatchSound();
    }
    
    // Dispatch match event for combat system
    dispatchMatchEvent(card1.data.type);
    
    // Reset flipped cards
    flippedCards = [];
    
    // Enable cards again
    enableAllCards();
    
    // Return to idle state after a short delay
    setTimeout(() => {
        // Check if all pairs are matched
        if (matchedPairs === totalPairs) {
            dispatchAllMatchedEvent();
        } else {
            setState(GameState.PLAYER_TURN_IDLE);
        }
    }, 500);
}

/**
 * Handle a mismatch
 * @param {Object} card1 - First card
 * @param {Object} card2 - Second card
 */
function handleMismatch(card1, card2) {
    // Play mismatch sound
    if (typeof playMismatchSound === 'function') {
        playMismatchSound();
    }
    
    // Dispatch mismatch event (rogue dodge check happens in event handler)
    dispatchMismatchEvent();
    
    // Wait before flipping cards back
    setTimeout(() => {
        flipCardsBack(card1, card2);
    }, 800);
}

/**
 * Flip cards back after mismatch
 * @param {Object} card1 - First card
 * @param {Object} card2 - Second card
 */
function flipCardsBack(card1, card2) {
    card1.data.isFlipped = false;
    card2.data.isFlipped = false;
    card1.element.classList.remove('flipped');
    card2.element.classList.remove('flipped');
    
    flippedCards = [];
    
    // Enable cards again
    enableAllCards();
    
    // Return to idle state if not handled by combat system
    setTimeout(() => {
        if (getCurrentState() === GameState.EVALUATING_MATCH) {
            setState(GameState.PLAYER_TURN_IDLE);
        }
    }, 100);
}

/**
 * Disable all cards from interaction
 */
function disableAllCards() {
    const cardElements = document.querySelectorAll('.card');
    cardElements.forEach(card => {
        if (!card.classList.contains('matched')) {
            card.classList.add('disabled');
        }
    });
}

/**
 * Enable all cards for interaction
 */
function enableAllCards() {
    const cardElements = document.querySelectorAll('.card');
    cardElements.forEach(card => {
        card.classList.remove('disabled');
    });
}

/**
 * Dispatch match event for combat system
 * @param {string} cardType - Type of matched cards
 */
function dispatchMatchEvent(cardType) {
    const event = new CustomEvent('cardMatch', { 
        detail: { 
            cardType: cardType,
            cards: flippedCards.map(c => c.data)
        } 
    });
    document.dispatchEvent(event);
}

/**
 * Dispatch mismatch event
 */
function dispatchMismatchEvent() {
    const event = new CustomEvent('cardMismatch', { detail: {} });
    document.dispatchEvent(event);
}

/**
 * Dispatch all cards matched event
 */
function dispatchAllMatchedEvent() {
    const event = new CustomEvent('allCardsMatched', { detail: {} });
    document.dispatchEvent(event);
}

/**
 * Get current matched pairs count
 * @returns {number} Number of matched pairs
 */
function getMatchedPairs() {
    return matchedPairs;
}

/**
 * Reset the board
 */
function resetBoard() {
    initializeBoard();
}

// Sound functions (will be implemented in juiciness.js)
function playCardFlipSound() {
    // Placeholder - will be implemented in juiciness.js
}

function playMatchSound() {
    // Placeholder - will be implemented in juiciness.js
}

function playMismatchSound() {
    // Placeholder - will be implemented in juiciness.js
}