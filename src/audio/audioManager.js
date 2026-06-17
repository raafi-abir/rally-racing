export class AudioManager {
  constructor(){
    this.ctx = null;
    this.engineGain = null;
    this.engineOsc = null;
    this.windGain = null;
    this.skidGain = null;
  }

  async init(){
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    // Engine: multi-layer with oscillator + noise for richness
    this.engineGain = this.ctx.createGain(); this.engineGain.gain.value = 0.6;
    this.engineOsc = this.ctx.createOscillator();
    this.engineOsc.type = 'sawtooth';
    this.engineOsc.frequency.value = 80;
    const engineFilter = this.ctx.createBiquadFilter(); engineFilter.type = 'lowpass'; engineFilter.frequency.value = 1200;
    this.engineOsc.connect(engineFilter);
    engineFilter.connect(this.engineGain);
    this.engineGain.connect(this.ctx.destination);
    this.engineOsc.start();

    // Wind
    this.windGain = this.ctx.createGain(); this.windGain.gain.value = 0.0;
    const windNoise = this._createNoiseNode();
    const windFilter = this.ctx.createBiquadFilter(); windFilter.type = 'highpass'; windFilter.frequency.value = 800;
    windNoise.connect(windFilter); windFilter.connect(this.windGain); this.windGain.connect(this.ctx.destination);

    // Skid
    this.skidGain = this.ctx.createGain(); this.skidGain.gain.value = 0.0;
    const skidNoise = this._createNoiseNode();
    const skidFilter = this.ctx.createBiquadFilter(); skidFilter.type = 'bandpass'; skidFilter.frequency.value = 1200;
    skidNoise.connect(skidFilter); skidFilter.connect(this.skidGain); this.skidGain.connect(this.ctx.destination);
  }

  _createNoiseNode(){
    const bufferSize = 2 * this.ctx.sampleRate;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for(let i=0;i<bufferSize;i++) data[i] = Math.random()*2-1;
    const node = this.ctx.createBufferSource();
    node.buffer = buffer;
    node.loop = true;
    node.start();
    return node;
  }

  update(physics, vehicle){
    // Engine pitch and volume from RPM
    const rpm = physics.rpm;
    const pitch = 80 + (rpm / physics.engineRedline) * 900;
    this.engineOsc.frequency.setTargetAtTime(pitch, this.ctx.currentTime, 0.02);
    const vol = 0.2 + (rpm / physics.engineRedline) * 0.8;
    this.engineGain.gain.setTargetAtTime(vol * (1 - physics.damage*0.5), this.ctx.currentTime, 0.02);

    // Wind volume from speed
    const speed = physics.velocity.length();
    this.windGain.gain.setTargetAtTime(Math.min(1, speed/30), this.ctx.currentTime, 0.1);

    // Skid when lateral slip high
    const slip = Math.abs(physics.angularVelocity);
    this.skidGain.gain.setTargetAtTime(Math.min(1, slip*2), this.ctx.currentTime, 0.02);
  }
}
