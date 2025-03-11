import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export function initGlobe(container) {
  console.log("initGlobe called with container:", container);
  
  // Проверяем, что THREE загружен
  if (!window.THREE && !THREE) {
    console.error('THREE.js не загружен!');
    container.innerHTML = '<div style="color: red; padding: 20px;">Ошибка: THREE.js не загружен</div>';
    return null;
  }

  // Используем переданный контейнер
  if (!container) {
    console.error('Контейнер для глобуса не найден!');
    return null;
  }

  // Устанавливаем минимальные размеры контейнера
  if (container.clientWidth < 100 || container.clientHeight < 100) {
    console.warn('Контейнер слишком маленький, применяем минимальные размеры');
    container.style.minWidth = '300px';
    container.style.minHeight = '300px';
  }

  // Проверка поддержки WebGL
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
    // Создаем сцену
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    
    // Получаем размеры контейнера с гарантированными минимальными значениями
    const width = Math.max(container.clientWidth, 300);
    const height = Math.max(container.clientHeight, 300);
    console.log('Globe container dimensions:', width, height);
    
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true 
    });
    
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    // Очищаем контейнер и добавляем renderer
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);
    
    // Добавляем освещение
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 3, 5);
    scene.add(directionalLight);
    
    // Загружаем текстуры
    const textureLoader = new THREE.TextureLoader();
    textureLoader.crossOrigin = 'anonymous';
    
    // Создаем земной шар с заглушкой текстуры
    const earthGeometry = new THREE.SphereGeometry(5, 64, 64);
    
    // Создаем материал с градиентом как запасной вариант
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const context = canvas.getContext('2d');
    
    // Создаем градиент для океана и суши
    const gradient = context.createLinearGradient(0, 0, 0, 256);
    gradient.addColorStop(0, '#1034a6'); // Темно-синий вверху
    gradient.addColorStop(1, '#0a7e8c'); // Сине-зеленый внизу
    context.fillStyle = gradient;
    context.fillRect(0, 0, 512, 256);
    
    // Добавляем случайные острова (континенты)
    context.fillStyle = '#3d5a1a'; // Зеленый для суши
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 256;
      const radius = 10 + Math.random() * 30;
      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fill();
    }
    
    // Создаем текстуру из канваса
    const fallbackTexture = new THREE.CanvasTexture(canvas);
    
    // Применяем временный материал
    const earthMaterial = new THREE.MeshPhongMaterial({
      map: fallbackTexture,
      specular: new THREE.Color(0x333333),
      shininess: 5
    });
    
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(earth);
    
    // Пытаемся загрузить основную текстуру
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
    
    // Настройка положения камеры
    camera.position.z = 15;
    
    // Добавляем OrbitControls для интерактивности
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 6;
    controls.maxDistance = 30;
    controls.enablePan = false;
    controls.autoRotate = true; // Включаем автоматическое вращение
    controls.autoRotateSpeed = 0.5; // Скорость автоматического вращения
    
    // Отслеживаем взаимодействие с контролями
    let userInteracting = false;
    controls.addEventListener('start', () => {
      userInteracting = true;
      controls.autoRotate = false; // Отключаем автоматическое вращение при взаимодействии
    });
    
    controls.addEventListener('end', () => {
      userInteracting = false;
      setTimeout(() => {
        if (!userInteracting) {
          controls.autoRotate = true; // Включаем автоматическое вращение через 2 секунды бездействия
        }
      }, 2000);
    });
    
    // Функция анимации
    function animate() {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }
    
    animate();
    
    // Обработка изменения размера окна
    function handleResize() {
      const width = Math.max(container.clientWidth, 300);
      const height = Math.max(container.clientHeight, 300);
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    }
    
    window.addEventListener('resize', handleResize);
    
    // Добавляем обработку для случая, когда контейнер меняет размер без события resize
    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    
    resizeObserver.observe(container);
    
    console.log("Globe initialization successful");
    
    return { 
      scene, 
      earth, 
      camera, 
      controls,
      // Метод для очистки ресурсов при размонтировании
      cleanup: function() {
        console.log("Cleaning up globe resources");
        window.removeEventListener('resize', handleResize);
        resizeObserver.disconnect();
        
        // Освобождаем память от текстур и геометрий
        earth.geometry.dispose();
        earth.material.dispose();
        if (earth.material.map) earth.material.map.dispose();
        
        // Удаляем всё из сцены
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
    container.innerHTML = '<div style="color: red; padding: 20px;">Ошибка при инициализации 3D глобуса: ' + err.message + '</div>';
    return null;
  }
}
