# Rune Clash - Memory Tactics

A complete memory-based combat RPG game with neon cyber-fantasy aesthetics, built as a Progressive Web App (PWA).

## 🎮 Game Features

### Core Gameplay
- **Memory Combat**: Match pairs of runes to trigger combat effects
- **RPG Elements**: Health, shield, and special abilities
- **Hero Classes**: Choose between Warrior, Mage, or Rogue with unique abilities
- **Roguelite Progression**: 10 dungeon rooms with scaling difficulty
- **Relic System**: Collect passive bonuses between rooms

### Rune Types
- ⚔️ **Sword**: Deal damage to enemies
- 🛡️ **Shield**: Increase player defense
- 🧪 **Potion**: Heal the player
- 💀 **Trap**: Deal damage to the player
- ⚡ **Ultimate**: Charge special abilities

### Hero Classes
- **Warrior**: Excess healing converts to shield
- **Mage**: Can reveal cards temporarily using mana
- **Rogue**: 25% chance to keep turn after mismatch

### Technical Features
- 📱 **Mobile-First**: Optimized for touch interfaces
- 🎨 **Neon OLED Aesthetics**: Dark theme optimized for OLED screens
- 🔊 **Synthesized Audio**: Web Audio API sound effects (no external files)
- 📳 **Haptic Feedback**: Vibration API integration
- 🌐 **PWA Support**: Installable on iOS and Android
- 💾 **Offline Mode**: Service Worker for 100% offline play
- ⚡ **60 FPS**: GPU-accelerated animations

## 📁 Project Structure

```
Memory Mash/
├── index.html              # Main HTML container
├── manifest.json           # PWA manifest
├── sw.js                   # Service Worker for offline mode
├── css/
│   ├── theme.css          # Neon OLED theme variables
│   ├── board.css          # 3D card grid and HUD
│   └── effects.css        # Visual effects and modals
├── js/
│   ├── state.js           # Game state machine
│   ├── board.js           # Card logic and interaction
│   ├── combat.js          # Combat system and rune effects
│   ├── hero.js            # Hero classes and relics
│   ├── dungeon.js         # Roguelite progression
│   ├── juiciness.js       # Audio and haptic feedback
│   └── main.js            # Game controller
├── icon-192.png           # PWA icon (192x192)
└── icon-512.png           # PWA icon (512x512)
```

## 🚀 How to Run

### Local Development
1. Open `index.html` in a modern web browser
2. For PWA testing, use a local server:
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Node.js (with http-server)
   npx http-server
   ```
3. Access at `http://localhost:8000`

### Mobile Testing
1. Ensure your device and computer are on the same network
2. Run a local server as above
3. Access via your device's browser using your computer's IP address
4. For PWA installation, use Chrome (Android) or Safari (iOS)

## 🎯 Game Controls

### Touch/Mouse
- **Tap card**: Flip card to reveal rune
- **Match pairs**: Trigger combat effects
- **Hero ability**: Tap the ability button when charged (Mage only)

### Game Flow
1. Select your hero class
2. Match rune pairs to attack enemies and survive
3. Clear all 8 pairs to defeat the current enemy
4. Choose relics between rooms
5. Progress through 10 increasingly difficult rooms
6. Victory: Complete all rooms / Game Over: Health reaches 0

## 🔧 Configuration

### Difficulty Scaling
- Enemy health and damage increase by 15% per room
- Player heals 20% of max health between rooms

### Audio Settings
- Audio initializes on first user interaction (browser requirement)
- All sounds are synthesized using Web Audio API
- Haptic feedback can be toggled per device capability

## 📱 PWA Installation

### Android (Chrome)
1. Open the game in Chrome
2. Tap the menu (⋮)
3. Select "Add to Home Screen"

### iOS (Safari)
1. Open the game in Safari
2. Tap the share button (↑)
3. Select "Add to Home Screen"

## 🛠️ Customization

### Adding New Runes
Edit `js/board.js` and `js/combat.js` to add new card types and effects.

### Hero Classes
Modify `js/hero.js` to add new hero classes with unique abilities.

### Relics
Add new relics in `js/hero.js` `relicDefinitions` object.

### Visual Theme
Customize colors in `css/theme.css` under the `:root` variables.

## 🐛 Known Issues

- Icon files are placeholders (replace with actual PNG images)
- Audio context requires user interaction to initialize
- Some browsers may limit haptic feedback

## 📄 License

This project is created for educational purposes.

## 🎨 Credits

Developed as a complete web game implementation demonstrating:
- Modern JavaScript game architecture
- PWA development
- Mobile-first responsive design
- Web Audio API and haptic feedback
- State machine pattern for game logic