import React, { useEffect } from 'react';
import { initMap } from './map';

const Map = () => {
  useEffect(() => {
    initMap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div id="map-container" className="map-container"></div>;
};

export default Map;
