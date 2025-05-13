import { useState, useEffect } from 'react';
import styles from '../styles/Home.module.css';
import useGameClient from '../hooks/use-game-client';
import useHighScores from '../hooks/use-high-scores';
import useDragonName from '../hooks/use-dragon-name';
import HighScores from '../components/high-scores';
import DragonNameInput from '../components/dragon-name-input';

export default function Home() {
  const [multiplayer, setMultiplayer] = useState(false);
  const [showHighScores, setShowHighScores] = useState(false);
  const [showNameInput, setShowNameInput] = useState(false);
  const [pendingScore, setPendingScore] = useState(null);
  const [isPaused, setPaused] = useState(false);
  const [processedGameOver, setProcessedGameOver] = useState(false);
  const { highScores, addScore, resetScores, isHighScore } = useHighScores();
  const { dragonName, updateDragonName } = useDragonName();  const [gameState, setGameState] = useState({
    dragon: [{ x: 5, y: 5 }],
    direction: 'RIGHT',
    leaves: [{ x: 10, y: 10 }],
    gameOver: false,
    score: 0,
    level: 1,
    speed: 300, // base speed in ms (lower = faster) - increased for slower initial movement
    multiplayer: false,
    clientId: null,
    players: {},
    connectionError: null
  });
  
  const gameClient = useGameClient();  const handleKeyDown = (e) => {
    // Get the key value
    const key = e.key;
    
    // Spacebar handling moved to the useEffect to avoid stale closures
    
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
    
    // If game is paused and in single player, don't process direction changes
    if (isPaused && !gameState.multiplayer) return;
    
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
  };  useEffect(() => {
    // Create the handler inside the effect to avoid stale closures
    const keyDownHandler = (e) => {
      // Prevent default behavior for space key to avoid page scrolling
      if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        
        // Handle spacebar directly in this handler to avoid closure issues
        if (!gameState.multiplayer && !gameState.gameOver) {
          setPaused(prevPaused => !prevPaused);
        }
        return;
      }
      
      // For other keys, use the regular handler
      handleKeyDown(e);
    };
    
    window.addEventListener('keydown', keyDownHandler);
    return () => window.removeEventListener('keydown', keyDownHandler);
  }, [gameState.multiplayer, gameState.gameOver]);
    // Connect to WebSocket server when multiplayer is enabled
  useEffect(() => {
    if (gameState.multiplayer) {
      gameClient.connectToServer(setGameState);
      
      // Set a timeout to check if we successfully connected
      const connectionCheckTimeout = setTimeout(() => {
        if (gameState.connectionError) {
          console.log('Connection failed or was rejected');
        }
      }, 2000);
      
      return () => {
        clearTimeout(connectionCheckTimeout);
        gameClient.closeConnection();
      };
    }
  }, [gameState.multiplayer, gameState.connectionError]);
  // Auto-show high scores when game is over and it's a new high score
  useEffect(() => {
    // Only proceed if game is over, not in multiplayer, and we haven't already processed this game over
    if (gameState.gameOver && !gameState.multiplayer && !processedGameOver) {
      // Check if the current score is a high score and we haven't processed it yet
      if (isHighScore(gameState.score)) {
        // Save pending score for submission
        setPendingScore({
          score: gameState.score,
          level: gameState.level,
          dragonName: dragonName
        });
        // Automatically show the high scores screen
        setShowHighScores(true);
        // Mark this game over as processed
        setProcessedGameOver(true);
      }
    }
    
    // Reset the processedGameOver flag when the game is not over
    if (!gameState.gameOver) {
      setProcessedGameOver(false);
    }
  }, [gameState.gameOver, gameState.multiplayer, gameState.score, gameState.level, dragonName, isHighScore, processedGameOver]);

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
    // Base speed is 300ms (slower initial speed)
    // Every 5 levels, speed decreases by 15ms (gets faster, but more gradually)
    const speedReduction = Math.floor((level - 1) / 5) * 15;
    
    // Don't let it go below 150ms (prevent it from getting too fast)
    return Math.max(150, 300 - speedReduction);
  };
    // Calculate number of leaves based on level
  const calculateLeafCount = (level) => {
    // Start with 1 leaf, add another every 10 levels (starting at level 11, 21, 31, etc.)
    return Math.floor((level - 1) / 10) + 1;
  };  useEffect(() => {
    // Only run game loop in single player mode
    if (gameState.multiplayer) return;
    
    // If the game is paused, don't set up the interval at all
    if (isPaused) {
      return () => {}; // Return empty cleanup function
    }

    // Create the interval for game updates
    const interval = setInterval(() => {
      setGameState((prev) => {
        // Double-check game is not over
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
        return { ...prev, dragon: newDragon };      });
    }, gameState.speed); // Use the dynamic speed
    
    // Properly clean up the interval on unmount or when dependencies change
    return () => {
      clearInterval(interval);
    };
  }, [gameState.multiplayer, gameState.speed, isPaused]); // Recreate interval when isPaused changes

  return (
    <div className={styles.container}>      <h1>Bearded Dragon Run</h1>
        <div className={styles.gameInfo}>
        <p>Controls: W/↑ (up), A/← (left), S/↓ (down), D/→ (right), Space (pause/resume)</p>
          <div className={styles.gameControls}>          <button            onClick={(e) => {
              e.preventDefault(); // Prevent any default behavior
              
              // First update the game state
              setGameState(prev => ({
                ...prev,
                multiplayer: false,
                dragon: [{ x: 5, y: 5 }],
                direction: 'RIGHT',
                leaves: [{ x: 10, y: 10 }],
                gameOver: false,
                score: 0,
                level: 1,
                speed: 300, // Use the slower base speed
              }));
              
              // Then ensure the game is not paused (using a small timeout to ensure state has updated)
              setTimeout(() => {
                setPaused(false);
              }, 10);
            }}
          >
            Single Player
          </button>          <button 
            onClick={() => {
              // Reset pause state and clear any previous errors when switching to multiplayer
              setPaused(false);
              setGameState(prev => ({
                ...prev,
                multiplayer: true,
                connectionError: null
              }));
            }}
            disabled={gameState.multiplayer}
            title="Join multiplayer game (max 2 players)"
          >
            Multiplayer
          </button>
          <button 
            onClick={() => setShowNameInput(true)}
          >
            Name Dragon
          </button>          <button 
            onClick={() => setShowHighScores(true)}
          >
            High Scores
          </button>          {!gameState.multiplayer && !gameState.gameOver && (
            <button 
              className={`${styles.pauseButton} ${isPaused ? styles.paused : ''}`}
              onClick={(e) => {
                e.preventDefault(); // Prevent any default behavior
                e.stopPropagation(); // Stop event bubbling
                setPaused(prevPaused => !prevPaused); // Use functional update for reliability
              }}
              title={isPaused ? "Resume the game" : "Pause the game (spacebar)"}
            >
              {isPaused ? '▶ Resume Game' : '⏸ Pause Game'}
            </button>
          )}
        </div>        {/* Display connection error if any */}
        {gameState.connectionError && (
          <div className={styles.errorMessage}>
            <span>⚠️ {gameState.connectionError}</span>
          </div>
        )}
        
        {!gameState.multiplayer ? (          <div>
            <div className={styles.dragonNameDisplay}>
              <span>Dragon Name: </span>
              <span className={styles.dragonNameText}>{dragonName}</span>
              <button 
                onClick={() => setShowNameInput(true)} 
                className={styles.editNameButton}
              >
                ✏️
              </button>
            </div><div className={styles.gameStatus}>
              <p>Current Direction: {isPaused ? 'PAUSED' : gameState.direction}</p>
              {isPaused && (
                <div className={styles.pausedStatus}>
                  <span className={styles.pauseStatusIcon}>⏸</span>
                  <p>GAME PAUSED (Press Space to Resume)</p>
                </div>
              )}
            </div>
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
              <span>Speed: {Math.round(100 * (300 / gameState.speed))}%</span>
              <div 
                className={styles.speedBar} 
                style={{ 
                  width: `${Math.round((300 - gameState.speed) / 1)}px`,
                  opacity: gameState.speed < 300 ? 1 : 0.5
                }}
              ></div>
              {gameState.speed < 300 && <span>🔥</span>}
              {gameState.level % 5 === 0 && <span> (Faster at level {gameState.level + 1}!)</span>}
            </div>
          </div>
        ) : (          <div>
            <p>Your ID: {gameState.clientId || 'Connecting...'}</p>
            <p>Players Online: {Object.keys(gameState.players).length} / 2</p>
            <div className={styles.playerLimit}>
              <span className={styles.infoIcon}>ℹ️</span>
              <span>Only 2 players maximum allowed in multiplayer mode</span>
            </div>
          </div>
        )}
      </div>        {gameState.gameOver && !gameState.multiplayer ? (        <div className={styles.gameOver}>
          <h2>Game Over</h2>
          <p className={styles.dragonNameGameOver}>{dragonName}'s Adventure Ends!</p>
          <p>Final Score: {gameState.score}</p>
          <p>Final Level: {gameState.level}</p>
          <p>Dragon Length: {gameState.dragon.length}</p>
          <p>Leaves: {gameState.leaves.length} on board</p>
          <p>Speed: {Math.round(100 * (300 / gameState.speed))}% {gameState.speed < 300 ? '🔥' : ''}</p>
          
          {isHighScore(gameState.score) && (
            <p className={styles.newHighScore}>New High Score! 🏆</p>
          )}
          
          <div className={styles.gameOverButtons}>          <button              onClick={(e) => {
                e.preventDefault();
                
                // No need to check for high score here - it's now handled automatically in the useEffect
                
                // Reset game state first
                setGameState(prev => ({
                  ...prev,
                  dragon: [{ x: 5, y: 5 }],
                  direction: 'RIGHT',
                  leaves: [{ x: 10, y: 10 }],
                  gameOver: false,
                  score: 0,
                  level: 1,
                  speed: 300, // Use slower base speed
                }));
                
                // Then ensure the game is not paused (with a small delay)
                setTimeout(() => {
                  setPaused(false);
                }, 10);
              }}
            >
              Play Again
            </button>
            
            <button 
              onClick={() => setShowHighScores(true)}
              className={styles.highScoreButton}
            >
              View High Scores
            </button>
          </div>
        </div>      ) : (
        <div className={styles.gameBoard}>          {isPaused && !gameState.multiplayer && (
            <div className={styles.pauseOverlay}>
              <div className={styles.pauseIcon}>⏸️</div>
              <div className={styles.pauseTitle}>GAME PAUSED</div>
              <div className={styles.pauseMessage}>Dragon is taking a break</div>
              <div className={styles.pauseTip}>Press spacebar to resume</div>
            </div>
          )}
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
      )}      {/* High Scores Modal */}
      {showHighScores && (
        <HighScores 
          highScores={highScores}
          onClose={() => {
            console.log('Close callback triggered in parent');
            setShowHighScores(false);
            setPendingScore(null);
          }}
          onReset={resetScores}
          onNewScore={pendingScore ? (playerName) => {
            addScore(pendingScore.score, pendingScore.level, playerName, pendingScore.dragonName);
            setPendingScore(null);
          } : null}
        />
      )}
      
      {/* Dragon Name Input Modal */}
      {showNameInput && (
        <DragonNameInput
          currentName={dragonName}
          onNameChange={updateDragonName}
          onClose={() => setShowNameInput(false)}
        />
      )}
    </div>
  );
}
