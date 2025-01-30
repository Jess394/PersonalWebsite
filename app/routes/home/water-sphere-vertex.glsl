uniform float time;
uniform vec2 mouse;
varying vec3 vNormal;
varying vec3 vPosition;

void main() {
  vNormal = normal;
  vPosition = position;

  // Calculate ripple effect
  float dist = length(uv - mouse);
  float ripple = sin(140.0 * dist - time * 3.0) * .75 * exp(-dist * .75);

  vec3 newPosition = position + normal * ripple;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}
