import * as THREE from 'three';

export function initGlobe() {
  const container = document.getElementById('globe-container');
  if (!container) return;

  // Создаем сцену
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);
  
  // Создаем модель Земли
  const earthGeometry = new THREE.SphereGeometry(5, 32, 32);
  const earthMaterial = new THREE.MeshBasicMaterial({ color: 0x2233ff, wireframe: true });
  const earth = new THREE.Mesh(earthGeometry, earthMaterial);
  scene.add(earth);
  
  camera.position.z = 15;
  
  // Функция анимации
  function animate() {
    requestAnimationFrame(animate);
    
    earth.rotation.y += 0.005;
    
    renderer.render(scene, camera);
  }
  
  animate();
  
  // Обработка изменения размера окна
  window.addEventListener('resize', () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });
}
