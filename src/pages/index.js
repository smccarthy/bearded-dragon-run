import { useState, useEffect } from 'react';
import styles from '../styles/Home.module.css';
import useGameClient from '../hooks/use-game-client';

export default function Home() {
  const [multiplayer, setMultiplayer] = useState(false);
  const [gameState, setGameState] = useState({
    dragon: [{ x: 5, y: 5 }],
    direction: 'RIGHT',
    leaves: [{ x: 10, y: 10 }],
    gameOver: false,
    score: 0,
    level: 1,
    speed: 200, // base speed in ms (lower = faster)
    multiplayer: false,
    clientId: null,
    players: {}
  });
  
  const gameClient = useGameClient();  const handleKeyDown = (e) => {
    // Get the key value
    const key = e.key;
    
    // Create direction mapping for both WASD and arrow keys
    let direction;
    
    // Check for WASD keys (case insensitive)
    if (key.toLowerCase() === 'w') direction = 'UP';
    else if (key.toLowerCase() === 's') direction = 'DOWN';
    else if (key.toLowerCase() === 'a') direction = 'LEFT';
    else if (key.toLowerCase() === 'd') direction = 'RIGHT';
    
    // Check for arrow keys
    else if (key === 'ArrowUp') direction = 'UP';
    else if (key === 'ArrowDown') direction = 'DOWN';
    else if (key === 'ArrowLeft') direction = 'LEFT';
    else if (key === 'ArrowRight') direction = 'RIGHT';
      // If no valid key was pressed, return
    if (!direction) return;
    
    if (gameState.multiplayer) {
      // In multiplayer mode, send direction to server
      gameClient.sendDirection(direction);
    } else {
      // In single player mode, update direction locally
      setGameState((prev) => {
        // Prevent 180-degree turns (directly reversing direction)
        const oppositeDirections = {
          'UP': 'DOWN',
          'DOWN': 'UP',
          'LEFT': 'RIGHT',
          'RIGHT': 'LEFT'
        };
        
        if (direction !== oppositeDirections[prev.direction]) {
          return { ...prev, direction: direction };
        }
        return prev;
      });
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState.multiplayer]);
  
  // Connect to WebSocket server when multiplayer is enabled
  useEffect(() => {
    if (gameState.multiplayer) {
      gameClient.connectToServer(setGameState);
    }
    
    return () => {
      if (gameState.multiplayer) {
        gameClient.closeConnection();
      }
    };
  }, [gameState.multiplayer]);

  // Helper function to generate a random position for a leaf
  const generateRandomLeafPosition = (existingLeaves, dragonPositions) => {
    let newPos;
    let isValidPosition = false;
    
    while (!isValidPosition) {
      newPos = {
        x: Math.floor(Math.random() * 20),
        y: Math.floor(Math.random() * 20)
      };
      
      // Check that it doesn't overlap with existing leaves
      const leafOverlap = existingLeaves.some(
        leaf => leaf.x === newPos.x && leaf.y === newPos.y
      );
      
      // Check that it doesn't overlap with the dragon
      const dragonOverlap = dragonPositions.some(
        segment => segment.x === newPos.x && segment.y === newPos.y
      );
      
      isValidPosition = !leafOverlap && !dragonOverlap;
    }
    
    return newPos;
  };

  // Calculate game speed based on level
  const calculateGameSpeed = (level) => {
    // Base speed is 200ms
    // Every 5 levels, speed decreases by 20ms (gets faster)
    const speedReduction = Math.floor((level - 1) / 5) * 20;
    
    // Don't let it go below 80ms (too fast becomes unplayable)
    return Math.max(80, 200 - speedReduction);
  };
    // Calculate number of leaves based on level
  const calculateLeafCount = (level) => {
    // Start with 1 leaf, add another every 10 levels (starting at level 11, 21, 31, etc.)
    return Math.floor((level - 1) / 10) + 1;
  };

  useEffect(() => {
    // Only run game loop in single player mode
    if (gameState.multiplayer) return;

    const interval = setInterval(() => {
      setGameState((prev) => {
        if (prev.gameOver) return prev;

        const newDragon = [...prev.dragon];
        const head = newDragon[newDragon.length - 1];
        let newHead;
        
        // Calculate new head position based on current direction
        switch (prev.direction) {
          case 'UP':
            newHead = { x: head.x, y: (head.y - 1 + 20) % 20 };
            break;
          case 'DOWN':
            newHead = { x: head.x, y: (head.y + 1) % 20 };
            break;
          case 'LEFT':
            newHead = { x: (head.x - 1 + 20) % 20, y: head.y };
            break;
          case 'RIGHT':
            newHead = { x: (head.x + 1) % 20, y: head.y };
            break;
          default:
            return prev;
        }

        // Check for collision with self
        if (
          newDragon.some((segment) => segment.x === newHead.x && segment.y === newHead.y)
        ) {
          return { ...prev, gameOver: true };
        }

        // Add new head to the dragon
        newDragon.push(newHead);
        
        // Check if dragon eats any leaf
        const eatenLeafIndex = prev.leaves.findIndex(
          leaf => leaf.x === newHead.x && leaf.y === newHead.y
        );
        
        if (eatenLeafIndex !== -1) {
          // Calculate new level and speed
          const newScore = prev.score + 1;
          const newLevel = Math.floor(newScore / 5) + 1;
          const newSpeed = calculateGameSpeed(newLevel);
          
          // Create a copy of the leaves array
          const newLeaves = [...prev.leaves];
          
          // Replace the eaten leaf with a new one
          newLeaves[eatenLeafIndex] = generateRandomLeafPosition(
            newLeaves.filter((_, i) => i !== eatenLeafIndex),
            newDragon
          );
          
          // Check if we need to add more leaves due to level up
          const requiredLeafCount = calculateLeafCount(newLevel);
          while (newLeaves.length < requiredLeafCount) {
            newLeaves.push(generateRandomLeafPosition(newLeaves, newDragon));
          }

          return {
            ...prev,
            dragon: newDragon,
            leaves: newLeaves,
            score: newScore,
            level: newLevel,
            speed: newSpeed
          };
        }

        // Remove tail if the dragon didn't eat a leaf
        newDragon.shift();
        return { ...prev, dragon: newDragon };
      });
    }, gameState.speed); // Use the dynamic speed

    return () => clearInterval(interval);
  }, [gameState.multiplayer, gameState.speed]); // Add speed as dependency

  return (
    <div className={styles.container}>
      <h1>Bearded Dragon Run</h1>
        <div className={styles.gameInfo}>
        <p>Controls: W/↑ (up), A/← (left), S/↓ (down), D/→ (right)</p>
        
        <div className={styles.gameControls}>
          <button 
            onClick={() => {
              setGameState(prev => ({
                ...prev,
                multiplayer: false,
                dragon: [{ x: 5, y: 5 }],
                direction: 'RIGHT',
                leaves: [{ x: 10, y: 10 }],
                gameOver: false,
                score: 0,
                level: 1,
                speed: 200,
              }));
            }}
          >
            Single Player
          </button>
          <button 
            onClick={() => {
              setGameState(prev => ({
                ...prev,
                multiplayer: true,
              }));
            }}
            disabled={gameState.multiplayer}
          >
            Multiplayer
          </button>
        </div>
          {!gameState.multiplayer ? (
          <div>
            <p>Current Direction: {gameState.direction}</p>
            <p className={styles.scoreDisplay}>Score: {gameState.score}</p>
            <p className={styles.levelDisplay}>Level: {gameState.level}</p>
            
            {/* Level Progress Bar - shows progress to next level */}
            <div className={styles.levelProgressContainer}>
              <div 
                className={styles.levelProgress} 
                style={{ width: `${(gameState.score % 5) * 20}%` }}
                title={`${5 - (gameState.score % 5)} more points to next level`}
              ></div>
            </div>
            
            {/* Leaves Counter with visual indicator */}
            <div className={styles.leavesCounter}>
              <div className={styles.leafIcon}></div>
              <span>× {gameState.leaves.length}</span>
              {gameState.level % 10 === 0 && <span> (New leaf at level {gameState.level + 1}!)</span>}
            </div>
            
            {/* Speed indicator with visual representation */}
            <div className={styles.speedIndicator}>
              <span>Speed: {Math.round(100 + (200 - gameState.speed)/2)}%</span>
              <div 
                className={styles.speedBar} 
                style={{ 
                  width: `${Math.round((200 - gameState.speed) / 1.2)}px`,
                  opacity: gameState.speed < 200 ? 1 : 0.5
                }}
              ></div>
              {gameState.speed < 200 && <span>🔥</span>}
              {gameState.level % 5 === 0 && <span> (Faster at level {gameState.level + 1}!)</span>}
            </div>
          </div>
        ) : (
          <div>
            <p>Your ID: {gameState.clientId || 'Connecting...'}</p>
            <p>Players Online: {Object.keys(gameState.players).length}</p>
          </div>
        )}
      </div>
        {gameState.gameOver && !gameState.multiplayer ? (
        <div className={styles.gameOver}>
          <h2>Game Over</h2>
          <p>Final Score: {gameState.score}</p>
          <p>Final Level: {gameState.level}</p>
          <p>Dragon Length: {gameState.dragon.length}</p>
          <p>Leaves: {gameState.leaves.length} on board</p>
          <p>Speed: {Math.round(100 + (200 - gameState.speed)/2)}% {gameState.speed < 200 ? '🔥' : ''}</p>
          <button 
            onClick={() => {
              setGameState(prev => ({
                ...prev,
                dragon: [{ x: 5, y: 5 }],
                direction: 'RIGHT',
                leaves: [{ x: 10, y: 10 }],
                gameOver: false,
                score: 0,
                level: 1,
                speed: 200,
              }));
            }}
          >
            Play Again
          </button>
        </div>
      ) : (
        <div className={styles.gameBoard}>
          {Array.from({ length: 20 }).map((_, y) => 
            Array.from({ length: 20 }).map((_, x) => {
              const renderCell = () => {
                if (!gameState.multiplayer) {
                  // Single player rendering
                  const isHead = gameState.dragon.length > 0 && 
                    gameState.dragon[gameState.dragon.length - 1].x === x && 
                    gameState.dragon[gameState.dragon.length - 1].y === y;
                  
                  const isBody = !isHead && gameState.dragon.some(segment => 
                    segment.x === x && segment.y === y
                  );
                  
                  if (isHead) {
                    return (
                      <div className={styles.dragonHead}>
                        <div className={styles.directionIndicator}>
                          {gameState.direction === 'UP' ? '↑' : 
                           gameState.direction === 'DOWN' ? '↓' : 
                           gameState.direction === 'LEFT' ? '←' : '→'}
                        </div>
                      </div>
                    );
                  } else if (isBody) {
                    return <div className={styles.dragon}></div>;
                  } else if (gameState.leaves.some(leaf => leaf.x === x && leaf.y === y)) {
                    return <div className={styles.leaf}></div>;
                  }
                } else {
                  // Multiplayer rendering
                  const clientId = gameState.clientId;
                  const players = gameState.players;
                  
                  // Check if any player's head or body is at this position
                  for (const playerId in players) {
                    const player = players[playerId];
                    if (!player.dragon) continue;
                    
                    // Check for head
                    const head = player.dragon[player.dragon.length - 1];
                    if (head && head.x === x && head.y === y) {
                      return (
                        <div className={playerId === clientId ? styles.dragonHead : styles.otherPlayerHead}>
                          <div className={styles.directionIndicator}>
                            {player.direction === 'UP' ? '↑' : 
                             player.direction === 'DOWN' ? '↓' : 
                             player.direction === 'LEFT' ? '←' : '→'}
                          </div>
                        </div>
                      );
                    }
                    
                    // Check for body
                    for (let i = 0; i < player.dragon.length - 1; i++) {
                      const segment = player.dragon[i];
                      if (segment.x === x && segment.y === y) {
                        return <div className={playerId === clientId ? styles.dragon : styles.otherPlayerDragon}></div>;
                      }
                    }
                  }
                  
                  // Check if a leaf is at this position
                  if (gameState.leaves && Array.isArray(gameState.leaves)) {
                    if (gameState.leaves.some(leaf => leaf.x === x && leaf.y === y)) {
                      return <div className={styles.leaf}></div>;
                    }
                  }
                }
                
                return null;
              };
              
              return (
                <div key={`${x}-${y}`} className={styles.cell}>
                  {renderCell()}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
