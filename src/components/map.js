import L from 'leaflet';

export function initMap() {
  const mapContainer = document.getElementById('map-container');
  if (!mapContainer) return;
  
  // Проверяем, инициализирована ли уже карта
  if (mapContainer.classList.contains('leaflet-container')) return;
  
  // Создаем карту с центром в России
  const map = L.map(mapContainer).setView([55.7522, 37.6156], 3);
  
  // Добавляем слой OpenStreetMap
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 18
  }).addTo(map);
  
  // Добавляем пример метки
  const marker = L.marker([55.7522, 37.6156])
    .addTo(map)
    .bindPopup('Москва')
    .openPopup();
    
  console.log('Map initialized with Leaflet');
  
  // Исправляем проблему с размерами карты при первой загрузке
  setTimeout(() => {
    map.invalidateSize();
  }, 100);
  
  return map;
}

// Функция для добавления новой метки на карту
export function addMapMarker(map, lat, lng, message) {
  if (!map) return null;
  
  const marker = L.marker([lat, lng])
    .addTo(map)
    .bindPopup(message || 'Новая метка');
  
  return marker;
}
