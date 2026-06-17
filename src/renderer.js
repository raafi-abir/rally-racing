import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js';

export class Renderer {
  constructor(canvas){
    this.canvas = canvas;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.composer = null;
    window.addEventListener('resize', ()=> this.onResize());
    this.onResize();
  }
  onResize(){
    const w = this.canvas.clientWidth || innerWidth;
    const h = this.canvas.clientHeight || innerHeight;
    this.renderer.setSize(w, h, false);
    if(this.composer){
      this.composer.setSize(w, h);
    }
  }
  setupPost(scene, camera){
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(new THREE.Vector2(this.canvas.width, this.canvas.height), 0.6, 0.8, 0.1);
    bloom.threshold = 0.2; bloom.strength = 0.8; bloom.radius = 0.2;
    this.composer.addPass(bloom);
    const smaa = new SMAAPass(this.canvas.width, this.canvas.height);
    this.composer.addPass(smaa);
  }
  render(scene, camera){
    if(!this.composer) this.setupPost(scene, camera);
    this.composer.render();
  }
}
