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

// Generate realistic rose shape using layered petal approach
function generateRosePoints(count: number, scale: number) {
  const positions = new Float32Array(count * 3);
  
  // Rose consists of multiple petal layers
  const petalLayers = 6;
  const pointsPerLayer = Math.floor(count / petalLayers);
  
  for (let i = 0; i < count; i++) {
    const layer = Math.floor(i / pointsPerLayer);
    const indexInLayer = i % pointsPerLayer;
    const t = (indexInLayer / pointsPerLayer) * Math.PI * 2;
    
    // Each layer has different radius and height
    const layerProgress = layer / petalLayers;
    
    // Inner layers are tighter and higher, outer layers spread out
    const baseRadius = 0.15 + layerProgress * 0.6;
    const layerHeight = (1 - layerProgress) * 0.5;
    
    // Petal shape - wavy edge
    const petalCount = 5;
    const petalWave = Math.sin(t * petalCount) * 0.15 * (1 + layerProgress);
    const radius = (baseRadius + petalWave) * scale;
    
    // Spiral effect for natural rose look
    const spiralAngle = t + layerProgress * Math.PI * 0.3;
    
    // Cup shape - petals curve inward at edges
    const cupEffect = Math.cos(t * petalCount * 0.5) * 0.1 * layerProgress;
    const height = (layerHeight + cupEffect) * scale;
    
    // Add some randomness for organic feel
    const noise = 0.03 * scale;
    
    positions[i * 3] = Math.cos(spiralAngle) * radius + (Math.random() - 0.5) * noise;
    positions[i * 3 + 1] = height + (Math.random() - 0.5) * noise;
    positions[i * 3 + 2] = Math.sin(spiralAngle) * radius + (Math.random() - 0.5) * noise;
  }
  
  return positions;
}

// Generate center of rose (tight spiral)
function generateRoseCenterPoints(count: number, scale: number) {
  const positions = new Float32Array(count * 3);
  
  for (let i = 0; i < count; i++) {
    const t = i / count;
    const angle = t * Math.PI * 8; // Multiple spirals
    const radius = t * 0.25 * scale;
    const height = (1 - t * 0.5) * 0.6 * scale;
    
    positions[i * 3] = Math.cos(angle) * radius;
    positions[i * 3 + 1] = height;
    positions[i * 3 + 2] = Math.sin(angle) * radius;
  }
  
  return positions;
}

// Generate stem
function generateStemPoints(count: number, scale: number) {
  const positions = new Float32Array(count * 3);
  
  const stemCount = Math.floor(count * 0.7);
  const leafCount = count - stemCount;
  
  for (let i = 0; i < stemCount; i++) {
    const t = i / stemCount;
    // Slightly curved stem
    const curve = Math.sin(t * Math.PI) * 0.08;
    const noise = (Math.random() - 0.5) * 0.02;
    
    positions[i * 3] = curve * scale + noise;
    positions[i * 3 + 1] = -t * 1.8 * scale;
    positions[i * 3 + 2] = noise;
  }
  
  // Leaves
  for (let i = 0; i < leafCount; i++) {
    const leafIndex = Math.floor(i / (leafCount / 2));
    const t = (i % (leafCount / 2)) / (leafCount / 2);
    
    const leafAngle = leafIndex === 0 ? Math.PI * 0.3 : -Math.PI * 0.3;
    const leafY = leafIndex === 0 ? -0.6 : -1.0;
    
    // Leaf shape
    const leafLength = Math.sin(t * Math.PI) * 0.35;
    const leafWidth = Math.sin(t * Math.PI) * 0.08;
    
    const idx = stemCount + i;
    positions[idx * 3] = Math.cos(leafAngle) * leafLength * scale + Math.sin(leafAngle) * leafWidth * scale;
    positions[idx * 3 + 1] = leafY * scale + t * 0.1 * scale;
    positions[idx * 3 + 2] = Math.sin(leafAngle) * leafLength * scale;
  }
  
  return positions;
}

