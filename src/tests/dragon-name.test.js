import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useDragonName from '../hooks/use-dragon-name';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn(key => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value.toString();
    }),
    clear: () => {
      store = {};
    }
  };
})();

// Replace global localStorage with mock
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('useDragonName', () => {
  beforeEach(() => {
    // Clear localStorage and reset mocks before each test
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it('should use default dragon name if none is stored', () => {
    const { result } = renderHook(() => useDragonName());
    expect(result.current.dragonName).toBe('Dragon');
  });

  it('should load dragon name from localStorage if available', () => {
    // Set a value in mock localStorage
    localStorageMock.getItem.mockReturnValueOnce('Spike');
    const { result } = renderHook(() => useDragonName());
    expect(result.current.dragonName).toBe('Spike');
    expect(localStorageMock.getItem).toHaveBeenCalledWith('beardedDragonName');
  });

  it('should update dragon name and save to localStorage', () => {
    const { result } = renderHook(() => useDragonName());
    
    act(() => {
      result.current.updateDragonName('Rex');
    });
    
    expect(result.current.dragonName).toBe('Rex');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('beardedDragonName', 'Rex');
  });

  it('should use default name if empty name is provided', () => {
    const { result } = renderHook(() => useDragonName());
    
    act(() => {
      result.current.updateDragonName('');
    });
    
    expect(result.current.dragonName).toBe('Dragon');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('beardedDragonName', 'Dragon');
  });
  
  it('should handle localStorage errors gracefully', () => {
    // Simulate localStorage error
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    localStorageMock.getItem.mockImplementation(() => { throw new Error('Storage error'); });
    
    const { result } = renderHook(() => useDragonName());
    
    // Should use default name when localStorage throws an error
    expect(result.current.dragonName).toBe('Dragon');
    expect(consoleErrorSpy).toHaveBeenCalled();
    
    consoleErrorSpy.mockRestore();
  });
});
