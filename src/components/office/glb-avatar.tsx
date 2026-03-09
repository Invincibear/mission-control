'use client';

import { Component, useRef, useState, useEffect, useMemo, type ReactNode } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';
import AgentAvatar from './agent-avatar';

interface GLBAvatarProps {
  color: string;
  agentId?: string;
  isWorking?: boolean;
  position?: [number, number, number];
}

function getModelPath(agentId?: string): string {
  const isCass = agentId === 'cass' || agentId === 'main';
  return isCass ? '/models/character-female.glb' : '/models/character-default.glb';
}

function LoadedAvatar({
  modelPath,
  color,
  agentId,
  isWorking = false,
  position = [0, 0, 0],
}: GLBAvatarProps & { modelPath: string }) {
  const groupRef = useRef<THREE.Group>(null);
  const isCass = agentId === 'cass' || agentId === 'main';
  const { scene, animations } = useGLTF(modelPath);
  const { actions, names } = useAnimations(animations, groupRef);

  // Clone scene so multiple instances don't share geometry state
  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    return clone;
  }, [scene]);

  // Auto-scale model to ~1.0 units tall
  const { scaleFactor, offsetX, offsetY, offsetZ } = useMemo(() => {
    const bbox = new THREE.Box3().setFromObject(clonedScene);
    const size = new THREE.Vector3();
    bbox.getSize(size);
    const targetHeight = 1.0;
    const sf = targetHeight / (size.y || 1);
    const center = new THREE.Vector3();
    bbox.getCenter(center);
    return {
      scaleFactor: sf,
      offsetX: -center.x * sf,
      offsetY: -bbox.min.y * sf,
      offsetZ: -center.z * sf,
    };
  }, [clonedScene]);

  // Play animations based on model type and state
  useEffect(() => {
    if (!actions || names.length === 0) return;

    // Stop all current animations
    Object.values(actions).forEach((action) => action?.stop());

    if (isCass) {
      // Michelle model: has 'SambaDance' and 'TPose'
      // Use TPose as base, animate via useFrame
      const tpose = actions['TPose'];
      if (tpose) {
        tpose.reset().play();
        tpose.paused = true; // Freeze in T-pose, we'll animate manually
      }
    } else {
      // Xbot: has 'idle', 'walk', 'run', etc.
      const animName = isWorking ? 'agree' : 'idle';
      const action = actions[animName] || actions[names[0]];
      if (action) {
        action.reset().fadeIn(0.3).play();
      }
    }

    return () => {
      Object.values(actions).forEach((action) => action?.stop());
    };
  }, [actions, names, isWorking, isCass]);

  // Manual idle animation for models without good idle clips
  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();

    if (isCass) {
      // Gentle breathing/sway for Michelle (since she only has SambaDance)
      groupRef.current.position.y = position[1] + Math.sin(t * 1.5) * 0.005;
      groupRef.current.rotation.y = Math.sin(t * 0.4) * 0.04;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      <group
        scale={[scaleFactor, scaleFactor, scaleFactor]}
        position={[offsetX, offsetY, offsetZ]}
      >
        <primitive object={clonedScene} />
      </group>

      {/* Status indicator */}
      {isWorking && (
        <mesh position={[0, 1.1, 0]}>
          <sphereGeometry args={[0.02, 8, 8]} />
          <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={2} />
        </mesh>
      )}
    </group>
  );
}

// Error boundary for GLB load failures
class GLBErrorBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { fallback: ReactNode; children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

export default function GLBAvatar(props: GLBAvatarProps) {
  const [modelAvailable, setModelAvailable] = useState<boolean | null>(null);
  const modelPath = getModelPath(props.agentId);

  useEffect(() => {
    fetch(modelPath, { method: 'HEAD' })
      .then((res) => setModelAvailable(res.ok))
      .catch(() => setModelAvailable(false));
  }, [modelPath]);

  // Show primitive avatar while checking or if model unavailable
  if (modelAvailable !== true) {
    return <AgentAvatar {...props} />;
  }

  const fallback = <AgentAvatar {...props} />;

  return (
    <GLBErrorBoundary fallback={fallback}>
      <LoadedAvatar {...props} modelPath={modelPath} />
    </GLBErrorBoundary>
  );
}
