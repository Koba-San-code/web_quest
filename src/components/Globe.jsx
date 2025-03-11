import React, { useEffect, useRef, useState } from 'react';
import { initGlobe } from './globeHelper';

const Globe = () => {
  const containerRef = useRef(null);
  const globeInstanceRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("Globe component mounted, container:", containerRef.current);
    
    // Небольшая задержка для гарантии, что контейнер полностью отрисован
    setTimeout(() => {
      if (containerRef.current) {
        try {
          console.log("Initializing globe with container dimensions:", 
                    containerRef.current.clientWidth, "x", containerRef.current.clientHeight);
          
          globeInstanceRef.current = initGlobe(containerRef.current);
          
          if (!globeInstanceRef.current) {
            setError("Не удалось инициализировать глобус. Проверьте консоль для деталей.");
          }
        } catch (err) {
          console.error('Ошибка при инициализации глобуса в компоненте:', err);
          setError(`Ошибка: ${err.message}`);
        }
      } else {
        console.error('Контейнер для глобуса не доступен');
        setError("Контейнер для глобуса недоступен");
      }
    }, 100);
    
    return () => {
      if (globeInstanceRef.current?.cleanup) {
        try {
          globeInstanceRef.current.cleanup();
        } catch (err) {
          console.error('Ошибка при очистке ресурсов глобуса:', err);
        }
      }
    };
  }, []);

  return (
    <div ref={containerRef} id="globe-container" className="globe-container" style={{minHeight: "500px"}}>
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default Globe;
