varying vec3 vNormal;
varying vec3 vPosition;

void main() {
  // Define color palette
  vec3 lightGreen = vec3(0.31, 0.78, 0.47); // Emerald Green
  vec3 darkGreen = vec3(0.02, 0.18, 0.10);  // Deep Forest Green

  // Compute intensity based on lighting
  float intensity = dot(normalize(vNormal), vec3(0.0, 0.0, 1.0));

  // Compute a height-based factor (darker at the bottom)
  float heightFactor = smoothstep(-10.0, 10.0, vPosition.y);
  float finalIntensity = intensity * 0.6 + heightFactor * 0.4;

  // Blend colors based on final intensity
  vec3 color = mix(darkGreen, lightGreen, finalIntensity);

  gl_FragColor = vec4(color, 1.0);
}
