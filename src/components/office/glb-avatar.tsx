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

  // Scale model to ~1.0 units tall
  // Mixamo models are in centimeters (~170cm tall), so scale is ~0.006
  const scaleFactor = 0.006;
  const offsetX = 0;
  const offsetY = 0;
  const offsetZ = 0;

  // Play animations based on state
  useEffect(() => {
    if (!actions || names.length === 0) return;

    // Stop all current animations
    Object.values(actions).forEach((action) => action?.stop());

    // Try to find the best animation for current state
    const idleNames = ['Idle', 'idle', 'breathing_idle', 'Standing'];
    const workingNames = ['Walk', 'walk', 'agree', 'Run', 'run'];
    const danceNames = ['SambaDance', 'Dance', 'dance'];

    const findAnim = (preferred: string[]) => {
      for (const name of preferred) {
        if (actions[name]) return actions[name];
      }
      return null;
    };

    let action: THREE.AnimationAction | null = null;

    if (isWorking) {
      action = findAnim(workingNames) || findAnim(idleNames);
    } else {
      action = findAnim(idleNames);
    }

    // If no good animation found, DON'T play dance anims (they move root)
    // Just let the model stand in its default pose
    if (!action && names.length > 0) {
      // Try TPose as a last resort (static standing)
      action = findAnim(['TPose', 'tpose', 'T-Pose']);
    }

    if (action) {
      action.reset().fadeIn(0.3).play();
    }

    return () => {
      Object.values(actions).forEach((a) => a?.stop());
    };
  }, [actions, names, isWorking]);

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
