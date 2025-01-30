import { useTheme } from '~/components/theme-provider';
import { Transition } from '~/components/transition';
import { useReducedMotion, useSpring } from 'framer-motion';
import { useInViewport, useWindowSize } from '~/hooks';
import { startTransition, useEffect, useRef } from 'react';
import {
  AmbientLight,
  DirectionalLight,
  LinearSRGBColorSpace,
  Mesh,
  ShaderMaterial,
  PerspectiveCamera,
  Scene,
  SphereGeometry,
  UniformsUtils,
  Vector2,
  WebGLRenderer,
} from 'three';
import { media } from '~/utils/style';
import { throttle } from '~/utils/throttle';
import { cleanRenderer, cleanScene, removeLights } from '~/utils/three';
import fragmentShader from './water-sphere-fragment.glsl?raw';
import vertexShader from './water-sphere-vertex.glsl?raw';
import styles from './water-sphere.module.css';
import { gsap } from 'gsap';

const springConfig = {
  stiffness: 30,
  damping: 20,
  mass: 2,
};

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
  const reduceMotion = useReducedMotion();
  const isInViewport = useInViewport(canvasRef);
  const windowSize = useWindowSize();
  const rotationX = useSpring(0, springConfig);
  const rotationY = useSpring(0, springConfig);

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

    // === CAMERA SETTINGS (Copied from DisplacementSphere) ===
    camera.current = new PerspectiveCamera(54, innerWidth / innerHeight, 0.1, 100);
    camera.current.position.z = 52; // ✅ Matched to DisplacementSphere

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

    // === SPHERE GEOMETRY & POSITIONING ===
    startTransition(() => {
      geometry.current = new SphereGeometry(32, 128, 128); // ✅ Matched to original
      sphere.current = new Mesh(geometry.current, material.current);
      sphere.current.position.z = 0; // ✅ Matches original sphere's positioning
      scene.current.add(sphere.current);
    });

    // === LIGHTING ===
    const dirLight = new DirectionalLight(0xffffff, theme === 'light' ? .8 : 1);
    const ambientLight = new AmbientLight(0xffffff, theme === 'light' ? 0.2 : 0.1);
    dirLight.position.set(50, 50, 50);

    lights.current = [dirLight, ambientLight];
    lights.current.forEach(light => scene.current.add(light));

    return () => {
      cleanScene(scene.current);
      cleanRenderer(renderer.current);
      removeLights(lights.current);
    };
  }, []);

  // === RESPONSIVE POSITIONING BEHAVIOR ===
  useEffect(() => {
    const { width, height } = windowSize;

    const adjustedHeight = height + height * 0.3;
    renderer.current.setSize(width, adjustedHeight);
    camera.current.aspect = width / adjustedHeight;
    camera.current.updateProjectionMatrix();

    if (reduceMotion) {
      renderer.current.render(scene.current, camera.current);
    }

    // ✅ Position Sphere Based on Screen Width
    if (width <= media.mobile) {
      sphere.current.position.x = 14;
      sphere.current.position.y = 10;
    } else if (width <= media.tablet) {
      sphere.current.position.x = 18;
      sphere.current.position.y = 14;
    } else {
      sphere.current.position.x = 22;
      sphere.current.position.y = 16;
    }
  }, [reduceMotion, windowSize]);

  // === MOUSE INTERACTION ===
  useEffect(() => {
    const onMouseMove = throttle(event => {
      const position = {
        x: event.clientX / window.innerWidth,
        y: event.clientY / window.innerHeight,
      };

      rotationX.set(position.y / 2);
      rotationY.set(position.x / 2);
    }, 100);

    if (!reduceMotion && isInViewport) {
      window.addEventListener('mousemove', onMouseMove);
    }

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, [isInViewport, reduceMotion, rotationX, rotationY]);

  // === ANIMATION LOOP ===
  useEffect(() => {
    let animation;
    const animate = () => {
      animation = requestAnimationFrame(animate);

      if (uniforms.current !== undefined) {
        uniforms.current.time.value = 0.5 * (Date.now() - start.current);
      }

      sphere.current.rotation.z += 0.01;
      sphere.current.rotation.x = rotationX.get();
      sphere.current.rotation.y = rotationY.get();

      renderer.current.render(scene.current, camera.current);
    };

    if (!reduceMotion && isInViewport) {
      animate();
    } else {
      renderer.current.render(scene.current, camera.current);
    }

    return () => {
      cancelAnimationFrame(animation);
    };
  }, [isInViewport, reduceMotion, rotationX, rotationY]);


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
