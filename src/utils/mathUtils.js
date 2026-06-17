export function clamp(v, a, b){ return Math.max(a, Math.min(b, v)); }
export function lerp(a,b,t){ return a + (b-a)*t; }
export function randomInRange(a,b){ return a + Math.random()*(b-a); }
