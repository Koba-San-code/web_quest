import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export function initGlobe(container) {
  if (!container) {
    console.error('Контейнер для глобуса не найден!');
    container.innerHTML = '<div style="color: red; padding: 20px;">Ошибка: THREE.js не загружен</div>';
    return null;
  }

  if (container.clientWidth < 100 || container.clientHeight < 100) {
    container.style.minWidth = '300px';
    container.style.minHeight = '300px';
  }

  if (!THREE.WebGLRenderer.isWebGLAvailable()) {
    const warning = document.createElement('div');
    warning.style.color = 'red';
    warning.style.padding = '20px';
    warning.style.textAlign = 'center';
    warning.innerHTML = 'Ваш браузер не поддерживает WebGL, необходимый для отображения 3D-глобуса.';
    container.appendChild(warning);
    return null;
  }

  try {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    const width = Math.max(container.clientWidth, 300);
    const height = Math.max(container.clientHeight, 300);
    
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);
    
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 3, 5);
    scene.add(directionalLight);
    
    const textureLoader = new THREE.TextureLoader();
    textureLoader.crossOrigin = 'anonymous';
    
    const earthGeometry = new THREE.SphereGeometry(5, 64, 64);
    
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const context = canvas.getContext('2d');
    const gradient = context.createLinearGradient(0, 0, 0, 256);
    gradient.addColorStop(0, '#1034a6');
    gradient.addColorStop(1, '#0a7e8c');
    context.fillStyle = gradient;
    context.fillRect(0, 0, 512, 256);
    
    context.fillStyle = '#3d5a1a';
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 256;
      const radius = 10 + Math.random() * 30;
      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fill();
    }
    
    const fallbackTexture = new THREE.CanvasTexture(canvas);
    
    const earthMaterial = new THREE.MeshPhongMaterial({
      map: fallbackTexture,
      specular: new THREE.Color(0x333333),
      shininess: 5
    });
    
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(earth);
    
    const textureUrls = [
      'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg',
      'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_atmos_2048.jpg',
      'https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg'
    ];
    
    function tryLoadTexture(index) {
      if (index >= textureUrls.length) return;
      textureLoader.load(
        textureUrls[index],
        function(texture) {
          earth.material = new THREE.MeshPhongMaterial({
            map: texture,
            specular: new THREE.Color(0x333333),
            shininess: 5
          });
        },
        undefined,
        function() {
          tryLoadTexture(index + 1);
        }
      );
    }
    
    tryLoadTexture(0);
    
    camera.position.z = 15;
    
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 6;
    controls.maxDistance = 30;
    controls.enablePan = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;
    
    let userInteracting = false;
    controls.addEventListener('start', () => {
      userInteracting = true;
      controls.autoRotate = false;
    });
    
    controls.addEventListener('end', () => {
      userInteracting = false;
      setTimeout(() => {
        if (!userInteracting) {
          controls.autoRotate = true;
        }
      }, 2000);
    });
    
    function animate() {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }
    
    animate();
    
    function handleResize() {
      const width = Math.max(container.clientWidth, 300);
      const height = Math.max(container.clientHeight, 300);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    }
    
    window.addEventListener('resize', handleResize);
    
    const resizeObserver = new ResizeObserver(() => { handleResize(); });
    resizeObserver.observe(container);
    
    return {
      scene, 
      earth, 
      camera, 
      controls,
      cleanup: function() {
        window.removeEventListener('resize', handleResize);
        resizeObserver.disconnect();
        earth.geometry.dispose();
        earth.material.dispose();
        if (earth.material.map) earth.material.map.dispose();
        while(scene.children.length > 0) { 
          const object = scene.children[0];
          scene.remove(object);
        }
        renderer.dispose();
        controls.dispose();
      }
    };
  } catch (err) {
    console.error('Ошибка при инициализации глобуса:', err);
    container.innerHTML = `<div style="color: red; padding: 20px;">Ошибка при инициализации 3D глобуса: ${err.message}</div>`;
    return null;
  }
}
