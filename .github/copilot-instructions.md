# Copilot Instructions for My-website

## Project Overview
This is a web-based game supporting charity: water's mission to provide clean water access. The game uses interactive tiles to educate users about water sources, filters, and taps while encouraging donations.

## Architecture
- **Frontend-only project**: Single-page application with vanilla JavaScript
- **Asset-driven**: Uses images (`charitywater_logo_horizontal_BlackText.png`, `jerry_can_yellow.png`, `jerry_can_black.png`)
- **Tile-based game system**: Grid of interactive tiles with special types (source, filter, tap)
- **Mission-aligned UX**: Gamification leads to clean water delivery messaging and charity: water information

## Key Code Patterns
1. **Tile rendering with special states**:
   - Uppercase first letter from `tile.special` attribute
   - Conditional icon rendering based on type (source → yellow jerry can, filter → label, tap → black jerry can)
   
2. **Win condition**: Alert messages celebrating "clean water delivered" with impact statement (771M people lack access)

3. **Styling approach**: Utility-focused CSS with flex layouts for centering and responsive sizing

## Development Guidelines
- Keep component logic simple and embedded in single files initially
- Use semantic HTML with accessible alt text for images
- Maintain visual hierarchy with charity: water's branding (260px max logo width)
- All messaging should connect gameplay to real-world impact

## File Structure (Current)
- `README.md` - Contains mixed HTML/CSS/JS documentation and game logic
- `.git/` - Version control (initial commit + README update)

## Next Steps for Development
- Separate HTML/CSS/JS into dedicated files (index.html, styles.css, game.js)
- Create asset directory for images
- Implement tile grid generation and game state management
- Add event listeners for tile interactions
- Consider localStorage for game persistence

## Asset Requirements
Ensure these images are provided and properly referenced:
- `charitywater_logo_horizontal_BlackText.png`
- `jerry_can_yellow.png` (source icon, 36x36px)
- `jerry_can_black.png` (tap icon, 36x36px)

## External Integration
- charity: water donation/information links should be included in win state
- Consider embedding or linking to charity: water's impact metrics
