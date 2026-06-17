import * as THREE from 'three';

export function setupScene(renderer){
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x9fb8c8, 0.0006);
  const camera = new THREE.PerspectiveCamera(75, innerWidth/innerHeight, 0.1, 10000);
  camera.position.set(0,1.2,0);

  // Directional sun
  const sun = new THREE.DirectionalLight(0xffffff, 1.2);
  sun.position.set(100,200,100);
  sun.castShadow = true;
  sun.shadow.camera.left = -200; sun.shadow.camera.right = 200;
  sun.shadow.camera.top = 200; sun.shadow.camera.bottom = -200;
  sun.shadow.mapSize.set(2048,2048);
  scene.add(sun);

  // Ambient
  scene.add(new THREE.AmbientLight(0x404050, 0.6));

  // Ground plane (large)
  const groundMat = new THREE.MeshStandardMaterial({ color: 0x6b5f3a, roughness: 1.0 });
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(20000,20000), groundMat);
  ground.rotation.x = -Math.PI/2;
  ground.receiveShadow = true;
  scene.add(ground);

  // Skybox / environment
  const loader = new THREE.CubeTextureLoader();
  const env = loader.load([
    '/assets/textures/skybox_posx.jpg','/assets/textures/skybox_negx.jpg',
    '/assets/textures/skybox_posy.jpg','/assets/textures/skybox_negy.jpg',
    '/assets/textures/skybox_posz.jpg','/assets/textures/skybox_negz.jpg'
  ]);
  env.encoding = THREE.sRGBEncoding;
  scene.background = env;
  scene.environment = env;

  return { scene, camera, lights: { sun } };
}
