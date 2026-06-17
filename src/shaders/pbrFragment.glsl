precision highp float;
varying vec3 vNormal;
varying vec2 vUv;
uniform vec3 albedo;
uniform float roughness;
uniform float metalness;
void main(){
  vec3 N = normalize(vNormal);
  vec3 color = albedo;
  // Very simplified PBR-like shading
  float ndotl = clamp(dot(N, vec3(0.0,1.0,0.0)), 0.0, 1.0);
  vec3 diffuse = color * ndotl;
  vec3 spec = vec3(0.04) * (1.0 - roughness);
  gl_FragColor = vec4(diffuse + spec * metalness, 1.0);
}
