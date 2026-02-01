# Clean Water Game

A web-based interactive game supporting [charity: water](https://www.charitywater.org)'s mission to provide clean water access. Players connect water sources, filters, and taps to deliver clean water while learning about global water challenges.

## 🎮 Game Mechanics

- **Tile Grid**: 4x4 grid of interactive tiles with randomized positions
- **Tile Types**:
  - **Source** (yellow jerry can): Starting point for water
  - **Filter**: Purification step
  - **Tap** (black jerry can): Clean water delivery point
  - **Empty**: Neutral tiles

- **Win Condition**: Click tiles in sequence: Source → Filter → Tap to deliver clean water and trigger celebration message

## 🚀 Quick Start

### Run Locally
```bash
python3 -m http.server 8000
# Open browser to http://localhost:8000
```

### Files
- `index.html` - Main game page structure
- `styles.css` - Game styling and responsive layout
- `game.js` - Game logic and tile interactions
- `assets/` - Game images (jerry cans, logo)

## 🎯 Game Features

- **Randomized tile layout** - Tiles shuffle each game for replayability
- **Visual feedback** - Tiles highlight on hover and click
- **Win celebration** - Impact statement highlights 771M people without clean water access
- **Responsive design** - Works on desktop and mobile (3x3 grid on smaller screens)
- **localStorage ready** - Game state can be persisted

## 📁 Project Structure

```
.
├── index.html              # HTML structure
├── styles.css              # Styling (gradient background, tile grid)
├── game.js                 # Game controller (WaterGame class)
├── assets/                 # Images
│   ├── jerry_can_yellow.png
│   ├── jerry_can_black.png
│   └── charitywater_logo_horizontal_BlackText.png
└── .github/
    └── copilot-instructions.md  # AI agent guidelines
```

## 🛠 Development

### Add New Tile Types
Edit the `tileTypes` array in `game.js` to add more special tiles (e.g., "pump", "well").

### Customize Win Condition
Modify the win logic in `handleTileClick()` or the `typeMap` object to change the required sequence.

### Styling
- Background gradient: Linear purple gradient (CSS `body`)
- Tile hover effect: Lift animation with shadow
- Active tile color: Blue (#667eea)
- Completed state: Green (#4caf50)

## 🤝 Contributing

Replace placeholder images with professional charity: water assets. Current images are functional placeholders.

## 📊 Future Enhancements

- [ ] Multiple difficulty levels
- [ ] Score tracking and leaderboard
- [ ] Sound effects
- [ ] Animation transitions
- [ ] Integration with charity: water donation flow
- [ ] Multi-language support
