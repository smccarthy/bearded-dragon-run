# Project Summary

## What We've Built

- A fully functional Bearded Dragon Run game with both single player and multiplayer modes
- A clean and intuitive user interface with visual feedback
- Backend WebSocket server for real-time multiplayer gaming
- Comprehensive test suite with unit tests for game logic and integration tests

## Key Features Implemented

1. Bearded dragon movement with WASD keys and arrow key controls
2. Collision detection with self, rocks, and other players
3. Leaf eating and dragon growth mechanics
4. Score tracking and display
5. Board wrapping when reaching edges
6. Stationary rock obstacles that cause game over on collision
7. Real-time multiplayer with WebSocket communication limited to 2 players maximum
8. Visual direction indicators
9. Player color coding in multiplayer mode
10. Game restart functionality
11. Pause functionality with spacebar or button in single player mode
12. Progressive difficulty with level-based speed increases every 5 levels
13. Multiple leaves appearing on the board as level increases (every 10 levels)
14. Visual level progress indicators
15. Speed meter showing current game speed
16. Green octagon leaves for better visual clarity
17. Realistic tan color for the bearded dragon
18. Top ten high scores leaderboard with persistent storage
19. Personalized dragon naming system with persistent storage
20. Auto-appearing high score input screen on achieving a new high score

## Technical Implementation

- Next.js for frontend rendering and UI
- React hooks for state management
- WebSockets for real-time communication
- CSS Modules for styling
- Vitest for testing
- Concurrently for running client and server together
- ESLint for code linting and error prevention
- Prettier for consistent code formatting

## Code Quality

### ESLint and Prettier Integration

We've implemented ESLint and Prettier to maintain high code quality:

- **ESLint Configuration**: Custom `.eslintrc.json` with rules for React and Next.js
- **Prettier Configuration**: `.prettierrc` with project-specific formatting preferences
- **VSCode Integration**: Editor settings for automatic formatting on save
- **Ignore Files**: `.eslintignore` and `.prettierignore` to exclude build artifacts
- **Test-specific Rules**: Separate ESLint configuration for test files
- **NPM Scripts**: Convenient commands for linting and formatting

This setup ensures consistent code style across the project, catches potential errors early, and improves developer experience.

## Next Steps

- Add authentication for persistent player accounts
- Implement a global leaderboard for multiplayer
- Add different game modes and power-ups
- Improve visual design with animations
- Add sound effects and background music
- Optimize for mobile devices

## How to Play

1. Start the game with `npm run dev:all`
2. Choose single player or multiplayer mode (multiplayer is limited to 2 players maximum)
3. Use WASD keys or arrow keys to control your dragon
4. Press spacebar or the pause button to pause/resume in single player mode
5. Eat leaves to grow longer and increase your score
6. Level up every 5 points to make your dragon move faster
7. At higher levels (11, 21, 31, etc.), additional leaves will appear for more scoring opportunities
8. Avoid colliding with yourself, rocks, or other players
9. Rocks are stationary obstacles that appear randomly on the board
10. Watch the level progress bar to see how close you are to the next level
11. Check the speed indicator to see how fast your dragon is moving
12. In multiplayer mode, you'll see the number of connected players (max 2)
13. If you achieve a high score, the high score input screen will automatically appear
14. Try to get on the top ten high score leaderboard
15. Compete for the highest score and level!
