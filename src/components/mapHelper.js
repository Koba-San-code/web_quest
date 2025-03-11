import L from 'leaflet';

export function initMap(container) {
  console.log('Initializing map with container:', container);
  
  if (!container) {
    console.error('Контейнер для карты не найден!');
    return null;
  }
  
  // Проверяем размер контейнера
  const width = container.clientWidth;
  const height = container.clientHeight;
  console.log(`Container dimensions: ${width}x${height}`);
  
  // Если размеры слишком малы, это может вызвать проблемы
  if (width < 50 || height < 50) {
    console.warn('Container dimensions are too small. Setting explicit size.');
    container.style.width = '100%';
    container.style.height = '500px';
  }
  
  // Проверяем, инициализирована ли уже карта
  if (container.classList.contains('leaflet-container')) {
    console.log('Map is already initialized in this container');
    return null;
  }
  
  try {
    // Создаем карту с центром на нейтральной территории
    console.log('Creating Leaflet map instance');
    const map = L.map(container, {
      zoomControl: true,
      minZoom: 2,
      maxBounds: [[-90, -180], [90, 180]]
    }).setView([20, 0], 2);
    
    // Добавляем слой карты
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18
    }).addTo(map);
    
    console.log('Map layer added successfully');
    
    // Исправляем проблему с размерами карты при первой загрузке
    setTimeout(() => {
      console.log('Fixing map size');
      map.invalidateSize();
    }, 100);
    
    return map;
  } catch (err) {
    console.error('Ошибка при инициализации карты:', err);
    return null;
  }
}

// Функция для добавления новой метки на карту
export function addMapMarker(map, lat, lng, message) {
  if (!map) return null;
  
  try {
    // Создаем иконку для метки
    const customIcon = L.divIcon({
      className: 'custom-map-marker',
      html: '<div class="marker-pin"></div>',
      iconSize: [30, 42],
      iconAnchor: [15, 42]
    });
    
    const marker = L.marker([lat, lng], { icon: customIcon })
      .addTo(map)
      .bindPopup(message || 'Новая метка');
    
    return marker;
  } catch (err) {
    console.error('Ошибка при добавлении метки:', err);
    return null;
  }
}

// Создание перемещаемого маркера
export function createDraggableMarker(map, lat, lng, message, dragEndCallback = null, confirmCallback = null) {
  if (!map) {
    console.error('Map instance is not available for marker creation');
    return null;
  }
  
  try {
    console.log(`Creating draggable marker at ${lat}, ${lng}`);
    
    // Проверяем корректность координат
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      console.error(`Invalid coordinates: lat=${lat}, lng=${lng}`);
      return null;
    }
    
    // Специальная иконка для перемещаемой метки
    const dragIcon = L.divIcon({
      className: 'custom-map-marker draggable',
      html: '<div class="marker-pin draggable"></div>',
      iconSize: [36, 48],  // Чуть больше, чем обычная метка
      iconAnchor: [18, 48]
    });
    
    const marker = L.marker([lat, lng], { 
      icon: dragIcon, 
      draggable: true,
      autoPan: true
    }).addTo(map);
    
    console.log('Marker added to map');
    
    // Добавляем подсказку
    marker.bindTooltip(message || 'Перетащите маркер в нужное место', {
      direction: 'top',
      permanent: true,
      offset: [0, -30]
    }).openTooltip();
    
    // Создаем кастомный контрол для подтверждения позиции
    const confirmControl = L.control({ position: 'bottomcenter' });
    confirmControl.onAdd = function() {
      const div = L.DomUtil.create('div', 'marker-confirm-container');
      div.innerHTML = `
        <button type="button" class="marker-confirm-button">
          <span class="marker-confirm-icon">✓</span> Подтвердить позицию
        </button>
      `;
      
      // Добавляем обработчик клика для кнопки подтверждения с предотвращением всплытия события
      const buttonElement = div.querySelector('.marker-confirm-button');
      L.DomEvent.on(buttonElement, 'click', function(e) {
        L.DomEvent.stop(e);
        if (confirmCallback) {
          console.log('Marker position confirmed, calling callback');
          confirmCallback(marker.getLatLng());
        }
        map.removeControl(confirmControl); // Удаляем кнопку после подтверждения
      });
      
      return div;
    };
    
    // Добавляем контрол на карту
    confirmControl.addTo(map);
    console.log('Confirmation control added');
    
    // Связываем контрол с маркером для последующего удаления
    marker.confirmControl = confirmControl;
    
    // Обработчик окончания перетаскивания
    if (dragEndCallback) {
      marker.on('dragend', dragEndCallback);
    }
    
    // Обновляем позицию контрола при перемещении маркера
    marker.on('drag', function() {
      // Подсказка: для дебага
      console.log('Marker is being dragged:', marker.getLatLng());
    });
    
    return marker;
  } catch (err) {
    console.error('Ошибка при создании перемещаемого маркера:', err);
    return null;
  }
}

// Функция для центрирования карты на указанном местоположении
export function centerMapOnLocation(map, lat, lng, zoom = 15) {
  if (!map) return;
  
  try {
    map.setView([lat, lng], zoom, {
      animate: true,
      duration: 1
    });
    
    // Добавляем эффект "пульсации" в точке местоположения
    const pulseIcon = L.divIcon({
      className: 'pulse-icon',
      html: '<div class="pulse-circle"></div>',
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });
    
    const pulseMarker = L.marker([lat, lng], { icon: pulseIcon }).addTo(map);
    
    // Удаляем эффект пульсации через 5 секунд
    setTimeout(() => {
      if (map.hasLayer(pulseMarker)) {
        map.removeLayer(pulseMarker);
      }
    }, 5000);
  } catch (err) {
    console.error('Ошибка при центрировании карты:', err);
  }
}

// Вычисление расстояния между двумя точками в километрах
export function getDistanceInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Радиус Земли в км
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const distance = R * c; // Расстояние в км
  return distance;
}

function deg2rad(deg) {
  return deg * (Math.PI/180);
}

// Создает круг с радиусом в км от указанной точки
export function createDistanceCircle(map, lat, lng, radiusKm, options = {}) {
  if (!map) return null;
  
  try {
    // Радиус в метрах
    const radius = radiusKm * 1000;
    
    const defaultOptions = {
      color: 'rgba(66, 133, 244, 0.3)',
      fillColor: 'rgba(66, 133, 244, 0.1)',
      fillOpacity: 0.3,
      weight: 2,
      dashArray: '5, 5',
      interactive: false
    };
    
    const circleOptions = { ...defaultOptions, ...options };
    
    // Создаем круг
    const circle = L.circle([lat, lng], {
      radius: radius,
      ...circleOptions
    }).addTo(map);
    
    return circle;
  } catch (err) {
    console.error('Ошибка при создании круга расстояния:', err);
    return null;
  }
}

// Проверяет, находится ли точка в пределах указанного радиуса от центра
export function isPointWithinRadius(centerLat, centerLng, pointLat, pointLng, radiusKm) {
  // Добавляем проверку корректности входных данных
  if (isNaN(centerLat) || isNaN(centerLng) || isNaN(pointLat) || isNaN(pointLng) || isNaN(radiusKm)) {
    console.error('Invalid parameters for isPointWithinRadius:', { centerLat, centerLng, pointLat, pointLng, radiusKm });
    return false;
  }
  
  const distance = getDistanceInKm(centerLat, centerLng, pointLat, pointLng);
  console.log(`Distance check: ${distance} km vs radius ${radiusKm} km`);
  return distance <= radiusKm;
}
