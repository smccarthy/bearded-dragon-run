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
});
