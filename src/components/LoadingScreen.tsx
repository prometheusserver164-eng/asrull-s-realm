import { useRef, useMemo, Suspense, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";

// Generate random points in a sphere
function generateSpherePoints(count: number, radius: number) {
  const positions = new Float32Array(count * 3);
  
  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = radius * Math.cbrt(Math.random());
    
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
  }
  
  return positions;
}

function ParticleField() {
  const pointsRef = useRef<THREE.Points>(null);
  const pointsRef2 = useRef<THREE.Points>(null);
  
  const particleCount = 5000;
  const particleCount2 = 2000;
  
  const positions = useMemo(() => generateSpherePoints(particleCount, 2.5), []);
  const positions2 = useMemo(() => generateSpherePoints(particleCount2, 3.5), []);
  
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    if (pointsRef.current) {
      pointsRef.current.rotation.x = time * 0.1;
      pointsRef.current.rotation.y = time * 0.15;
    }
    
    if (pointsRef2.current) {
      pointsRef2.current.rotation.x = -time * 0.05;
      pointsRef2.current.rotation.y = -time * 0.08;
    }
  });
  
  return (
    <>
      <Points ref={pointsRef} positions={positions} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#14F1D9"
          size={0.015}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.8}
        />
      </Points>
      <Points ref={pointsRef2} positions={positions2} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#0ea5e9"
          size={0.008}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.5}
        />
      </Points>
    </>
  );
}

function FloatingCore() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    if (meshRef.current) {
      meshRef.current.rotation.x = time * 0.5;
      meshRef.current.rotation.y = time * 0.3;
      meshRef.current.scale.setScalar(1 + Math.sin(time * 2) * 0.1);
    }
  });
  
  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[0.3, 1]} />
      <meshBasicMaterial color="#14F1D9" wireframe transparent opacity={0.6} />
    </mesh>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <ParticleField />
      <FloatingCore />
    </>
  );
}

interface LoadingScreenProps {
  onLoadingComplete?: () => void;
  minDuration?: number;
}

export function LoadingScreen({ onLoadingComplete, minDuration = 2500 }: LoadingScreenProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    const startTime = Date.now();
    
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / minDuration) * 100, 100);
      setProgress(newProgress);
      
      if (newProgress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setIsVisible(false);
          onLoadingComplete?.();
        }, 300);
      }
    }, 50);
    
    return () => clearInterval(interval);
  }, [minDuration, onLoadingComplete]);
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center overflow-hidden"
        >
          {/* 3D Canvas */}
          <div className="absolute inset-0">
            <Canvas
              camera={{ position: [0, 0, 5], fov: 60 }}
              gl={{ antialias: true, alpha: true }}
            >
              <Suspense fallback={null}>
                <Scene />
              </Suspense>
            </Canvas>
          </div>
          
          {/* Overlay Content */}
          <div className="relative z-10 flex flex-col items-center">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="mb-8"
            >
              <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground">
                Asrull<span className="text-primary">.</span>
              </h1>
            </motion.div>
            
            {/* Loading Bar */}
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 200 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="relative"
            >
              <div className="w-48 md:w-64 h-1 bg-border/30 rounded-full overflow-hidden backdrop-blur-sm">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                  style={{ width: `${progress}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>
              
              {/* Progress Text */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-center mt-4 text-sm text-foreground-muted"
              >
                {Math.round(progress)}%
              </motion.p>
            </motion.div>
            
            {/* Loading Text */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0.5, 1] }}
              transition={{ delay: 0.8, duration: 2, repeat: Infinity }}
              className="mt-6 text-foreground-secondary text-sm tracking-wider uppercase"
            >
              Loading Experience
            </motion.p>
          </div>
          
          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-background pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
