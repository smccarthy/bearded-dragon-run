// Game client for multiplayer functionality
import { useEffect, useRef } from 'react';

export default function useGameClient() {
  const wsRef = useRef(null);
  const clientIdRef = useRef(null);  // Connect to the WebSocket server
  const connectToServer = (setGameState) => {
    // Determine server URL based on environment
    let serverUrl;
    // Use the environment variable from next.config.js if available
    serverUrl = process.env.WS_URL || 
      (process.env.NODE_ENV === 'production'
        ? `ws://${window.location.hostname}:3001`  // Using direct connection instead of rewrites
        : `ws://${window.location.hostname}:3001`);

    wsRef.current = new WebSocket(serverUrl);// Handle WebSocket connection open
    wsRef.current.onopen = () => {
      // Connection established
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
            gameOver: false,
            connectionError: null
          });
        } else if (data.type === 'update') {
          // Update the game state from server
          setGameState(prev => ({
            ...prev,
            players: data.gameState.players,
            leaves: data.gameState.leaves
          }));
        } else if (data.type === 'connection_rejected') {
          // Handle connection rejection
          console.log('Connection rejected:', data.message);
          
          // Update game state to show the error
          setGameState(prev => ({
            ...prev,
            multiplayer: false, // Switch back to single player
            connectionError: data.message
          }));
          
          // Close the connection as it was rejected
          if (wsRef.current) {
            wsRef.current.close();
          }
        }
      } catch (e) {
        console.error('Error parsing WebSocket message:', e);
      }
    };

    // Handle WebSocket errors
    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };    // Handle WebSocket connection closed
    wsRef.current.onclose = () => {
      // Connection closed
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
