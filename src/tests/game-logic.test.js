import { describe, it, expect } from 'vitest';

// Mock game logic functions
const moveDragon = (dragon, direction) => {
  const head = dragon[dragon.length - 1];
  let newHead;

  switch (direction) {
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
      return dragon;
  }

  return [...dragon, newHead];
};

const checkCollision = (dragon) => {
  const head = dragon[dragon.length - 1];
  return dragon.slice(0, -1).some((segment) => segment.x === head.x && segment.y === head.y);
};

const eatLeaf = (dragon, leaf) => {
  const head = dragon[dragon.length - 1];
  return head.x === leaf.x && head.y === leaf.y;
};

// Multiplayer collision detection
const checkPlayerCollision = (players, playerId) => {
  const currentPlayer = players[playerId];
  if (!currentPlayer || !currentPlayer.dragon || currentPlayer.dragon.length === 0) {
    return false;
  }

  const head = currentPlayer.dragon[currentPlayer.dragon.length - 1];
  
  // Check collision with other players
  for (const [otherPlayerId, otherPlayer] of Object.entries(players)) {
    if (otherPlayerId === playerId || !otherPlayer.dragon) continue;
    
    // Check collision with any segment of other player
    if (otherPlayer.dragon.some(segment => segment.x === head.x && segment.y === head.y)) {
      return true;
    }
  }
  
  return false;
};

describe('Game Logic', () => {
  it('should move the dragon in the correct direction', () => {
    const dragon = [{ x: 5, y: 5 }];
    const newDragon = moveDragon(dragon, 'UP');
    expect(newDragon).toEqual([{ x: 5, y: 5 }, { x: 5, y: 4 }]);
  });

  it('should detect collision with itself', () => {
    const dragon = [{ x: 5, y: 5 }, { x: 5, y: 6 }, { x: 5, y: 5 }];
    expect(checkCollision(dragon)).toBe(true);
  });

  it('should detect when the dragon eats a leaf', () => {
    const dragon = [{ x: 5, y: 5 }];
    const leaf = { x: 5, y: 5 };
    expect(eatLeaf(dragon, leaf)).toBe(true);
  });
  
  it('should handle board wrapping correctly', () => {
    const dragon = [{ x: 0, y: 0 }];
    const newDragonUp = moveDragon(dragon, 'UP');
    expect(newDragonUp).toEqual([{ x: 0, y: 0 }, { x: 0, y: 19 }]);
    
    const newDragonLeft = moveDragon(dragon, 'LEFT');
    expect(newDragonLeft).toEqual([{ x: 0, y: 0 }, { x: 19, y: 0 }]);
  });

  describe('Multiplayer', () => {
    it('should detect collision with other players', () => {
      const players = {
        'player1': {
          dragon: [{ x: 5, y: 5 }, { x: 5, y: 6 }],
          direction: 'UP'
        },
        'player2': {
          dragon: [{ x: 4, y: 6 }, { x: 5, y: 6 }],  
          direction: 'RIGHT'
        }
      };
      
      // player2's head is at the same position as a segment of player1
      expect(checkPlayerCollision(players, 'player2')).toBe(true);
    });
    
    it('should not detect collision when players are not colliding', () => {
      const players = {
        'player1': {
          dragon: [{ x: 5, y: 5 }, { x: 5, y: 6 }],
          direction: 'UP'
        },
        'player2': {
          dragon: [{ x: 10, y: 10 }, { x: 10, y: 11 }],
          direction: 'UP'
        }
      };
      
      expect(checkPlayerCollision(players, 'player1')).toBe(false);
      expect(checkPlayerCollision(players, 'player2')).toBe(false);
    });
  });
});
