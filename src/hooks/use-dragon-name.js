import { useState, useEffect } from 'react';

export default function useDragonName() {
  const [dragonName, setDragonName] = useState('Dragon');

  // Load dragon name from localStorage on mount
  useEffect(() => {
    try {
      const savedName = localStorage.getItem('beardedDragonName');
      if (savedName) {
        setDragonName(savedName);
      }
    } catch (error) {
      console.error('Error loading dragon name:', error);
      // If there's an error, keep the default name
    }
  }, []);

  // Save dragon name to localStorage when it changes
  const updateDragonName = newName => {
    if (!newName || newName.trim() === '') {
      newName = 'Dragon'; // Default name if empty
    }

    setDragonName(newName);

    try {
      localStorage.setItem('beardedDragonName', newName);
    } catch (error) {
      console.error('Error saving dragon name:', error);
    }
  };

  return {
    dragonName,
    updateDragonName,
  };
}
