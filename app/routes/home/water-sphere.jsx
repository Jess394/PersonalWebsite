import { useTheme } from '~/components/theme-provider';
import { Transition } from '~/components/transition';
import { useEffect, useRef } from 'react';
import {
  AmbientLight,
  DirectionalLight,
  LinearSRGBColorSpace,
  Mesh,
  ShaderMaterial,
  PerspectiveCamera,
  Scene,
  SphereGeometry,
  Vector2,
  WebGLRenderer,
} from 'three';
import { cleanRenderer, cleanScene, removeLights } from '~/utils/three';
import fragmentShader from './water-sphere-fragment.glsl?raw';
import vertexShader from './water-sphere-vertex.glsl?raw';
import styles from './water-sphere.module.css';
import { gsap } from 'gsap';

export const WaterSphere = props => {
  const { theme } = useTheme();
  const canvasRef = useRef();
  const mouse = useRef(new Vector2(0.8, 0.5));
  const renderer = useRef();
  const camera = useRef();
  const scene = useRef();
  const lights = useRef();
  const uniforms = useRef();
  const material = useRef();
  const geometry = useRef();
  const sphere = useRef();

  useEffect(() => {
    const { innerWidth, innerHeight } = window;

    renderer.current = new WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
    });
    renderer.current.setSize(innerWidth, innerHeight);
    renderer.current.setPixelRatio(window.devicePixelRatio);
    renderer.current.outputColorSpace = LinearSRGBColorSpace;

    camera.current = new PerspectiveCamera(54, innerWidth / innerHeight, 0.1, 100);
    camera.current.position.z = 50;

    scene.current = new Scene();

    // === SHADER MATERIAL ===
    material.current = new ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        mouse: { value: mouse.current },
      },
      vertexShader,
      fragmentShader,
      side: 2,
    });

    // === GEOMETRY & MESH ===
    geometry.current = new SphereGeometry(20, 128, 128);
    sphere.current = new Mesh(geometry.current, material.current);
    scene.current.add(sphere.current);

    // === LIGHTING ===
    const dirLight = new DirectionalLight(0xffffff, theme === 'light' ? 1.5 : 2.0);
    const ambientLight = new AmbientLight(0xffffff, theme === 'light' ? 0.8 : 0.4);
    dirLight.position.set(50, 50, 50);

    lights.current = [dirLight, ambientLight];
    lights.current.forEach(light => scene.current.add(light));

    return () => {
      cleanScene(scene.current);
      cleanRenderer(renderer.current);
      removeLights(lights.current);
    };
  }, []);

  useEffect(() => {
    // === MOUSE MOVEMENT FOR RIPPLE EFFECT ===
    const onMouseMove = event => {
      mouse.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(event.clientY / window.innerHeight) * 2 + 1;

      gsap.to(sphere.current.rotation, {
        x: mouse.current.y * 0.5,
        y: mouse.current.x * 0.5,
        duration: 0.5,
        ease: 'power2.out',
      });

      material.current.uniforms.mouse.value.set(mouse.current.x, mouse.current.y);
    };

    window.addEventListener('mousemove', onMouseMove);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  useEffect(() => {
    let animation;
    const animate = () => {
      animation = requestAnimationFrame(animate);
      material.current.uniforms.time.value += 0.05;
      renderer.current.render(scene.current, camera.current);
    };
    animate();

    return () => {
      cancelAnimationFrame(animation);
    };
  }, []);

  return (
    <Transition in timeout={3000} nodeRef={canvasRef}>
      {({ visible, nodeRef }) => (
        <canvas
          aria-hidden
          className={styles.canvas}
          data-visible={visible}
          ref={nodeRef}
          {...props}
        />
      )}
    </Transition>
  );
};
