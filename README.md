# Bearded Dragon Run

Bearded Dragon Run is a multiplayer web-based game inspired by the classic Snake game. Instead of a snake, players control a bearded dragon that grows as it eats leaves. The game ends if the dragon collides with itself or another player.

## Features
- Single player and multiplayer gameplay modes
- Control the bearded dragon using 'W', 'A', 'S', 'D' keys
- The dragon grows when it eats leaves
- The game ends if the dragon collides with itself
- In multiplayer mode, dragons can collide with other players
- Visual indicators showing the current direction
- Score tracking system

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
5. Start the production server:
   ```bash
   npm run start; node server.js
   ```

## Development
- Use `npm run test` to run tests and ensure 90% coverage.
- Update documentation after every change.

## Gameplay Instructions
- Use 'W', 'A', 'S', 'D' to move the dragon
- Avoid colliding with yourself or other players in multiplayer mode
- Eat leaves to grow larger and increase your score
- If you crash, your dragon resets to a single segment and your score resets to zero in multiplayer mode

## Game Mechanics
- The game board is a 20x20 grid
- The bearded dragon is represented by a square image with a directional indicator
- The leaves are represented by a circle image
- When the dragon eats a leaf, the leaf disappears, the dragon grows by one square, and your score increases
- The game ends if the dragon collides with itself in single player mode
- If the dragon reaches the edge of the board, it wraps around to the other side and continues moving
- In multiplayer mode, dragons are color-coded to distinguish between players
- Your own dragon appears in green, while other players' dragons appear in purple

## Controls
- `w`: Move up
- `a`: Move left
- `s`: Move down
- `d`: Move right

## Game Modes

### Single Player
- Play alone and try to achieve the highest score
- Game over occurs when you collide with yourself
- Press "Play Again" to restart after game over

### Multiplayer
- Play with other connected players in real-time
- Your dragon resets if you collide with yourself or another player
- All players compete to eat leaves and grow their dragons
- The player with the highest score wins

## Contribution
Feel free to fork the repository and submit pull requests for new features or bug fixes.