// Main morphing component for rose petals
function RosePetals() {
  const pointsRef = useRef<THREE.Points>(null);
  
  const particleCount = 5000;
  
  const randomPositions = useMemo(() => generateRandomPoints(particleCount, 5), []);
  const rosePositions = useMemo(() => generateRosePoints(particleCount, 1.5), []);
  const currentPositions = useMemo(() => new Float32Array(randomPositions), [randomPositions]);
  
  const morphProgress = useRef(0);
  const timeRef = useRef(0);
  
  useFrame((state, delta) => {
    timeRef.current += delta;
    const time = timeRef.current;
    
    const morphStart = 0.3;
    const morphDuration = 2.0;
    
    if (time > morphStart) {
      morphProgress.current = Math.min((time - morphStart) / morphDuration, 1);
    }
    
    // Smooth easing
    const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);
    const easedProgress = easeOutQuart(morphProgress.current);
    
    if (pointsRef.current) {
      const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
      
      for (let i = 0; i < particleCount * 3; i += 3) {
        const idx = i / 3;
        
        // Staggered animation from center outward
        const distFromCenter = Math.sqrt(
          rosePositions[i] ** 2 + 
          rosePositions[i + 2] ** 2
        );
        const stagger = distFromCenter * 0.3;
        const adjustedProgress = Math.max(0, Math.min(1, (easedProgress * 1.5 - stagger)));
        
        positions[i] = randomPositions[i] + (rosePositions[i] - randomPositions[i]) * adjustedProgress;
        positions[i + 1] = randomPositions[i + 1] + (rosePositions[i + 1] - randomPositions[i + 1]) * adjustedProgress;
        positions[i + 2] = randomPositions[i + 2] + (rosePositions[i + 2] - randomPositions[i + 2]) * adjustedProgress;
        
        // Gentle breathing motion when formed
        if (adjustedProgress > 0.9) {
          const breathe = Math.sin(time * 1.5 + idx * 0.002) * 0.008 * (adjustedProgress - 0.9) * 10;
          positions[i] *= (1 + breathe);
          positions[i + 2] *= (1 + breathe);
        }
      }
      
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
      pointsRef.current.rotation.y = time * 0.1;
    }
  });
  
  return (
    <Points ref={pointsRef} positions={currentPositions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#e11d48"
        size={0.022}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.95}
      />
    </Points>
  );
}

// Rose center (darker red, tighter)
function RoseCenter() {
  const pointsRef = useRef<THREE.Points>(null);
  
  const particleCount = 1500;
  
  const randomPositions = useMemo(() => generateRandomPoints(particleCount, 4), []);
  const centerPositions = useMemo(() => generateRoseCenterPoints(particleCount, 1.5), []);
  const currentPositions = useMemo(() => new Float32Array(randomPositions), [randomPositions]);
  
  const morphProgress = useRef(0);
  const timeRef = useRef(0);
  
  useFrame((state, delta) => {
    timeRef.current += delta;
    const time = timeRef.current;
    
    const morphStart = 0.5;
    const morphDuration = 1.8;
    
    if (time > morphStart) {
      morphProgress.current = Math.min((time - morphStart) / morphDuration, 1);
    }
    
    const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);
    const easedProgress = easeOutQuart(morphProgress.current);
    
    if (pointsRef.current) {
      const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
      
      for (let i = 0; i < particleCount * 3; i += 3) {
        const idx = i / 3;
        const individualProgress = Math.max(0, Math.min(1, easedProgress * 1.2 - (idx / particleCount) * 0.2));
        
        positions[i] = randomPositions[i] + (centerPositions[i] - randomPositions[i]) * individualProgress;
        positions[i + 1] = randomPositions[i + 1] + (centerPositions[i + 1] - randomPositions[i + 1]) * individualProgress;
        positions[i + 2] = randomPositions[i + 2] + (centerPositions[i + 2] - randomPositions[i + 2]) * individualProgress;
      }
      
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
      pointsRef.current.rotation.y = time * 0.1;
    }
  });
  
  return (
    <Points ref={pointsRef} positions={currentPositions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#9f1239"
        size={0.018}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.95}
      />
    </Points>
  );
}

