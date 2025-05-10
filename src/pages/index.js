import { useState, useEffect } from 'react';
import styles from '../styles/Home.module.css';
import useGameClient from '../hooks/use-game-client';

export default function Home() {
  const [multiplayer, setMultiplayer] = useState(false);
  const [gameState, setGameState] = useState({
    dragon: [{ x: 5, y: 5 }],
    direction: 'RIGHT',
    leaves: { x: 10, y: 10 },
    gameOver: false,
    score: 0,
    multiplayer: false,
    clientId: null,
    players: {}
  });
  
  const gameClient = useGameClient();  const handleKeyDown = (e) => {
    // Convert key to lowercase to handle both uppercase and lowercase
    const key = e.key.toLowerCase();
    
    const directionMap = {
      w: 'UP',
      s: 'DOWN',
      a: 'LEFT',
      d: 'RIGHT',
    };
    
    const newDirection = directionMap[key];
    if (!newDirection) return;
    
    if (gameState.multiplayer) {
      // In multiplayer mode, send direction to server
      gameClient.sendDirection(newDirection);
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
        
        if (newDirection !== oppositeDirections[prev.direction]) {
          return { ...prev, direction: newDirection };
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
        
        // Check if dragon eats a leaf
        if (newHead.x === prev.leaves.x && newHead.y === prev.leaves.y) {
          const newLeaves = {
            x: Math.floor(Math.random() * 20),
            y: Math.floor(Math.random() * 20),
          };

          return {
            ...prev,
            dragon: newDragon,
            leaves: newLeaves,
            score: prev.score + 1,
          };
        }

        // Remove tail if the dragon didn't eat a leaf
        newDragon.shift();
        return { ...prev, dragon: newDragon };
      });
    }, 200);

    return () => clearInterval(interval);
  }, [gameState.multiplayer]);  return (
    <div className={styles.container}>
      <h1>Bearded Dragon Run</h1>
      
      <div className={styles.gameInfo}>
        <p>Controls: W (up), A (left), S (down), D (right)</p>
        
        <div className={styles.gameControls}>
          <button 
            onClick={() => {
              setGameState(prev => ({
                ...prev,
                multiplayer: false,
                dragon: [{ x: 5, y: 5 }],
                direction: 'RIGHT',
                leaves: { x: 10, y: 10 },
                gameOver: false,
                score: 0,
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
          <button 
            onClick={() => {
              setGameState(prev => ({
                ...prev,
                dragon: [{ x: 5, y: 5 }],
                direction: 'RIGHT',
                leaves: { x: 10, y: 10 },
                gameOver: false,
                score: 0,
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
                  } else if (gameState.leaves.x === x && gameState.leaves.y === y) {
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
                  if (gameState.leaves && gameState.leaves.x === x && gameState.leaves.y === y) {
                    return <div className={styles.leaf}></div>;
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
