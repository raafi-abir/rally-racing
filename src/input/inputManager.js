export class InputManager {
  constructor(){
    this.steer = 0;
    this.throttle = 0;
    this.brake = 0;
    this.handbrake = false;
    this.cameraToggle = false;
    this._keys = {};
    this._gamepadIndex = null;
    window.addEventListener('keydown', e => this._onKey(e, true));
    window.addEventListener('keyup', e => this._onKey(e, false));
    window.addEventListener('gamepadconnected', e => this._onGamepadConnect(e));
  }
  _onKey(e, down){
    this._keys[e.code] = down;
    if(e.code === 'KeyC' && down) this.cameraToggle = true;
    if(e.code === 'Escape' && down) document.dispatchEvent(new CustomEvent('togglePause'));
  }
  _onGamepadConnect(e){ this._gamepadIndex = e.gamepad.index; }
  update(){
    // Keyboard mapping
    const left = this._keys['KeyA'] ? 1 : 0;
    const right = this._keys['KeyD'] ? 1 : 0;
    this.steer = (right - left);
    this.throttle = this._keys['KeyW'] ? 1 : 0;
    this.brake = this._keys['KeyS'] ? 1 : 0;
    this.handbrake = !!this._keys['Space'];
    // Gamepad
    if(this._gamepadIndex !== null){
      const gp = navigator.getGamepads()[this._gamepadIndex];
      if(gp){
        const lx = gp.axes[0];
        this.steer = Math.abs(lx) > 0.12 ? lx : 0;
        this.throttle = gp.buttons[7]?.value || 0;
        this.brake = gp.buttons[6]?.value || 0;
        this.handbrake = gp.buttons[0]?.pressed || this.handbrake;
      }
    }
  }
}
