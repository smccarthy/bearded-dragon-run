// Game client for multiplayer functionality
import { useEffect, useRef } from 'react';

export default function useGameClient() {
  const wsRef = useRef(null);
  const clientIdRef = useRef(null);
  // Connect to the WebSocket server
  const connectToServer = (setGameState) => {
    // Determine server URL based on environment
    const serverUrl = process.env.NODE_ENV === 'production'
      ? `wss://${window.location.host}/api/ws`
      : `ws://${window.location.hostname}:3001`;

    wsRef.current = new WebSocket(serverUrl);

    // Handle WebSocket connection open
    wsRef.current.onopen = () => {
      console.log('Connected to game server');
    };

    // Handle WebSocket messages from server
    wsRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'init') {
          // Store the client ID
          clientIdRef.current = data.id;
          
          // Initialize game state from server
          setGameState({
            multiplayer: true,
            clientId: data.id,
            players: data.gameState.players,
            leaves: data.gameState.leaves,
            gameOver: false
          });
        } else if (data.type === 'update') {
          // Update the game state from server
          setGameState(prev => ({
            ...prev,
            players: data.gameState.players,
            leaves: data.gameState.leaves
          }));
        }
      } catch (e) {
        console.error('Error parsing WebSocket message:', e);
      }
    };

    // Handle WebSocket errors
    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    // Handle WebSocket connection closed
    wsRef.current.onclose = () => {
      console.log('Disconnected from game server');
    };
  };

  // Send direction change to server
  const sendDirection = (direction) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'direction',
        direction: direction
      }));
    }
  };

  // Close the WebSocket connection when component unmounts
  const closeConnection = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }
  };

  return {
    connectToServer,
    sendDirection,
    closeConnection,
    clientId: clientIdRef.current
  };
}
