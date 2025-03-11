import React, { useState } from 'react';

const MarkerForm = ({ onSubmit, onCancel }) => {
  const [message, setMessage] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSubmit(message);
    }
  };
  
  return (
    <div className="marker-popup-form">
      <form onSubmit={handleSubmit}>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Введите сообщение для метки..."
          rows="3"
          autoFocus
          className="marker-message-input"
        />
        <div className="marker-form-buttons">
          <button type="submit" className="marker-submit-button">Сохранить</button>
          <button type="button" className="marker-cancel-button" onClick={onCancel}>Отмена</button>
        </div>
      </form>
    </div>
  );
};

export default MarkerForm;
