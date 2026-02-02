import { useRef, useMemo, Suspense, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";

// Generate random scattered points
function generateRandomPoints(count: number, spread: number) {
  const positions = new Float32Array(count * 3);
  
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * spread;
    positions[i * 3 + 1] = (Math.random() - 0.5) * spread;
    positions[i * 3 + 2] = (Math.random() - 0.5) * spread;
  }
  
  return positions;
}

// Generate 3D heart shape using parametric equations
function generateHeartPoints(count: number, scale: number) {
  const positions = new Float32Array(count * 3);
  
  for (let i = 0; i < count; i++) {
    const t = (i / count) * Math.PI * 2;
    const u = Math.random() * Math.PI * 2;
    const v = Math.random();
    
    // Heart parametric equation
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    
    // Add 3D depth with some thickness
    const thickness = 0.15 + v * 0.1;
    const z = Math.sin(u) * thickness * 3;
    
    // Normalize and scale
    const normalizedX = (x / 16) * scale;
    const normalizedY = (y / 16) * scale + scale * 0.1; // Shift up slightly
    const normalizedZ = z * scale * 0.5;
    
    // Add slight noise for organic feel
    const noise = 0.02 * scale;
    
    positions[i * 3] = normalizedX + (Math.random() - 0.5) * noise;
    positions[i * 3 + 1] = normalizedY + (Math.random() - 0.5) * noise;
    positions[i * 3 + 2] = normalizedZ + (Math.random() - 0.5) * noise;
  }
  
  return positions;
}

// Generate inner heart glow particles
function generateInnerHeartPoints(count: number, scale: number) {
  const positions = new Float32Array(count * 3);
  
  for (let i = 0; i < count; i++) {
    const t = (i / count) * Math.PI * 2;
    
    // Smaller heart inside
    const innerScale = 0.6 + Math.random() * 0.3;
    const x = 16 * Math.pow(Math.sin(t), 3) * innerScale;
    const y = (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * innerScale;
    
    const normalizedX = (x / 16) * scale;
    const normalizedY = (y / 16) * scale + scale * 0.1;
    const normalizedZ = (Math.random() - 0.5) * 0.2 * scale;
    
    positions[i * 3] = normalizedX;
    positions[i * 3 + 1] = normalizedY;
    positions[i * 3 + 2] = normalizedZ;
  }
  
  return positions;
}

// Main heart particles
function HeartParticles() {
  const pointsRef = useRef<THREE.Points>(null);
  
  const particleCount = 6000;
  
  const randomPositions = useMemo(() => generateRandomPoints(particleCount, 6), []);
  const heartPositions = useMemo(() => generateHeartPoints(particleCount, 1.3), []);
  const currentPositions = useMemo(() => new Float32Array(randomPositions), [randomPositions]);
  
  const morphProgress = useRef(0);
  const timeRef = useRef(0);
  
  useFrame((state, delta) => {
    timeRef.current += delta;
    const time = timeRef.current;
    
    const morphStart = 0.2;
    const morphDuration = 2.2;
    
    if (time > morphStart) {
      morphProgress.current = Math.min((time - morphStart) / morphDuration, 1);
    }
    
    // Smooth easing with overshoot for bouncy feel
    const easeOutBack = (t: number) => {
      const c1 = 1.70158;
      const c3 = c1 + 1;
      return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
    };
    
    const easedProgress = easeOutBack(morphProgress.current);
    
    if (pointsRef.current) {
      const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
      
      for (let i = 0; i < particleCount * 3; i += 3) {
        const idx = i / 3;
        
        // Spiral inward animation
        const angle = Math.atan2(randomPositions[i + 2], randomPositions[i]);
        const dist = Math.sqrt(randomPositions[i] ** 2 + randomPositions[i + 2] ** 2);
        const stagger = (dist / 3) * 0.4 + (angle / Math.PI / 2) * 0.1;
        const adjustedProgress = Math.max(0, Math.min(1, easedProgress * 1.3 - stagger));
        
        positions[i] = randomPositions[i] + (heartPositions[i] - randomPositions[i]) * adjustedProgress;
        positions[i + 1] = randomPositions[i + 1] + (heartPositions[i + 1] - randomPositions[i + 1]) * adjustedProgress;
        positions[i + 2] = randomPositions[i + 2] + (heartPositions[i + 2] - randomPositions[i + 2]) * adjustedProgress;
        
        // Heartbeat effect when formed
        if (adjustedProgress > 0.95) {
          const heartbeat = Math.sin(time * 4) * 0.015 + Math.sin(time * 8) * 0.008;
          const beatIntensity = (adjustedProgress - 0.95) * 20;
          positions[i] *= (1 + heartbeat * beatIntensity);
          positions[i + 1] *= (1 + heartbeat * beatIntensity * 0.8);
          positions[i + 2] *= (1 + heartbeat * beatIntensity);
        }
      }
      
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
      
      // Gentle floating rotation
      pointsRef.current.rotation.y = Math.sin(time * 0.3) * 0.15;
      pointsRef.current.rotation.x = Math.sin(time * 0.2) * 0.05;
    }
  });
  
  return (
    <Points ref={pointsRef} positions={currentPositions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#f43f5e"
        size={0.018}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.9}
      />
    </Points>
  );
}

// Inner glowing heart
function InnerHeartGlow() {
  const pointsRef = useRef<THREE.Points>(null);
  
  const particleCount = 2000;
  
  const randomPositions = useMemo(() => generateRandomPoints(particleCount, 5), []);
  const heartPositions = useMemo(() => generateInnerHeartPoints(particleCount, 1.3), []);
  const currentPositions = useMemo(() => new Float32Array(randomPositions), [randomPositions]);
  
  const morphProgress = useRef(0);
  const timeRef = useRef(0);
  
  useFrame((state, delta) => {
    timeRef.current += delta;
    const time = timeRef.current;
    
    const morphStart = 0.5;
    const morphDuration = 2.0;
    
    if (time > morphStart) {
      morphProgress.current = Math.min((time - morphStart) / morphDuration, 1);
    }
    
    const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);
    const easedProgress = easeOutQuart(morphProgress.current);
    
    if (pointsRef.current) {
      const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
      
      for (let i = 0; i < particleCount * 3; i += 3) {
        const idx = i / 3;
        const individualProgress = Math.max(0, Math.min(1, easedProgress * 1.4 - (idx / particleCount) * 0.4));
        
        positions[i] = randomPositions[i] + (heartPositions[i] - randomPositions[i]) * individualProgress;
        positions[i + 1] = randomPositions[i + 1] + (heartPositions[i + 1] - randomPositions[i + 1]) * individualProgress;
        positions[i + 2] = randomPositions[i + 2] + (heartPositions[i + 2] - randomPositions[i + 2]) * individualProgress;
        
        // Pulsing glow
        if (individualProgress > 0.9) {
          const pulse = Math.sin(time * 5 + idx * 0.01) * 0.02;
          positions[i] *= (1 + pulse);
          positions[i + 1] *= (1 + pulse);
        }
      }
      
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
      pointsRef.current.rotation.y = Math.sin(time * 0.3) * 0.15;
      pointsRef.current.rotation.x = Math.sin(time * 0.2) * 0.05;
    }
  });
  
  return (
    <Points ref={pointsRef} positions={currentPositions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#fda4af"
        size={0.025}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.7}
      />
    </Points>
  );
}

