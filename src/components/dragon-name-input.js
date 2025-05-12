import { useState } from 'react';
import styles from '../styles/DragonNameInput.module.css';

export default function DragonNameInput({ currentName, onNameChange, onClose }) {
  const [name, setName] = useState(currentName || 'Dragon');

  const handleSubmit = (e) => {
    e.preventDefault();
    onNameChange(name);
    onClose();
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2>Name Your Bearded Dragon</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label htmlFor="dragonName">Dragon Name:</label>
            <input
              id="dragonName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={15}
              placeholder="Enter a name for your dragon"
              autoFocus
            />
          </div>
          <div className={styles.buttonGroup}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>
              Cancel
            </button>
            <button type="submit" className={styles.saveButton}>
              Save Name
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
