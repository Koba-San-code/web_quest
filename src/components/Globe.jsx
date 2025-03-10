import React, { useEffect } from 'react';
import { initGlobe } from './globe';

const Globe = () => {
  useEffect(() => {
    initGlobe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div id="globe-container" className="globe-container"></div>;
};

export default Globe;
