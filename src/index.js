import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './styles/main.css';

// Инициализируем приложение React вместо прямой инициализации компонентов
ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

console.log('Web Quest initialized.');
