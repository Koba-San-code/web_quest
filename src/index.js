import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './styles/main.css';
import L from 'leaflet';

L.Control.prototype.options.position = 'topright';
L.Control.BottomCenter = L.Control.extend({
  options: { position: 'bottomcenter' }
});
L.control.bottomcenter = function(opts) {
  return new L.Control.BottomCenter(opts);
};

document.addEventListener('DOMContentLoaded', function() {
  const addControlPlaceholders = function(map) {
    const corners = map._controlCorners;
    const l = 'leaflet-';
    const container = map._controlContainer;
    corners.bottomcenter = L.DomUtil.create('div', l + 'bottom ' + l + 'center', container);
  };
  const originalInitLayout = L.Map.prototype._initControlPos;
  L.Map.prototype._initControlPos = function() {
    originalInitLayout.call(this);
    addControlPlaceholders(this);
  };
});

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

console.log('Web Quest initialized.');
