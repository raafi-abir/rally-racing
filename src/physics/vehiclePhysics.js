import * as THREE from 'three';
import { clamp, lerp } from '../utils/mathUtils.js';

export class VehiclePhysics {
  constructor(){
    // Vehicle state
    this.position = new THREE.Vector3(0,2,0);
    this.velocity = new THREE.Vector3();
    this.forward = new THREE.Vector3(0,0,1);
    this.yaw = 0;
    this.angularVelocity = 0;
    this.wheelAngular = [0,0,0,0];
    this.gear = 1;
    this.rpm = 800;
    this.damage = 0;
    this.engineOn = true;

    // Parameters
    this.mass = 1400;
    this.wheelBase = 2.6;
    this.cgHeight = 0.55;
    this.maxTorque = 420; // Nm
    this.gearRatios = [0, 3.6, 2.2, 1.5, 1.1, 0.9, 0.7];
    this.finalDrive = 3.4;
    this.engineRedline = 7500;
    this.idleRPM = 800;
    this.dragCoeff = 0.4257;
    this.rollingResistance = 12.8;
    this.suspensionRest = 0.3;
    this.suspensionStiffness = 35000;
    this.tireGrip = 1.0;
    this.handbrakeGrip = 0.35;
    this.brakeForce = 12000;
    this.maxSteer = 0.45; // radians
  }

  reset(){
    this.position.set(0,2,0);
    this.velocity.set(0,0,0);
    this.yaw = 0;
    this.gear = 1;
    this.rpm = this.idleRPM;
    this.damage = 0;
  }

  step(dt, input){
    // Engine torque curve (simple)
    const rpmNorm = clamp((this.rpm - 1000) / (this.engineRedline - 1000), 0, 1);
    const torque = this.maxTorque * (1 - 0.2 * rpmNorm) * (1 - this.damage*0.6);

    // Automatic gearbox logic
    const speedKph = this.velocity.length() * 3.6;
    if(this.gear < this.gearRatios.length-1 && speedKph > (this.gear*30 + 10)) this.gear++;
    if(this.gear > 1 && speedKph < (this.gear*15)) this.gear--;

    // Drive torque to wheels
    const driveRatio = this.gearRatios[this.gear] * this.finalDrive;
    const wheelTorque = torque * input.throttle * driveRatio * 0.9;

    // Wheel angular velocity update (simplified)
    const wheelRadius = 0.34;
    const wheelAngAcc = wheelTorque / (0.5 * 20); // inertia approx
    for(let i=0;i<4;i++){
      this.wheelAngular[i] += wheelAngAcc * dt;
    }

    // Longitudinal force
    const traction = wheelTorque / wheelRadius;
    const brake = input.brake ? this.brakeForce * input.brake : 0;
    const handbrake = input.handbrake ? this.brakeForce * this.handbrakeGrip : 0;
    const totalBrake = brake + handbrake;

    // Aerodynamic drag and rolling resistance
    const drag = this.velocity.clone().multiplyScalar(-this.dragCoeff * this.velocity.length());
    const rolling = this.velocity.clone().multiplyScalar(-this.rollingResistance);

    // Lateral tire model (simplified Pacejka-like)
    const lateralSlip = -this.angularVelocity * this.wheelBase * 0.5;
    const lateralForce = lateralSlip * -this.tireGrip * 2000 * (1 - this.damage*0.5);

    // Weight transfer (affects grip)
    const longitudinalAccel = (traction - totalBrake) / this.mass;
    const weightTransfer = (longitudinalAccel * this.cgHeight / this.wheelBase) * this.mass;

    // Update velocity
    const forwardDir = new THREE.Vector3(Math.sin(this.yaw), 0, Math.cos(this.yaw));
    const accel = forwardDir.clone().multiplyScalar((traction - totalBrake) / this.mass).add(drag).add(rolling);
    this.velocity.add(accel.multiplyScalar(dt));

    // Apply lateral force as angular velocity change (under/oversteer)
    const steerInput = clamp(input.steer, -1, 1);
    const steerAngle = steerInput * this.maxSteer * (1 - Math.min(0.6, this.velocity.length() / 40));
    // yaw change from steering and lateral slip
    const yawRate = (this.velocity.length() / this.wheelBase) * Math.tan(steerAngle) + lateralForce / (this.mass * 0.5);
    this.yaw += yawRate * dt;
    this.angularVelocity = yawRate;

    // Position update
    const displacement = this.velocity.clone().multiplyScalar(dt);
    this.position.add(displacement);

    // RPM update from wheel speed
    const wheelSpeed = this.velocity.length() / wheelRadius;
    const engineSpeed = Math.abs(wheelSpeed * driveRatio * 60 / (2*Math.PI));
    // Blend engine RPM with wheel-derived RPM when throttle engaged
    this.rpm = clamp(lerp(this.rpm, Math.max(this.idleRPM, engineSpeed), 0.2), this.idleRPM, this.engineRedline);

    // Damage from high impacts (simple)
    if(this.velocity.length() > 45 && Math.random() < 0.001) {
      this.damage = clamp(this.damage + 0.05, 0, 1);
    }
  }
}
