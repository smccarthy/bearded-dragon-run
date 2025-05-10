// Server code for multiplayer functionality
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createServer as createViteServer } from 'vite';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create the HTTP server
const server = createServer();
const wss = new WebSocketServer({ server });

// Store connected clients and game state
const clients = new Map();
let gameState = {
  players: {},
  leaves: { x: 10, y: 10 }
};

// Handle WebSocket connections
wss.on('connection', (ws) => {
  // Generate a unique ID for this client
  const id = Date.now().toString();
  
  // Store the connection
  clients.set(ws, id);
  
  // Initialize player
  gameState.players[id] = {
    dragon: [{ x: Math.floor(Math.random() * 20), y: Math.floor(Math.random() * 20) }],
    direction: 'RIGHT',
    score: 0
  };
  
  // Send initial game state to the new player
  ws.send(JSON.stringify({
    type: 'init',
    id: id,
    gameState: gameState
  }));
  
  // Broadcast updated game state to all clients
  broadcastGameState();
  
  // Handle messages from client
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      
      if (data.type === 'direction') {
        const playerId = clients.get(ws);
        if (playerId && gameState.players[playerId]) {
          gameState.players[playerId].direction = data.direction;
        }
      }
    } catch (e) {
      console.error('Error processing message:', e);
    }
  });
  
  // Handle disconnect
  ws.on('close', () => {
    const playerId = clients.get(ws);
    if (playerId) {
      delete gameState.players[playerId];
      clients.delete(ws);
      broadcastGameState();
    }
  });
});

// Broadcast game state to all clients
function broadcastGameState() {
  const message = JSON.stringify({
    type: 'update',
    gameState: gameState
  });
  
  clients.forEach((_, client) => {
    if (client.readyState === 1) { // OPEN
      client.send(message);
    }
  });
}

// Helper function to check collision with other players
const checkPlayerCollision = (playerId, newHead) => {
  for (const [otherPlayerId, otherPlayer] of Object.entries(gameState.players)) {
    // Skip comparing with self
    if (otherPlayerId === playerId || !otherPlayer.dragon) continue;
    
    // Check collision with any segment of other player
    if (otherPlayer.dragon.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
      return true;
    }
  }
  return false;
};

// Game loop
setInterval(() => {
  // Move each player's dragon
  Object.keys(gameState.players).forEach(playerId => {
    const player = gameState.players[playerId];
    
    if (!player.dragon || player.dragon.length === 0) return;
    
    const head = player.dragon[player.dragon.length - 1];
    let newHead;
    
    // Calculate new head position based on direction
    switch (player.direction) {
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
        return;
    }
    
    // Check for collision with self
    const selfCollision = player.dragon.some(segment => 
      segment.x === newHead.x && segment.y === newHead.y
    );
    
    // Check for collision with other players
    const otherCollision = checkPlayerCollision(playerId, newHead);
    
    if (selfCollision || otherCollision) {
      // Reset player
      player.dragon = [{ x: Math.floor(Math.random() * 20), y: Math.floor(Math.random() * 20) }];
      player.score = 0;
    } else {
      // Add new head
      player.dragon.push(newHead);
      
      // Check if dragon eats a leaf
      if (newHead.x === gameState.leaves.x && newHead.y === gameState.leaves.y) {
        gameState.leaves = {
          x: Math.floor(Math.random() * 20),
          y: Math.floor(Math.random() * 20)
        };
        player.score += 1;
      } else {
        // Remove tail if didn't eat a leaf
        player.dragon.shift();
      }
    }
  });
  
  // Broadcast updated game state to all clients
  broadcastGameState();
}, 200);

// Start the server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`WebSocket server is running on port ${PORT}`);
});

// If this is called directly (not imported), start the server
if (import.meta.url === `file://${__filename}`) {
  console.log('Starting WebSocket game server...');
}

export default server;
