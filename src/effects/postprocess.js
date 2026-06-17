import * as THREE from 'three';
import { Renderer } from '../renderer.js';

export class PostProcess {
  constructor(renderer, camera){
    this.renderer = renderer;
    this.camera = camera;
    // Motion blur and bloom are configured in renderer.setupPost
  }

  render(scene, camera){
    // Camera smoothing for cockpit feel
    // Slight head-bob from velocity
    const speed = scene.userData?.vehicleSpeed || 0;
    camera.position.y = 1.2 + Math.sin(performance.now()/200)*0.002*speed;
    this.renderer.render(scene, camera);
  }
}
