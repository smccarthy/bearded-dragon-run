# Bearded Dragon Run

Bearded Dragon Run is a multiplayer game inspired by the classic Snake game. Instead of a snake, players control a bearded dragon that grows as it eats leaves. The game ends if the dragon collides with itself or another player.

## Features
- Single player and multiplayer gameplay modes
- Control the bearded dragon using 'W', 'A', 'S', 'D' keys or arrow keys
- Pause/resume functionality with spacebar or pause button in single player mode
- The dragon grows when it eats leaves
- Adjustable game speed for better playability
- The game ends if the dragon collides with itself
- In multiplayer mode, dragons can collide with other players
- Visual indicators showing the current direction and pause state
- Score tracking system with high scores

## Technologies Used
- **Next.js** for the client
- **Node.js** for the server
- **WebSocket** for real-time multiplayer communication
- **Vitest** for testing

## Setup Instructions

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm ci
   ```
3. Start both the Next.js client and WebSocket server:
   ```bash
   npm run dev; node server.js
   ```
4. Build the project:
   ```bash
   npm run build
   ```
   The build generates static HTML files in the `out` directory (configured in next.config.js).

5. Start the production servers:
   ```bash
   npm run start; node server.js
   ```
   
   Note: The app uses static export, so the `start` command uses a static file server (serve) 
   to serve files from the `out` directory. You'll also need to run the WebSocket server separately.

## Development
- Use `npm run test` to run tests and ensure 90% coverage.
- Update documentation after every change.

## Gameplay Instructions
- Use 'W', 'A', 'S', 'D' or the arrow keys to move the dragon
- Press spacebar or the pause button to pause/resume the game in single player mode
- Avoid colliding with yourself or other players in multiplayer mode
- Eat leaves to grow larger and increase your score
- If you crash, your dragon resets to a single segment and your score resets to zero in multiplayer mode

## Game Mechanics
- The game board is a 20x20 grid
- The bearded dragon is represented by a square image with a directional indicator
- Every 5 levels, the dragon moves faster (game speed increases by 15ms)
- Base speed is set to a comfortable pace for better playability
- Every 10 levels, one additional leaf appears on the board
  - Level 1-10: 1 leaf
  - Level 11-20: 2 leaves
  - Level 21-30: 3 leaves
  - And so on...
- Levels are calculated based on score (every 5 points = 1 level)
- The leaves are represented by a circle image
- When the dragon eats a leaf, the leaf disappears, the dragon grows by one square, and your score increases
- The game can be paused at any time using the spacebar or pause button (single player only)
- The game ends if the dragon collides with itself in single player mode
- If the dragon reaches the edge of the board, it wraps around to the other side and continues moving
- In multiplayer mode, dragons are color-coded to distinguish between players
- Your own dragon appears in green, while other players' dragons appear in purple

## Controls
- `w` or `↑`: Move up
- `a` or `←`: Move left
- `s` or `↓`: Move down
- `d` or `→`: Move right
- `spacebar`: Pause/resume game (single player only)

## Game Modes

### Single Player
- Play alone and try to achieve the highest score
- Game over occurs when you collide with yourself
- If you achieve a high score, the high score screen will automatically appear
- Press "Play Again" to restart after game over

### Multiplayer
- Limited to 2 players maximum
- Play with another player in real-time
- Your dragon resets if you collide with yourself or another player
- Both players compete to eat leaves and grow their dragons
- The player with the highest score wins

## Contribution
Feel free to fork the repository and submit pull requests for new features or bug fixes.