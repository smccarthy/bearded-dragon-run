import { useState, useEffect } from 'react';

const MAX_SCORES = 10;

export default function useHighScores() {
  const [highScores, setHighScores] = useState([]);

  // Load high scores on mount
  useEffect(() => {
    const loadHighScores = () => {
      try {
        const savedScores = localStorage.getItem('beardedDragonHighScores');
        if (savedScores) {
          setHighScores(JSON.parse(savedScores));
        }
      } catch (error) {
        console.error('Error loading high scores:', error);
        // If there's an error, initialize with empty array
        setHighScores([]);
      }
    };

    loadHighScores();
  }, []);
  // Add a new score and save to localStorage
  const addScore = (score, level, playerName = 'Player', dragonName = 'Dragon') => {
    const newScore = {
      score,
      level,
      playerName,
      dragonName,
      date: new Date().toISOString(),
    };

    const updatedScores = [...highScores, newScore]
      .sort((a, b) => b.score - a.score) // Sort by score in descending order
      .slice(0, MAX_SCORES); // Keep only the top scores

    setHighScores(updatedScores);

    try {
      localStorage.setItem('beardedDragonHighScores', JSON.stringify(updatedScores));
    } catch (error) {
      console.error('Error saving high scores:', error);
    }

    return updatedScores;
  };

  // Reset high scores
  const resetScores = () => {
    setHighScores([]);
    try {
      localStorage.removeItem('beardedDragonHighScores');
    } catch (error) {
      console.error('Error resetting high scores:', error);
    }
  };

  // Check if a score qualifies for the high score list
  const isHighScore = (score) => {
    if (highScores.length < MAX_SCORES) return true;
    return highScores.some(entry => score > entry.score);
  };

  return {
    highScores,
    addScore,
    resetScores,
    isHighScore
  };
}
