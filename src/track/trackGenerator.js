import * as THREE from 'three';
import { randomInRange } from '../utils/mathUtils.js';

export class TrackGenerator {
  constructor(scene){
    this.scene = scene;
    this.waypoints = [];
    this.roadMesh = null;
    this.checkpoints = [];
  }

  async generateStage({ lengthMeters = 6000 } = {}){
    // Procedural spline with segments: forest, mountain, gravel, dirt
    const segments = Math.max(40, Math.floor(lengthMeters / 150));
    const points = [];
    let angle = 0;
    let radius = 10;
    let x = 0, z = 0, y = 0;
    for(let i=0;i<segments;i++){
      angle += randomInRange(-0.6, 0.6);
      radius = 30 + Math.sin(i*0.2)*80 + randomInRange(-10,10);
      x += Math.cos(angle) * radius;
      z += Math.sin(angle) * radius;
      y += randomInRange(-6, 6);
      points.push(new THREE.Vector3(x, y, z));
    }
    this.waypoints = points;
    this._buildRoadMesh(points);
    this._placeEnvironment(points);
    this._createCheckpoints(points);
  }

  _buildRoadMesh(points){
    const curve = new THREE.CatmullRomCurve3(points);
    const geometry = new THREE.TubeGeometry(curve, points.length*8, 6, 8, false);
    const material = new THREE.MeshStandardMaterial({ color: 0x7a6b4a, roughness: 1.0 });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.receiveShadow = true;
    mesh.castShadow = false;
    this.scene.add(mesh);
    this.roadMesh = mesh;
  }

  _placeEnvironment(points){
    // Place trees, rocks, signs, bridges, jumps
    const treeGeo = new THREE.ConeGeometry(2.5, 8, 8);
    const treeMat = new THREE.MeshStandardMaterial({ color: 0x1f5a1f });
    for(let i=0;i<points.length;i+=2){
      const p = points[i];
      const offset = new THREE.Vector3(randomInRange(-20,20), randomInRange(-1,1), randomInRange(-20,20));
      const t = new THREE.Mesh(treeGeo, treeMat);
      t.position.copy(p).add(offset);
      t.position.y += 4;
      t.castShadow = true;
      this.scene.add(t);
    }
    // Bridges and jumps: add simple ramps at random intervals
    for(let i=10;i<points.length-10;i+=Math.floor(points.length/6)){
      const p = points[i];
      const ramp = new THREE.Mesh(new THREE.BoxGeometry(12,1,6), new THREE.MeshStandardMaterial({color:0x5b4a3a}));
      ramp.position.copy(p).add(new THREE.Vector3(0,1,0));
      ramp.rotation.y = Math.random()*Math.PI;
      ramp.castShadow = true;
      this.scene.add(ramp);
    }
  }

  _createCheckpoints(points){
    for(let i=0;i<points.length;i+=Math.floor(points.length/10)){
      const p = points[i];
      const cp = new THREE.Mesh(new THREE.RingGeometry(4,5,32), new THREE.MeshBasicMaterial({color:0xffcc33, side: THREE.DoubleSide}));
      cp.rotation.x = -Math.PI/2;
      cp.position.copy(p).add(new THREE.Vector3(0,1,0));
      this.scene.add(cp);
      this.checkpoints.push({ position: p.clone(), mesh: cp });
    }
  }
}
