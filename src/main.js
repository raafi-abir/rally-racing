import { Renderer } from './renderer.js';
import { setupScene } from './sceneSetup.js';
import { TrackGenerator } from './track/trackGenerator.js';
import { InputManager } from './input/inputManager.js';
import { VehiclePhysics } from './physics/vehiclePhysics.js';
import { VehicleController } from './vehicle/vehicleController.js';
import { AudioManager } from './audio/audioManager.js';
import { UIManager } from './ui/uiManager.js';
import { PostProcess } from './effects/postprocess.js';

const canvas = document.getElementById('glCanvas');
const renderer = new Renderer(canvas);
const { scene, camera, lights } = setupScene(renderer);
const trackGen = new TrackGenerator(scene);
await trackGen.generateStage({ lengthMeters: 6000 });
const input = new InputManager();
const audio = new AudioManager();
await audio.init();
const physics = new VehiclePhysics();
const vehicle = new VehicleController(scene, physics);
const ui = new UIManager(document.getElementById('ui-root'), vehicle, trackGen);
const post = new PostProcess(renderer, camera);

let last = performance.now();
let running = true;
ui.on('restart', ()=> {
  physics.reset();
  vehicle.reset();
  ui.resetTimer();
});
ui.on('togglePause', ()=> running = !running);

function loop(now){
  const dt = Math.min(0.033, (now - last) / 1000);
  last = now;
  input.update();
  if(running){
    physics.step(dt, input);
    vehicle.update(dt, input);
    audio.update(physics, vehicle);
    ui.update(dt, physics, vehicle);
    post.render(scene, camera);
  } else {
    renderer.render(scene, camera);
  }
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
