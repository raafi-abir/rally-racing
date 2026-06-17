import * as THREE from 'three';
export class UIManager {
  constructor(root, vehicle, track){
    this.root = root;
    this.vehicle = vehicle;
    this.track = track;
    this._buildHUD();
    this._timer = 0;
    this._running = false;
    this._best = null;
    document.addEventListener('togglePause', ()=> this.togglePause());
  }

  _buildHUD(){
    const hud = document.createElement('div'); hud.className = 'hud';
    hud.innerHTML = `<div class="speed" id="speed">0 km/h</div><div class="gear" id="gear">N</div><div class="small" id="timer">00:00.000</div>`;
    this.root.appendChild(hud);
    this.speedEl = hud.querySelector('#speed');
    this.gearEl = hud.querySelector('#gear');
    this.timerEl = hud.querySelector('#timer');

    // Topbar
    const top = document.createElement('div'); top.className = 'topbar';
    top.innerHTML = `<span id="stage">Stage: Procedural Rally</span>`;
    this.root.appendChild(top);

    // Minimap placeholder
    const mm = document.createElement('div'); mm.className = 'minimap';
    this.root.appendChild(mm);

    // Pause overlay
    this.pauseOverlay = document.createElement('div'); this.pauseOverlay.className = 'center-ui';
    this.pauseOverlay.style.display = 'none';
    this.pauseOverlay.innerHTML = `<div class="pause-menu"><div class="button" id="resume">Resume</div><div class="button" id="restart">Restart</div></div>`;
    this.root.appendChild(this.pauseOverlay);
    this.pauseOverlay.querySelector('#resume').addEventListener('click', ()=> this.togglePause());
    this.pauseOverlay.querySelector('#restart').addEventListener('click', ()=> this._emit('restart'));
  }

  update(dt, physics, vehicle){
    this.speedEl.textContent = `${vehicle.dashboard.speed} km/h`;
    this.gearEl.textContent = vehicle.dashboard.gear > 0 ? vehicle.dashboard.gear : 'R';
    if(this._running) this._timer += dt;
    this.timerEl.textContent = this._formatTime(this._timer);
  }

  _formatTime(t){
    const ms = Math.floor((t % 1) * 1000);
    const s = Math.floor(t) % 60;
    const m = Math.floor(t / 60);
    return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}.${String(ms).padStart(3,'0')}`;
  }

  togglePause(){
    this._running = !this._running;
    this.pauseOverlay.style.display = this._running ? 'none' : 'block';
    this._emit('togglePause');
  }

  resetTimer(){ this._timer = 0; this._running = true; }

  on(evt, cb){
    this._callbacks = this._callbacks || {};
    this._callbacks[evt] = this._callbacks[evt] || [];
    this._callbacks[evt].push(cb);
  }
  _emit(evt, data){ (this._callbacks?.[evt]||[]).forEach(cb=>cb(data)); }
}
