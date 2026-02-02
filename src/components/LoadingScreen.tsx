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

// Generate rose shape points using parametric equations
function generateRosePoints(count: number, scale: number) {
  const positions = new Float32Array(count * 3);
  
  for (let i = 0; i < count; i++) {
    // Rose parameters
    const t = (i / count) * Math.PI * 2 * 6; // Multiple rotations
    const u = Math.random() * Math.PI; // Vertical angle
    
    // Rose curve: r = cos(k*theta) for a k-petaled rose
    const k = 5; // 5 petals
    const r = Math.cos(k * t * 0.5) + 0.3;
    
    // Add some variation for 3D effect
    const heightFactor = Math.sin(u) * 0.8;
    const radiusFactor = Math.abs(r) * (0.8 + Math.random() * 0.4);
    
    // Spiral from center outward for rose bud effect
    const spiralT = i / count;
    const spiralRadius = spiralT * radiusFactor * scale;
    const spiralHeight = (1 - spiralT) * scale * 0.5 + heightFactor * spiralT * scale * 0.3;
    
    positions[i * 3] = Math.cos(t) * spiralRadius;
    positions[i * 3 + 1] = spiralHeight - scale * 0.2;
    positions[i * 3 + 2] = Math.sin(t) * spiralRadius;
  }
  
  return positions;
}

// Generate stem and leaves
function generateStemPoints(count: number, scale: number) {
  const positions = new Float32Array(count * 3);
  
  for (let i = 0; i < count; i++) {
    const t = i / count;
    
    if (i < count * 0.6) {
      // Stem - curved line going down
      const stemT = (i / (count * 0.6));
      const curve = Math.sin(stemT * Math.PI * 2) * 0.1;
      positions[i * 3] = curve * scale;
      positions[i * 3 + 1] = -stemT * scale * 1.5 - scale * 0.2;
      positions[i * 3 + 2] = Math.cos(stemT * Math.PI) * 0.05 * scale;
    } else {
      // Leaves
      const leafT = (i - count * 0.6) / (count * 0.4);
      const leafAngle = Math.floor(leafT * 2) * Math.PI + Math.PI * 0.25;
      const leafProgress = (leafT * 2) % 1;
      const leafShape = Math.sin(leafProgress * Math.PI) * 0.4;
      
      positions[i * 3] = Math.cos(leafAngle) * leafShape * scale;
      positions[i * 3 + 1] = -scale * 0.8 - leafProgress * 0.3 * scale + Math.floor(leafT * 2) * 0.4 * scale;
      positions[i * 3 + 2] = Math.sin(leafAngle) * leafShape * scale;
    }
  }
  
  return positions;
}

