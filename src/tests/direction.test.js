import { describe, it, expect } from 'vitest';

// Direction movement tests
export default describe('Direction Tests', () => {
  it('should correctly handle UP direction', () => {
    const head = { x: 5, y: 5 };
    const direction = 'UP';
    let newHead;

    if (direction === 'UP') {
      newHead = { x: head.x, y: (head.y - 1 + 20) % 20 };
    }

    expect(newHead).toEqual({ x: 5, y: 4 });
  });

  it('should correctly handle DOWN direction', () => {
    const head = { x: 5, y: 5 };
    const direction = 'DOWN';
    let newHead;

    if (direction === 'DOWN') {
      newHead = { x: head.x, y: (head.y + 1) % 20 };
    }

    expect(newHead).toEqual({ x: 5, y: 6 });
  });

  it('should correctly handle LEFT direction', () => {
    const head = { x: 5, y: 5 };
    const direction = 'LEFT';
    let newHead;

    if (direction === 'LEFT') {
      newHead = { x: (head.x - 1 + 20) % 20, y: head.y };
    }

    expect(newHead).toEqual({ x: 4, y: 5 });
  });

  it('should correctly handle RIGHT direction', () => {
    const head = { x: 5, y: 5 };
    const direction = 'RIGHT';
    let newHead;

    if (direction === 'RIGHT') {
      newHead = { x: (head.x + 1) % 20, y: head.y };
    }

    expect(newHead).toEqual({ x: 6, y: 5 });
  });
  // Keyboard mapping tests
  describe('Keyboard Controls', () => {
    const getDirectionFromKey = key => {
      // Check for WASD keys (case insensitive)
      if (key.toLowerCase() === 'w') return 'UP';
      else if (key.toLowerCase() === 's') return 'DOWN';
      else if (key.toLowerCase() === 'a') return 'LEFT';
      else if (key.toLowerCase() === 'd') return 'RIGHT';
      // Check for arrow keys
      else if (key === 'ArrowUp') return 'UP';
      else if (key === 'ArrowDown') return 'DOWN';
      else if (key === 'ArrowLeft') return 'LEFT';
      else if (key === 'ArrowRight') return 'RIGHT';

      // No valid key pressed
      return undefined;
    };

    it('should map WASD keys to directions', () => {
      expect(getDirectionFromKey('w')).toBe('UP');
      expect(getDirectionFromKey('a')).toBe('LEFT');
      expect(getDirectionFromKey('s')).toBe('DOWN');
      expect(getDirectionFromKey('d')).toBe('RIGHT');

      // Test uppercase keys too
      expect(getDirectionFromKey('W')).toBe('UP');
      expect(getDirectionFromKey('A')).toBe('LEFT');
      expect(getDirectionFromKey('S')).toBe('DOWN');
      expect(getDirectionFromKey('D')).toBe('RIGHT');
    });

    it('should map arrow keys to directions', () => {
      expect(getDirectionFromKey('ArrowUp')).toBe('UP');
      expect(getDirectionFromKey('ArrowLeft')).toBe('LEFT');
      expect(getDirectionFromKey('ArrowDown')).toBe('DOWN');
      expect(getDirectionFromKey('ArrowRight')).toBe('RIGHT');
    });

    it('should handle invalid keys by returning undefined', () => {
      expect(getDirectionFromKey('x')).toBeUndefined();
      expect(getDirectionFromKey('Space')).toBeUndefined();
      expect(getDirectionFromKey('Enter')).toBeUndefined();
    });
  });
});
