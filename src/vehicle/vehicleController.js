import * as THREE from 'three';

export class VehicleController {
  constructor(scene, physics){
    this.scene = scene;
    this.physics = physics;
    this.cameraMode = 0; // 0 cockpit,1 hood,2 chase
    this._buildVisuals();
    this._setupDashboard();
  }

  _buildVisuals(){
    // Procedural rally car body
    const body = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color: 0xff3333, metalness: 0.6, roughness: 0.4 });
    const chassis = new THREE.Mesh(new THREE.BoxGeometry(2.2,0.5,4.2), mat);
    chassis.position.y = 0.7;
    chassis.castShadow = true;
    body.add(chassis);

    // Wheels
    this.wheels = [];
    const wheelGeo = new THREE.CylinderGeometry(0.34,0.34,0.25,16);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.2, roughness: 0.8 });
    const positions = [[-0.9,0.34,1.5],[0.9,0.34,1.5],[-0.9,0.34,-1.5],[0.9,0.34,-1.5]];
    for(let i=0;i<4;i++){
      const w = new THREE.Mesh(wheelGeo, wheelMat);
      w.rotation.z = Math.PI/2;
      w.position.set(...positions[i]);
      w.castShadow = true;
      body.add(w);
      this.wheels.push(w);
    }

    // Steering wheel (animated)
    const sw = new THREE.Mesh(new THREE.TorusGeometry(0.18,0.02,8,24), new THREE.MeshStandardMaterial({color:0x222222}));
    sw.position.set(0,1.05,0.6);
    sw.rotation.x = Math.PI/2;
    body.add(sw);
    this.steeringWheel = sw;

    // Headlights
    const headL = new THREE.SpotLight(0xfff8e8, 2, 40, Math.PI/6, 0.2);
    headL.position.set(0.6,0.9,2.2);
    headL.target.position.set(0.6,0.9,6);
    headL.castShadow = true;
    body.add(headL);
    body.add(headL.target);
    this.headlights = headL;

    // Add to scene
    this.car = body;
    this.scene.add(this.car);

    // Camera rig
    this.cameraRig = new THREE.Object3D();
    this.cameraRig.position.set(0,1.2,0);
    this.car.add(this.cameraRig);
  }

  _setupDashboard(){
    // Simple digital dashboard values exposed for UI
    this.dashboard = {
      speed: 0,
      rpm: 0,
      gear: 1,
      damage: 0
    };
  }

  reset(){
    this.physics.reset();
    this.car.position.copy(this.physics.position);
    this.car.rotation.y = this.physics.yaw;
  }

  update(dt, input){
    // Sync visual with physics
    this.car.position.copy(this.physics.position);
    this.car.rotation.y = this.physics.yaw;

    // Wheel rotation visuals
    const wheelSpin = this.physics.velocity.length() * 10;
    for(let i=0;i<4;i++){
      this.wheels[i].rotation.x += wheelSpin * dt;
    }
    // Steering wheel animation
    this.steeringWheel.rotation.z = -input.steer * 0.9;

    // Dashboard
    this.dashboard.speed = Math.round(this.physics.velocity.length() * 3.6);
    this.dashboard.rpm = Math.round(this.physics.rpm);
    this.dashboard.gear = this.physics.gear;
    this.dashboard.damage = this.physics.damage;

    // Headlights toggle by time of day (simple)
    const hour = (performance.now() / 1000 / 60) % 24;
    this.headlights.intensity = (hour < 6 || hour > 18) ? 2.0 : 0.0;
  }
}