function MorphingParticles() {
  const pointsRef = useRef<THREE.Points>(null);
  const pointsRef2 = useRef<THREE.Points>(null);
  
  const particleCount = 4000;
  const particleCount2 = 1500;
  
  // Generate all shape positions
  const randomPositions = useMemo(() => generateRandomPoints(particleCount, 6), []);
  const rosePositions = useMemo(() => generateRosePoints(particleCount, 1.8), []);
  const stemRandomPositions = useMemo(() => generateRandomPoints(particleCount2, 5), []);
  const stemPositions = useMemo(() => generateStemPoints(particleCount2, 1.8), []);
  
  // Current positions that will be animated
  const currentPositions = useMemo(() => new Float32Array(randomPositions), [randomPositions]);
  const currentStemPositions = useMemo(() => new Float32Array(stemRandomPositions), [stemRandomPositions]);
  
  // Animation progress ref
  const morphProgress = useRef(0);
  const timeRef = useRef(0);
  
  useFrame((state, delta) => {
    timeRef.current += delta;
    const time = timeRef.current;
    
    // Smooth morphing progress (0 to 1 over time)
    // Start morphing after 0.5 seconds, complete by 2 seconds
    const morphStart = 0.5;
    const morphDuration = 1.8;
    
    if (time > morphStart) {
      morphProgress.current = Math.min((time - morphStart) / morphDuration, 1);
    }
    
    // Easing function for smooth transition
    const easeInOutCubic = (t: number) => {
      return t < 0.5 
        ? 4 * t * t * t 
        : 1 - Math.pow(-2 * t + 2, 3) / 2;
    };
    
    const easedProgress = easeInOutCubic(morphProgress.current);
    
    // Update main particle positions
    if (pointsRef.current) {
      const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
      
      for (let i = 0; i < particleCount * 3; i += 3) {
        // Interpolate between random and rose positions
        const idx = i / 3;
        
        // Add some individual delay for organic feel
        const individualDelay = (idx / particleCount) * 0.3;
        const adjustedProgress = Math.max(0, Math.min(1, (easedProgress - individualDelay) / (1 - individualDelay)));
        
        positions[i] = randomPositions[i] + (rosePositions[i] - randomPositions[i]) * adjustedProgress;
        positions[i + 1] = randomPositions[i + 1] + (rosePositions[i + 1] - randomPositions[i + 1]) * adjustedProgress;
        positions[i + 2] = randomPositions[i + 2] + (rosePositions[i + 2] - randomPositions[i + 2]) * adjustedProgress;
        
        // Add gentle floating motion after morphed
        if (adjustedProgress > 0.8) {
          const floatAmount = (adjustedProgress - 0.8) * 5;
          positions[i + 1] += Math.sin(time * 2 + idx * 0.01) * 0.02 * floatAmount;
        }
      }
      
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
      
      // Slow rotation
      pointsRef.current.rotation.y = time * 0.15;
    }
    
    // Update stem/leaves positions
    if (pointsRef2.current) {
      const positions = pointsRef2.current.geometry.attributes.position.array as Float32Array;
      
      for (let i = 0; i < particleCount2 * 3; i += 3) {
        const idx = i / 3;
        
        // Stem morphs slightly after the rose
        const stemDelay = 0.2;
        const adjustedProgress = Math.max(0, Math.min(1, (easedProgress - stemDelay) / (1 - stemDelay)));
        const individualDelay = (idx / particleCount2) * 0.2;
        const finalProgress = Math.max(0, Math.min(1, (adjustedProgress - individualDelay) / (1 - individualDelay)));
        
        positions[i] = stemRandomPositions[i] + (stemPositions[i] - stemRandomPositions[i]) * finalProgress;
        positions[i + 1] = stemRandomPositions[i + 1] + (stemPositions[i + 1] - stemRandomPositions[i + 1]) * finalProgress;
        positions[i + 2] = stemRandomPositions[i + 2] + (stemPositions[i + 2] - stemRandomPositions[i + 2]) * finalProgress;
      }
      
      pointsRef2.current.geometry.attributes.position.needsUpdate = true;
      pointsRef2.current.rotation.y = time * 0.15;
    }
  });
  
  return (
    <>
      {/* Rose petals */}
      <Points ref={pointsRef} positions={currentPositions} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#ff4d6d"
          size={0.025}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.9}
        />
      </Points>
      
      {/* Stem and leaves */}
      <Points ref={pointsRef2} positions={currentStemPositions} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#22c55e"
          size={0.018}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.85}
        />
      </Points>
    </>
  );
}

// Ambient particles for atmosphere
function AmbientParticles() {
  const pointsRef = useRef<THREE.Points>(null);
  
  const positions = useMemo(() => {
    const count = 800;
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 10;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 10;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return arr;
  }, []);
  
  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.02;
      pointsRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.1) * 0.1;
    }
  });
  
  return (
    <Points ref={pointsRef} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#14F1D9"
        size={0.008}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.3}
      />
    </Points>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <MorphingParticles />
      <AmbientParticles />
    </>
  );
}

interface LoadingScreenProps {
  onLoadingComplete?: () => void;
  minDuration?: number;
}

export function LoadingScreen({ onLoadingComplete, minDuration = 3000 }: LoadingScreenProps) {
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
              camera={{ position: [0, 0.5, 4.5], fov: 50 }}
              gl={{ antialias: true, alpha: true }}
            >
              <Suspense fallback={null}>
                <Scene />
              </Suspense>
            </Canvas>
          </div>
          
          {/* Overlay Content */}
          <div className="relative z-10 flex flex-col items-center mt-[40vh]">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="mb-6 sm:mb-8"
            >
              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
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
              <div className="w-40 sm:w-48 md:w-64 h-1 bg-border/30 rounded-full overflow-hidden backdrop-blur-sm">
                <motion.div
                  className="h-full bg-gradient-to-r from-pink-500 via-rose-500 to-primary rounded-full"
                  style={{ width: `${progress}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>
              
              {/* Progress Text */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-center mt-3 sm:mt-4 text-xs sm:text-sm text-foreground-muted"
              >
                {Math.round(progress)}%
              </motion.p>
            </motion.div>
            
            {/* Loading Text */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0.5, 1] }}
              transition={{ delay: 0.8, duration: 2, repeat: Infinity }}
              className="mt-4 sm:mt-6 text-foreground-secondary text-xs sm:text-sm tracking-wider uppercase"
            >
              Blooming Experience
            </motion.p>
          </div>
          
          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-background pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 h-24 sm:h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
