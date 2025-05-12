import { useState } from 'react';
import styles from '../styles/HighScores.module.css';

export default function HighScores({ highScores, onClose, onReset, onNewScore = null }) {
  const [playerName, setPlayerName] = useState('Player');
  const [scoreSubmitted, setScoreSubmitted] = useState(false);

  // Format date to be more readable
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const handleSubmitScore = () => {
    if (onNewScore) {
      onNewScore(playerName);
      setScoreSubmitted(true);
    }
  };

  return (
    <div className={styles.highScoresOverlay}>
      <div className={styles.highScoresModal}>
        <h2>Top 10 Scores</h2>
        
        {onNewScore && !scoreSubmitted && (
          <div className={styles.newScoreForm}>
            <p>Congratulations! You made the high score list!</p>
            <div className={styles.inputGroup}>
              <label htmlFor="playerName">Enter your name:</label>
              <input
                id="playerName"
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                maxLength={15}
              />
              <button onClick={handleSubmitScore}>Submit</button>
            </div>
          </div>
        )}
        
        {highScores.length > 0 ? (
          <table className={styles.scoreTable}>
            <thead>              <tr>
                <th>#</th>
                <th>Player</th>
                <th>Dragon</th>
                <th>Score</th>
                <th>Level</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {highScores.map((entry, index) => (                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{entry.playerName}</td>
                  <td>{entry.dragonName || 'Dragon'}</td>
                  <td>{entry.score}</td>
                  <td>{entry.level}</td>
                  <td>{formatDate(entry.date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className={styles.noScores}>No high scores yet! Play a game to set a record.</p>
        )}
        
        <div className={styles.buttonGroup}>
          <button onClick={onClose}>Close</button>
          {highScores.length > 0 && (
            <button 
              onClick={() => {
                if (window.confirm('Are you sure you want to reset all high scores?')) {
                  onReset();
                }
              }}
              className={styles.resetButton}
            >
              Reset Scores
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
