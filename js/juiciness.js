// Juiciness - Audio and Haptic Feedback
// Web Audio API for synthesized sounds

let audioContext = null;

/**
 * Initialize audio context (must be called after user interaction)
 */
function initAudio() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    // Resume audio context if suspended (required for some browsers)
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
}

/**
 * Create a simple beep sound
 * @param {number} frequency - Frequency in Hz
 * @param {number} duration - Duration in seconds
 * @param {number} volume - Volume (0-1)
 * @param {string} type - Wave type ('sine', 'square', 'sawtooth', 'triangle')
 */
function playBeep(frequency, duration, volume = 0.3, type = 'sine') {
    if (!audioContext) return;
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = type;
    
    gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
}

/**
 * Play card flip sound
 */
function playCardFlipSound() {
    if (!audioContext) return;
    
    // Whoosh sound using noise
    playNoise(0.1, 0.2);
}

/**
 * Play match success sound
 */
function playMatchSound() {
    if (!audioContext) return;
    
    // Happy ascending arpeggio
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, index) => {
        setTimeout(() => {
            playBeep(freq, 0.15, 0.2, 'sine');
        }, index * 50);
    });
}

/**
 * Play mismatch sound
 */
function playMismatchSound() {
    if (!audioContext) return;
    
    // Sad descending tone
    playBeep(200, 0.3, 0.2, 'sawtooth');
    setTimeout(() => {
        playBeep(150, 0.3, 0.15, 'sawtooth');
    }, 100);
}

/**
 * Play attack sound
 */
function playAttackSound() {
    if (!audioContext) return;
    
    // Sharp impact sound
    playBeep(150, 0.1, 0.3, 'square');
    setTimeout(() => {
        playNoise(0.15, 0.3);
    }, 50);
}

/**
 * Play shield sound
 */
function playShieldSound() {
    if (!audioContext) return;
    
    // Metallic shield sound
    playBeep(800, 0.1, 0.2, 'triangle');
    setTimeout(() => {
        playBeep(600, 0.15, 0.15, 'triangle');
    }, 50);
}

/**
 * Play heal sound
 */
function playHealSound() {
    if (!audioContext) return;
    
    // Gentle ascending tone
    playBeep(400, 0.2, 0.2, 'sine');
    setTimeout(() => {
        playBeep(600, 0.3, 0.15, 'sine');
    }, 100);
}

/**
 * Play damage received sound
 */
function playDamageSound() {
    if (!audioContext) return;
    
    // Harsh impact
    playBeep(100, 0.2, 0.3, 'sawtooth');
    playNoise(0.2, 0.4);
}

/**
 * Play charge/ultimate sound
 */
function playChargeSound() {
    if (!audioContext) return;
    
    // Power-up sound
    playBeep(300, 0.1, 0.2, 'square');
    setTimeout(() => {
        playBeep(400, 0.1, 0.25, 'square');
    }, 100);
    setTimeout(() => {
        playBeep(600, 0.2, 0.3, 'square');
    }, 200);
}

/**
 * Play reveal sound (mage ability)
 */
function playRevealSound() {
    if (!audioContext) return;
    
    // Magical reveal sound
    playBeep(800, 0.1, 0.15, 'sine');
    setTimeout(() => {
        playBeep(1000, 0.15, 0.2, 'sine');
    }, 100);
}

/**
 * Play victory sound
 */
function playVictorySound() {
    if (!audioContext) return;
    
    // Victory fanfare
    const melody = [523.25, 659.25, 783.99, 1046.50, 783.99, 1046.50];
    melody.forEach((freq, index) => {
        setTimeout(() => {
            playBeep(freq, 0.2, 0.25, 'sine');
        }, index * 150);
    });
}

/**
 * Play game over sound
 */
function playGameOverSound() {
    if (!audioContext) return;
    
    // Sad descending melody
    const melody = [400, 350, 300, 250, 200];
    melody.forEach((freq, index) => {
        setTimeout(() => {
            playBeep(freq, 0.3, 0.2, 'sawtooth');
        }, index * 200);
    });
}

/**
 * Generate white noise
 * @param {number} duration - Duration in seconds
 * @param {number} volume - Volume (0-1)
 */
function playNoise(duration, volume = 0.2) {
    if (!audioContext) return;
    
    const bufferSize = audioContext.sampleRate * duration;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }
    
    const noise = audioContext.createBufferSource();
    noise.buffer = buffer;
    
    const gainNode = audioContext.createGain();
    gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    noise.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    noise.start();
}

/**
 * Enhanced haptic feedback
 * @param {string} type - Type of haptic feedback
 */
function hapticFeedback(type) {
    if (!navigator.vibrate) return;
    
    switch (type) {
        case 'cardFlip':
            navigator.vibrate(30);
            break;
        case 'match':
            navigator.vibrate([40, 40, 40]);
            break;
        case 'mismatch':
            navigator.vibrate([20, 30, 20]);
            break;
        case 'damage':
            navigator.vibrate(150);
            break;
        case 'heal':
            navigator.vibrate([50, 30, 50]);
            break;
        case 'shield':
            navigator.vibrate([30, 20, 30, 20, 30]);
            break;
        case 'ultimate':
            navigator.vibrate([100, 50, 100, 50, 100]);
            break;
        case 'victory':
            navigator.vibrate([200, 100, 200, 100, 200]);
            break;
        case 'gameOver':
            navigator.vibrate([300, 200, 300]);
            break;
        case 'dodge':
            navigator.vibrate([20, 10, 20]);
            break;
        default:
            navigator.vibrate(30);
    }
}

/**
 * Play sound based on card type
 * @param {string} cardType - Type of card
 */
function playCardSound(cardType) {
    initAudio();
    
    switch (cardType) {
        case CardTypes.SWORD:
            playAttackSound();
            hapticFeedback('match');
            break;
        case CardTypes.SHIELD:
            playShieldSound();
            hapticFeedback('shield');
            break;
        case CardTypes.POTION:
            playHealSound();
            hapticFeedback('heal');
            break;
        case CardTypes.TRAP:
            playDamageSound();
            hapticFeedback('damage');
            break;
        case CardTypes.ULTIMATE:
            playChargeSound();
            hapticFeedback('ultimate');
            break;
    }
}

/**
 * Initialize juiciness system
 */
function initJuiciness() {
    // Initialize audio on first user interaction
    document.addEventListener('click', initAudio, { once: true });
    document.addEventListener('touchstart', initAudio, { once: true });
}

// Override the placeholder functions in other modules
window.playCardFlipSound = playCardFlipSound;
window.playMatchSound = playMatchSound;
window.playMismatchSound = playMismatchSound;
window.playAttackSound = playAttackSound;
window.playShieldSound = playShieldSound;
window.playHealSound = playHealSound;
window.playDamageSound = playDamageSound;
window.playChargeSound = playChargeSound;
window.playRevealSound = playRevealSound;
window.playVictorySound = playVictorySound;
window.playGameOverSound = playGameOverSound;