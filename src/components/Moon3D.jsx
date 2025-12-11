import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, useTexture } from '@react-three/drei';
import { useRef, Suspense } from 'react';
import * as THREE from 'three';

// Moon sphere component with rotation
const Moon = () => {
  const moonRef = useRef();
  
  // Auto rotation
  useFrame((state, delta) => {
    if (moonRef.current) {
      moonRef.current.rotation.y += delta * 0.1; // Slow rotation
    }
  });

  return (
    <Sphere ref={moonRef} args={[1.5, 64, 64]}>
      <meshStandardMaterial
        color="#e8e8e8"
        roughness={0.8}
        metalness={0.1}
        emissive="#1a1a2e"
        emissiveIntensity={0.05}
      />
    </Sphere>
  );
};

// Stars background inside canvas
const Stars = () => {
  const starsRef = useRef();
  const starCount = 500;
  
  const positions = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 50;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 50;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 50;
  }

  useFrame((state, delta) => {
    if (starsRef.current) {
      starsRef.current.rotation.y += delta * 0.02;
    }
  });

  return (
    <points ref={starsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={positions.length / 3}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#ffffff"
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  );
};

// Loading fallback
const Loader = () => (
  <div className="absolute inset-0 flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const Moon3D = () => {
  return (
    <div className="moon-container w-full h-[350px] md:h-[450px] lg:h-[500px] rounded-3xl relative overflow-hidden">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          {/* Ambient light for overall illumination */}
          <ambientLight intensity={0.2} />
          
          {/* Main directional light from side */}
          <directionalLight
            position={[5, 3, 5]}
            intensity={1.5}
            color="#ffffff"
          />
          
          {/* Blue rim light */}
          <pointLight
            position={[-5, -2, 3]}
            intensity={0.5}
            color="#6366f1"
          />
          
          {/* Purple accent light */}
          <pointLight
            position={[3, 5, -2]}
            intensity={0.3}
            color="#a855f7"
          />

          <Stars />
          <Moon />
          
          {/* Enable user drag rotation */}
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate
            autoRotateSpeed={0.5}
            maxPolarAngle={Math.PI / 1.5}
            minPolarAngle={Math.PI / 3}
          />
        </Suspense>
      </Canvas>
      
      {/* Decorative glow ring */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] md:w-[280px] md:h-[280px] rounded-full border border-primary/20 animate-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250px] h-[250px] md:w-[350px] md:h-[350px] rounded-full border border-secondary/10" />
      </div>
    </div>
  );
};

export default Moon3D;
