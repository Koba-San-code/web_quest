import React, { useEffect, useState } from 'react';
import { initMap, addMapMarker } from './map';

const Map = () => {
  const [map, setMap] = useState(null);
  
  useEffect(() => {
    const mapInstance = initMap();
    setMap(mapInstance);
    
    // Обработка изменения размера окна
    const handleResize = () => {
      if (mapInstance) mapInstance.invalidateSize();
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMapClick = (e) => {
    // Пример обработчика для будущего добавления меток пользователями
    console.log('Можно добавить обработчик клика по карте здесь');
  };

  return <div id="map-container" className="map-container"></div>;
};

export default Map;
