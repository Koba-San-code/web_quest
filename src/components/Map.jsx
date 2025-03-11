import React, { useEffect, useState, useRef } from 'react';
import L from 'leaflet'; // Явно импортируем Leaflet
import { 
  initMap, 
  addMapMarker, 
  centerMapOnLocation, 
  createDraggableMarker,
  getDistanceInKm,
  createDistanceCircle,
  isPointWithinRadius
} from './mapHelper';
import { addMapMarker as addMapMarkerApi } from '../services/api';
import MarkerForm from './MarkerForm';
import { accessKeyService, UNIVERSAL_KEY } from '../services/accessKeyService';

const LOCATION_RADIUS_KM = 100; // Радиус разрешенной зоны в км

const Map = ({ onMarkerAdded, markers = [] }) => {
  // Базовые состояния
  const [map, setMap] = useState(null);
  const mapContainerRef = useRef(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [hasAccessKey, setHasAccessKey] = useState(false);
  const [accessKey, setAccessKey] = useState('');
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [draggableMarker, setDraggableMarker] = useState(null);
  const [originalPosition, setOriginalPosition] = useState(null);
  const [markerFormPosition, setMarkerFormPosition] = useState(null);
  const [showAccessKeyHelp, setShowAccessKeyHelp] = useState(false);
  const [locationCircle, setLocationCircle] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [pointingMode, setPointingMode] = useState(false);
  
  // Добавляем helpToast для хранения ссылки на индикатор режима указания
  const helpToastRef = useRef(null);
  
  // Добавляем ref для прозрачного слоя перехвата кликов
  const clickLayerRef = useRef(null);

  // Правильный способ использовать глобальный Map
  // Убедимся, что мы используем JavaScript Map, а не наш компонент React Map
  const existingMarkersRef = useRef(new window.Map());

  // Инициализация карты
  useEffect(() => {
    if (!mapContainerRef.current) return;

    console.log('Map container dimensions:', 
      mapContainerRef.current.offsetWidth, 
      mapContainerRef.current.offsetHeight);
    
    const initTimer = setTimeout(() => {
      try {
        const mapInstance = initMap(mapContainerRef.current);
        if (mapInstance) {
          console.log('Map initialized successfully');
          setMap(mapInstance);
          
          // Очищаем все существующие обработчики
          if (mapInstance._events && mapInstance._events.click) {
            mapInstance.off('click');
          }
          
          // Добавляем обработчик клика по карте
          console.log('Adding click handler to map');
          mapInstance.on('click', handleMapClick);
          
          // Фиксируем размеры после инициализации
          setTimeout(() => mapInstance.invalidateSize(), 300);
        }
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    }, 100);
    
    const handleResize = () => {
      if (map) map.invalidateSize();
    };
    
    window.addEventListener('resize', handleResize);
    
    // Проверка сохраненного ключа в localStorage
    if (accessKeyService.checkSavedKey()) {
      setAccessKey(accessKeyService.getSavedKey());
      setHasAccessKey(true);
    }
    
    return () => {
      clearTimeout(initTimer);
      window.removeEventListener('resize', handleResize);
      
      // Очистка всех обработчиков Leaflet
      if (map) {
        map.off('click', handleMapClick);
        cleanupMapControls();
      }
      
      // Дополнительно очищаем clickLayer если он существует
      if (clickLayerRef.current && map && map.hasLayer(clickLayerRef.current)) {
        if (clickLayerRef.current.timeoutId) {
          clearTimeout(clickLayerRef.current.timeoutId);
        }
        map.removeLayer(clickLayerRef.current);
      }
    };
  }, []);

  // Очистка элементов управления карты
  const cleanupMapControls = () => {
    if (!map) return;
    
    // Удаляем подсказки и вспомогательные элементы
    if (helpToastRef.current) {
      map.removeControl(helpToastRef.current);
      helpToastRef.current = null;
    }
    
    // Сбрасываем курсор
    if (map.getContainer()) {
      map.getContainer().style.cursor = '';
    }
  };

  // Модифицированная функция включения режима указания
  const enablePointingMode = () => {
    if (!map) return;
    
    // Удаляем текущий перемещаемый маркер, если он есть
    if (draggableMarker && map.hasLayer(draggableMarker)) {
      if (draggableMarker.confirmControl) {
        map.removeControl(draggableMarker.confirmControl);
      }
      map.removeLayer(draggableMarker);
      setDraggableMarker(null);
    }
    
    // Включаем режим указания
    setPointingMode(true);
    console.log('Pointing mode enabled');
    
    // Изменяем курсор для индикации режима указания
    map.getContainer().style.cursor = 'crosshair';
    
    // Добавляем визуальную подсказку
    const helpToast = L.control({ position: 'topright' });
    helpToast.onAdd = function() {
      const div = L.DomUtil.create('div', 'pointing-mode-help');
      div.innerHTML = `
        <div class="help-toast">
          Кликните в любое место карты для размещения маркера
        </div>
      `;
      return div;
    };
    
    helpToast.addTo(map);
    helpToastRef.current = helpToast;
    
    // Создаем прозрачный слой для перехвата событий клика
    // Это решает конфликт с базовым поведением Leaflet
    const clickLayer = L.rectangle(map.getBounds(), {
      color: 'transparent',
      fillOpacity: 0,
      weight: 0,
      interactive: true  // Важно для перехвата событий
    }).addTo(map);
    
    // Добавляем обработчик клика специально для этого слоя
    clickLayer.on('click', function(e) {
      console.log('Click intercepted by transparent layer');
      const { lat, lng } = e.latlng;
      
      // Отключаем режим указания
      disablePointingMode();
      
      // Создаём маркер в указанной позиции
      createMarkerAtPosition(lat, lng, false);
      
      // Предотвращаем распространение события
      L.DomEvent.stopPropagation(e);
    });
    
    // Сохраняем ссылку на слой для последующего удаления
    clickLayerRef.current = clickLayer;
    
    // Автоматическое отключение режима через 30 секунд (для предотвращения "застревания" в режиме)
    const timeout = setTimeout(() => {
      if (pointingMode) {
        console.log('Pointing mode auto-disabled after timeout');
        disablePointingMode();
      }
    }, 30000);
    
    // Сохраняем ID таймера для очистки при необходимости
    clickLayerRef.current.timeoutId = timeout;
  };

  // Модифицированная функция отключения режима указания
  const disablePointingMode = () => {
    if (!map) return;
    
    console.log('Pointing mode disabled');
    setPointingMode(false);
    
    // Удаляем прозрачный слой для перехвата кликов
    if (clickLayerRef.current) {
      // Очищаем таймер, если он есть
      if (clickLayerRef.current.timeoutId) {
        clearTimeout(clickLayerRef.current.timeoutId);
      }
      
      map.removeLayer(clickLayerRef.current);
      clickLayerRef.current = null;
    }
    
    // Очищаем элементы управления
    cleanupMapControls();
  };

  // Обработчик клика по карте - упрощаем, т.к. режим указания обрабатывается отдельно
  const handleMapClick = (e) => {
    if (!map) return;
    
    const { lat, lng } = e.latlng;
    console.log(`Map clicked at ${lat}, ${lng}, pointingMode: ${pointingMode}`);
    
    // В режиме указания клики обрабатываются через отдельный прозрачный слой
    if (pointingMode) return;
    
    // Стандартный режим
    // Если у пользователя есть ключ доступа, разрешаем ставить метку где угодно
    if (hasAccessKey) {
      console.log('User has access key - creating marker at click position');
      createMarkerAtPosition(lat, lng, false);
      return;
    }
    
    // Пользователи без ключа доступа
    // Если нет определенного местоположения, показываем уведомление
    if (!userLocation) {
      alert("Для добавления метки необходимо определить свое местоположение или ввести ключ доступа");
      setShowKeyModal(true);
      return;
    }
    
    // Проверяем, находится ли точка в пределах разрешенного радиуса от местоположения
    const isWithinRadius = isPointWithinRadius(
      userLocation.lat, 
      userLocation.lng, 
      lat, 
      lng, 
      LOCATION_RADIUS_KM
    );
    
    if (!isWithinRadius) {
      alert(`Без ключа доступа вы можете добавлять метки только в радиусе ${LOCATION_RADIUS_KM} км от вашего местоположения`);
      return;
    }
    
    // Если все проверки пройдены, создаем маркер с привязкой к местоположению
    console.log('Creating marker in allowed radius around user location');
    createMarkerAtPosition(lat, lng, true);
  };

  // Создание нового перемещаемого маркера на карте
  const createMarkerAtPosition = (lat, lng, isLocationBased = false) => {
    console.log(`Creating marker at position: ${lat}, ${lng}, isLocationBased: ${isLocationBased}, hasKey: ${hasAccessKey}`);
    
    // Удаляем текущий перемещаемый маркер, если он есть
    if (draggableMarker && map && map.hasLayer(draggableMarker)) {
      if (draggableMarker.confirmControl) {
        map.removeControl(draggableMarker.confirmControl);
      }
      map.removeLayer(draggableMarker);
    }
    
    // Сохраняем оригинальную позицию для ограничения перемещения
    if (isLocationBased && userLocation) {
      setOriginalPosition({ lat: userLocation.lat, lng: userLocation.lng });
    } else {
      setOriginalPosition(null); // Для ключа доступа нет ограничений
    }
    
    try {
      // Создаем новый перемещаемый маркер
      const newDraggableMarker = createDraggableMarker(
        map, 
        lat, 
        lng, 
        isLocationBased 
          ? 'Перетащите маркер в пределах доступной зоны' 
          : 'Перетащите маркер в нужное место',
        (e) => {
          // При завершении перетаскивания
          const newPos = e.target.getLatLng();
          
          // Проверяем ограничение по дистанции для геолокации
          if (isLocationBased && userLocation) {
            const distance = getDistanceInKm(
              userLocation.lat, 
              userLocation.lng, 
              newPos.lat, 
              newPos.lng
            );
            
            if (distance > LOCATION_RADIUS_KM) {
              alert(`Маркер нельзя перемещать на расстояние более ${LOCATION_RADIUS_KM} км от вашего местоположения`);
              e.target.setLatLng([userLocation.lat, userLocation.lng]);
              return;
            }
          }
        },
        (position) => {
          // Функция вызывается при нажатии на кнопку подтверждения
          console.log("Marker position confirmed:", position);
          setMarkerFormPosition({lat: position.lat, lng: position.lng});
        }
      );
      
      if (newDraggableMarker) {
        console.log('Draggable marker created successfully');
        setDraggableMarker(newDraggableMarker);
      } else {
        console.error('Failed to create draggable marker - returned null');
      }
    } catch (error) {
      console.error('Failed to create draggable marker:', error);
    }
  };

  // Обработчик отправки формы с сообщением метки
  const handleMarkerFormSubmit = async (message) => {
    if (!message.trim()) return;
    
    let position;
    
    // Проверяем источник позиции - перемещаемый маркер или центр карты
    if (draggableMarker) {
      position = draggableMarker.getLatLng();
    } else if (markerFormPosition) {
      // Используем позицию, сохраненную при клике "Поставить здесь"
      position = markerFormPosition;
    } else {
      console.error('Нет доступной позиции для маркера');
      return;
    }
    
    // Если у пользователя нет ключа доступа, проверяем, что метка находится в разрешенной зоне
    if (!hasAccessKey && userLocation) {
      const isWithinRadius = isPointWithinRadius(
        userLocation.lat,
        userLocation.lng,
        position.lat,
        position.lng,
        LOCATION_RADIUS_KM
      );
      
      if (!isWithinRadius) {
        alert(`Без ключа доступа вы можете добавлять метки только в радиусе ${LOCATION_RADIUS_KM} км от вашего местоположения`);
        return;
      }
    }
    
    try {
      // Сохраняем метку на сервере
      const newMarker = await addMapMarkerApi(position.lat, position.lng, message);
      
      // Удаляем временный перемещаемый маркер, если он есть
      if (map && draggableMarker) {
        map.removeLayer(draggableMarker);
      }
      
      // Добавляем постоянную метку (теперь это делается через useEffect)
      // addMapMarker(map, position.lat, position.lng, message);
      
      // Уведомляем родительский компонент
      if (onMarkerAdded) {
        onMarkerAdded(newMarker);
      }
      
      // Очищаем состояния
      setDraggableMarker(null);
      setMarkerFormPosition(null);
      setOriginalPosition(null);
    } catch (error) {
      console.error('Ошибка при добавлении метки:', error);
      alert('Не удалось добавить метку. Попробуйте снова.');
    }
  };

  // Отмена создания метки
  const cancelMarkerCreation = () => {
    if (map && draggableMarker) {
      // Удаляем связанный контрол подтверждения, если он существует
      if (draggableMarker.confirmControl) {
        map.removeControl(draggableMarker.confirmControl);
      }
      map.removeLayer(draggableMarker);
    }
    setDraggableMarker(null);
    setMarkerFormPosition(null);
    setOriginalPosition(null);

    // Если был режим указания, отключаем его
    if (pointingMode) {
      disablePointingMode();
    }
  };

  // Определение текущего местоположения
  const locateUser = () => {
    setIsLocating(true);
    setLocationError(null);
    
    if (!navigator.geolocation) {
      setLocationError('Геолокация не поддерживается вашим браузером');
      setIsLocating(false);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      // Успех
      (position) => {
        const { latitude, longitude } = position.coords;
        
        // Сохраняем местоположение пользователя
        setUserLocation({ lat: latitude, lng: longitude });
        
        if (map) {
          // Центрировать карту на местоположении пользователя
          centerMapOnLocation(map, latitude, longitude);
          
          // Удаляем предыдущий круг радиуса, если он был
          if (locationCircle && map.hasLayer(locationCircle)) {
            map.removeLayer(locationCircle);
          }
          
          // Если у пользователя нет ключа доступа, показываем доступную зону
          if (!hasAccessKey) {
            const circle = createDistanceCircle(map, latitude, longitude, LOCATION_RADIUS_KM, {
              color: '#4CAF50',
              fillColor: '#4CAF50',
              fillOpacity: 0.1,
              weight: 2,
              dashArray: '5, 5'
            });
            setLocationCircle(circle);
            
            // Добавляем всплывающую подсказку с информацией о зоне
            circle.bindTooltip(`Доступная зона (${LOCATION_RADIUS_KM} км)`, {
              permanent: false,
              direction: 'center'
            });
          }
          
          // Создаем маркер на текущей позиции, независимо от наличия ключа доступа
          createMarkerAtPosition(latitude, longitude, !hasAccessKey);
        }
        
        setIsLocating(false);
      },
      // Ошибка
      (error) => {
        let errorMsg = 'Не удалось определить ваше местоположение';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMsg = 'Доступ к геолокации запрещен';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMsg = 'Информация о местоположении недоступна';
            break;
          case error.TIMEOUT:
            errorMsg = 'Превышено время ожидания запроса геолокации';
            break;
          case error.UNKNOWN_ERROR:
            errorMsg = 'Произошла неизвестная ошибка при определении местоположения';
            break;
        }
        
        setLocationError(errorMsg);
        setIsLocating(false);
      },
      // Опции
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  // Проверка ключа доступа
  const checkAccessKey = (e) => {
    e.preventDefault();
    
    if (accessKeyService.validateKey(accessKey)) {
      accessKeyService.saveKey(accessKey);
      setHasAccessKey(true);
      setShowKeyModal(false);
      
      // Уведомляем пользователя о успешной активации
      if (accessKey === UNIVERSAL_KEY) {
        alert('Тестовый ключ активирован! Теперь вы можете добавлять метки в любом месте карты.');
      } else {
        alert('Ключ доступа активирован! Теперь вы можете добавлять метки в любом месте карты.');
      }
      
      // Удаляем круг ограничения, если он был
      if (locationCircle && map && map.hasLayer(locationCircle)) {
        map.removeLayer(locationCircle);
        setLocationCircle(null);
      }
    } else {
      alert('Неверный ключ доступа или ключ уже был использован');
    }
  };

  // Отображаем существующие метки с сервера
  useEffect(() => {
    if (!map) return; // Если карта не инициализирована, выходим
    
    console.log('Rendering markers from props:', markers);
    
    // Проверяем, что markers - это массив, прежде чем работать с ним
    if (!Array.isArray(markers)) {
      console.error('Markers is not an array:', markers);
      return;
    }
    
    try {
      markers.forEach(marker => {
        if (!marker) return; // Пропускаем undefined/null маркеры
        
        // Создаем уникальный id для маркера
        const markerId = marker._id || marker.id || `marker_${marker.lat}_${marker.lng}`;
        
        // Проверяем, не добавляли ли мы уже этот маркер
        if (!existingMarkersRef.current.has(markerId)) {
          console.log('Adding marker to map:', marker);
          const addedMarker = addMapMarker(map, marker.lat, marker.lng, marker.message);
          if (addedMarker) {
            // Сохраняем ссылку на созданный маркер
            existingMarkersRef.current.set(markerId, addedMarker);
          }
        }
      });
      
      // Очистка маркеров, которых больше нет в массиве
      existingMarkersRef.current.forEach((value, key) => {
        // Проверяем существует ли маркер с этим id в массиве маркеров
        const markerExists = markers.some(m => {
          if (!m) return false;
          const mId = m._id || m.id || `marker_${m.lat}_${m.lng}`;
          return mId === key;
        });
        
        if (!markerExists) {
          console.log('Removing marker that no longer exists:', key);
          if (map && map.hasLayer(value)) {
            map.removeLayer(value);
          }
          existingMarkersRef.current.delete(key);
        }
      });
    } catch (err) {
      console.error("Error rendering markers:", err);
    }
  }, [map, markers]);

  return (
    <div className="map-outer-container">
      {/* Основная карта */}
      <div 
        ref={mapContainerRef} 
        id="map-container" 
        className="map-container" 
        style={{ height: '100%', width: '100%' }}
      ></div>
      
      {/* Элементы управления картой */}
      <div className="map-controls">
        <button 
          className={`locate-button ${isLocating ? 'locating' : ''}`} 
          onClick={locateUser} 
          disabled={isLocating}
          title={hasAccessKey ? 
            "Определить ваше местоположение" : 
            "Определить ваше местоположение (необходимо для добавления меток без ключа)"}
        >
          {isLocating ? 'Определяем...' : 'Моё местоположение'}
        </button>
        
        {/* Кнопка для режима указания на карте */}
        {hasAccessKey && (
          <button 
            className={`point-on-map-button ${pointingMode ? 'active' : ''}`} 
            onClick={pointingMode ? disablePointingMode : enablePointingMode}
            title="Кликните в любое место карты для размещения маркера"
          >
            {pointingMode ? 'Отменить указание' : 'Указать на карте'}
          </button>
        )}
        
        <button 
          className={`access-key-button ${hasAccessKey ? 'active' : ''}`}
          onClick={() => setShowKeyModal(true)}
          title="Доступ с ключом для полных возможностей"
        >
          {hasAccessKey ? 'Ключ активен' : 'Ввести ключ'}
        </button>

        <button 
          className="help-button"
          onClick={() => setShowAccessKeyHelp(!showAccessKeyHelp)}
        >
          ?
        </button>
        
        {locationError && <div className="location-error">{locationError}</div>}
        
        {showAccessKeyHelp && (
          <div className="access-key-help">
            <p>С ключом доступа вы можете добавлять метки в любом месте карты.</p>
            <p>Без ключа можно добавлять метки только рядом с вашим местоположением.</p>
            {hasAccessKey && (
              <p><strong>Совет:</strong> Используйте кнопку "Указать на карте" для более удобного выбора местоположения метки.</p>
            )}
            <button onClick={() => setShowAccessKeyHelp(false)} className="close-help-button">
              Закрыть
            </button>
          </div>
        )}
        
        {!hasAccessKey && userLocation && (
          <div className="location-info">
            <p>Вы можете добавлять метки в радиусе {LOCATION_RADIUS_KM} км от вашего местоположения</p>
          </div>
        )}
      </div>
      
      {/* Модальное окно для ввода ключа доступа */}
      {showKeyModal && (
        <div className="key-modal-overlay">
          <div className="key-modal">
            <h3>Ввод ключа доступа</h3>
            <p>Введите ключ для доступа к расширенным возможностям</p>
            <div className="universal-key-hint">
              <em>Тестовый ключ: {UNIVERSAL_KEY}</em>
            </div>
            <form onSubmit={checkAccessKey}>
              <input 
                type="text" 
                value={accessKey}
                onChange={(e) => setAccessKey(e.target.value)}
                placeholder="Введите ключ доступа"
                className="key-input"
              />
              <div className="key-modal-buttons">
                <button type="submit" className="submit-button">Проверить</button>
                <button 
                  type="button" 
                  className="cancel-button"
                  onClick={() => setShowKeyModal(false)}
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Форма для добавления сообщения к метке */}
      {markerFormPosition && (
        <div 
          className="marker-form-container" 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1000,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.5)'
          }}
        >
          <div className="marker-form-popup">
            <h3>Добавление метки</h3>
            <MarkerForm
              onSubmit={handleMarkerFormSubmit}
              onCancel={cancelMarkerCreation}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Map;