// Sparkle particles floating around
function FloatingSparkles() {
  const pointsRef = useRef<THREE.Points>(null);
  
  const positions = useMemo(() => {
    const count = 400;
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const radius = 2 + Math.random() * 3;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      
      arr[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = radius * Math.cos(phi);
    }
    return arr;
  }, []);
  
  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.05;
      pointsRef.current.rotation.z = Math.sin(state.clock.getElapsedTime() * 0.1) * 0.1;
    }
  });
  
  return (
    <Points ref={pointsRef} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#ffffff"
        size={0.008}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.5}
      />
    </Points>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.6} />
      <HeartParticles />
      <InnerHeartGlow />
      <FloatingSparkles />
    </>
  );
}

interface LoadingScreenProps {
  onLoadingComplete?: () => void;
  minDuration?: number;
}

export function LoadingScreen({ onLoadingComplete, minDuration = 3200 }: LoadingScreenProps) {
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
        }, 400);
      }
    }, 50);
    
    return () => clearInterval(interval);
  }, [minDuration, onLoadingComplete]);
  
  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0,
            filter: "blur(10px)",
            scale: 1.02,
          }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center overflow-hidden"
        >
          {/* 3D Canvas */}
          <motion.div 
            className="absolute inset-0"
            exit={{ scale: 1.1, opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Canvas
              camera={{ position: [0, 0.2, 3.5], fov: 50 }}
              gl={{ antialias: true, alpha: true }}
            >
              <Suspense fallback={null}>
                <Scene />
              </Suspense>
            </Canvas>
          </motion.div>
          
          {/* Overlay Content */}
          <div className="relative z-10 flex flex-col items-center mt-[50vh]">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ delay: 0.5, duration: 0.8, type: "spring", stiffness: 100 }}
              className="mb-6 sm:mb-8"
            >
              <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
                Asrull<span className="text-primary">.</span>
              </h1>
            </motion.div>
            
            {/* Loading Bar */}
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="relative"
            >
              <div className="w-40 sm:w-48 md:w-56 h-1 sm:h-1.5 bg-primary/10 rounded-full overflow-hidden backdrop-blur-sm border border-primary/20">
                <motion.div
                  className="h-full rounded-full relative overflow-hidden bg-gradient-to-r from-primary via-primary to-primary/80"
                  style={{ width: `${progress}%` }}
                  transition={{ duration: 0.1 }}
                >
                  {/* Shimmer effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  />
                </motion.div>
              </div>
              
              {/* Glow under bar */}
              <div 
                className="absolute -bottom-2 left-0 h-4 rounded-full blur-md bg-primary/30"
                style={{ width: `${progress}%` }}
              />
              
              {/* Progress Text */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 1 }}
                className="text-center mt-4 sm:mt-5 text-xs sm:text-sm text-muted-foreground font-medium tabular-nums"
              >
                {Math.round(progress)}%
              </motion.p>
            </motion.div>
            
            {/* Loading Text */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 1.2 }}
              className="mt-4 sm:mt-6 text-muted-foreground/70 text-xs sm:text-sm tracking-wide"
            >
              Loading experience...
            </motion.p>
          </div>
          
          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-radial from-primary/5 via-transparent to-background/80 pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 h-32 sm:h-40 bg-gradient-to-t from-background via-background/95 to-transparent pointer-events-none" />
          <div className="absolute top-0 left-0 right-0 h-24 sm:h-32 bg-gradient-to-b from-background/70 to-transparent pointer-events-none" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