// Stem and leaves
function StemAndLeaves() {
  const pointsRef = useRef<THREE.Points>(null);
  
  const particleCount = 1200;
  
  const randomPositions = useMemo(() => generateRandomPoints(particleCount, 4), []);
  const stemPositions = useMemo(() => generateStemPoints(particleCount, 1.5), []);
  const currentPositions = useMemo(() => new Float32Array(randomPositions), [randomPositions]);
  
  const morphProgress = useRef(0);
  const timeRef = useRef(0);
  
  useFrame((state, delta) => {
    timeRef.current += delta;
    const time = timeRef.current;
    
    const morphStart = 0.8;
    const morphDuration = 1.5;
    
    if (time > morphStart) {
      morphProgress.current = Math.min((time - morphStart) / morphDuration, 1);
    }
    
    const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);
    const easedProgress = easeOutQuart(morphProgress.current);
    
    if (pointsRef.current) {
      const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
      
      for (let i = 0; i < particleCount * 3; i += 3) {
        const idx = i / 3;
        const individualProgress = Math.max(0, Math.min(1, easedProgress * 1.3 - (idx / particleCount) * 0.3));
        
        positions[i] = randomPositions[i] + (stemPositions[i] - randomPositions[i]) * individualProgress;
        positions[i + 1] = randomPositions[i + 1] + (stemPositions[i + 1] - randomPositions[i + 1]) * individualProgress;
        positions[i + 2] = randomPositions[i + 2] + (stemPositions[i + 2] - randomPositions[i + 2]) * individualProgress;
      }
      
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
      pointsRef.current.rotation.y = time * 0.1;
    }
  });
  
  return (
    <Points ref={pointsRef} positions={currentPositions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#15803d"
        size={0.016}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.9}
      />
    </Points>
  );
}

// Ambient sparkle particles
function AmbientSparkles() {
  const pointsRef = useRef<THREE.Points>(null);
  
  const positions = useMemo(() => {
    const count = 500;
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 8;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 8;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    return arr;
  }, []);
  
  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.03;
    }
  });
  
  return (
    <Points ref={pointsRef} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#fda4af"
        size={0.006}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.4}
      />
    </Points>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.6} />
      <RosePetals />
      <RoseCenter />
      <StemAndLeaves />
      <AmbientSparkles />
    </>
  );
}

interface LoadingScreenProps {
  onLoadingComplete?: () => void;
  minDuration?: number;
}

export function LoadingScreen({ onLoadingComplete, minDuration = 3500 }: LoadingScreenProps) {
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
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center overflow-hidden"
        >
          {/* 3D Canvas */}
          <div className="absolute inset-0">
            <Canvas
              camera={{ position: [0, 0.3, 4], fov: 45 }}
              gl={{ antialias: true, alpha: true }}
            >
              <Suspense fallback={null}>
                <Scene />
              </Suspense>
            </Canvas>
          </div>
          
          {/* Overlay Content */}
          <div className="relative z-10 flex flex-col items-center mt-[45vh]">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="mb-5 sm:mb-6"
            >
              <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
                Asrull<span className="text-rose-500">.</span>
              </h1>
            </motion.div>
            
            {/* Loading Bar */}
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="relative"
            >
              <div className="w-36 sm:w-44 md:w-56 h-0.5 sm:h-1 bg-border/20 rounded-full overflow-hidden backdrop-blur-sm">
                <motion.div
                  className="h-full bg-gradient-to-r from-rose-600 via-rose-500 to-pink-400 rounded-full"
                  style={{ width: `${progress}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>
              
              {/* Progress Text */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-center mt-2 sm:mt-3 text-[10px] sm:text-xs text-foreground-muted font-medium"
              >
                {Math.round(progress)}%
              </motion.p>
            </motion.div>
            
            {/* Loading Text */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.8, 0.4, 0.8] }}
              transition={{ delay: 1, duration: 2.5, repeat: Infinity }}
              className="mt-3 sm:mt-4 text-foreground-secondary/70 text-[10px] sm:text-xs tracking-widest uppercase"
            >
              Blooming...
            </motion.p>
          </div>
          
          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-radial from-rose-500/5 via-transparent to-background pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 h-20 sm:h-28 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none" />
          <div className="absolute top-0 left-0 right-0 h-16 sm:h-24 bg-gradient-to-b from-background/50 to-transparent pointer-events-none" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
