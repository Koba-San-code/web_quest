import './styles/main.css';
import { initMap } from './components/map';
import { initGlobe } from './components/globe';

// ...existing code...
document.addEventListener('DOMContentLoaded', () => {
  console.log('Web Quest initialized.');
  
  // Инициализация компонентов
  initGlobe();
  initMap();
});
// ...existing code...
