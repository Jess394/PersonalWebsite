import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { gsap } from "gsap";

const WaterSphere = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    // === THREE.JS SETUP ===
    const currentMount = mountRef.current;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xA1E8AF); // Black background

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      currentMount.clientWidth / currentMount.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 50;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    currentMount.appendChild(renderer.domElement);

    // === LIGHTING ===
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(50, 50, 50);
    scene.add(directionalLight);

    // === CREATE SPHERE GEOMETRY ===
    const geometry = new THREE.SphereGeometry(20, 128, 128);

    // === SHADER MATERIAL (Water Effect) ===
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 }, // Animation time
        mouse: { value: new THREE.Vector2(0, 0) }, // Mouse position
      },
      vertexShader: `
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
      `,
      fragmentShader: `
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

      `,
      side: THREE.DoubleSide,
    });

    // Mesh
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    // === MOUSE INTERACTION ===
    const mouse = new THREE.Vector2();
    window.addEventListener("mousemove", (event) => {
      // Normalize mouse position (-1 to 1)
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      // Update shader uniform for ripples
      material.uniforms.mouse.value.set(mouse.x * 0.5 + 0.5, mouse.y * 0.5 + 0.5);

      // Smoothly tilt the sphere
      gsap.to(sphere.rotation, {
        x: mouse.y * 0.5,
        y: mouse.x * 0.5,
        duration: 0.5,
        ease: "power2.out",
      });
    });

    // === ANIMATE LOOP ===
    const animate = () => {
      requestAnimationFrame(animate);

      // Update shader time for ripple animation
      material.uniforms.time.value += 0.05;

      renderer.render(scene, camera);
    };
    animate();

    // === RESIZE HANDLER ===
    const handleResize = () => {
      const width = currentMount.clientWidth;
      const height = currentMount.clientHeight;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    window.addEventListener("resize", handleResize);

    // === CLEANUP FUNCTION ===
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", () => {});
      currentMount.removeChild(renderer.domElement);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} style={{ width: "100vw", height: "100vh" }} />;
};

export default WaterSphere;
