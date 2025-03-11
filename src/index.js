import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './styles/main.css';
import L from 'leaflet';

// Добавляем новую позицию для контролов в Leaflet (в центре снизу)
L.Control.prototype.options.position = 'topright'; // Оставляем стандартное значение
L.Control.BottomCenter = L.Control.extend({
  options: {
    position: 'bottomcenter'
  }
});

// Регистрируем новую позицию в системе контролов
L.control.bottomcenter = function(opts) {
  return new L.Control.BottomCenter(opts);
};

// Создаем элементы для новых позиций
document.addEventListener('DOMContentLoaded', function() {
  // Эта функция добавляет новые контейнеры для размещения контролов
  const addControlPlaceholders = function(map) {
    const corners = map._controlCorners;
    const l = 'leaflet-';
    const container = map._controlContainer;

    // Создаем контейнер для центрального положения снизу
    corners.bottomcenter = L.DomUtil.create('div', l + 'bottom ' + l + 'center', container);
  };

  // Переопределяем метод инициализации контролов 
  const originalInitLayout = L.Map.prototype._initControlPos;
  L.Map.prototype._initControlPos = function() {
    originalInitLayout.call(this);
    addControlPlaceholders(this);
  };
});

// Инициализируем приложение React вместо прямой инициализации компонентов
ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

console.log('Web Quest initialized.');
