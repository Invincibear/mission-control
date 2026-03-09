'use client';

import { Component, useRef, useState, useEffect, useMemo, type ReactNode } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';
import { clone as cloneWithSkeleton } from 'three/examples/jsm/utils/SkeletonUtils.js';
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
  const { scene, animations } = useGLTF(modelPath);

  // Clone the scene so each agent gets its own instance.
  // useGLTF caches and returns a shared scene — without cloning,
  // only the last-rendered agent using this model path would be visible
  // (a Three.js Object3D can only belong to one parent).
  const clonedScene = useMemo(() => {
    const clone = cloneWithSkeleton(scene);
    clone.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    return clone;
  }, [scene]);

  const { actions, names } = useAnimations(animations, groupRef);

  // Auto-scale: measure model height, scale to desk-appropriate size
  const { scaleFactor, offsetY } = useMemo(() => {
    const bbox = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    bbox.getSize(size);
    // Desks are ~0.8 units tall, characters should tower over them (~1.8 units)
    const rawHeight = size.y || 1;
    const targetHeight = 1.8;
    const sf = targetHeight / rawHeight;
    return {
      scaleFactor: sf,
      offsetY: -bbox.min.y * sf,
    };
  }, [scene]);

  // Play animations based on state
  useEffect(() => {
    if (!actions || names.length === 0) return;

    // Stop all current animations
    Object.values(actions).forEach((action) => action?.stop());

    // Try to find the best animation — Quaternius uses "CharacterArmature|Name" format
    const findAnim = (preferred: string[]) => {
      for (const name of preferred) {
        // Try exact match first, then partial match (for "CharacterArmature|Idle" etc)
        if (actions[name]) return actions[name];
        const partial = Object.keys(actions).find(
          (k) => k.toLowerCase().includes(name.toLowerCase())
        );
        if (partial && actions[partial]) return actions[partial];
      }
      return null;
    };

    let action: THREE.AnimationAction | null = null;

    if (isWorking) {
      action = findAnim(['Interact', 'Walk', 'Run', 'Idle']);
    } else {
      action = findAnim(['Idle', 'Idle_Neutral', 'Idle_Gun', 'Wave']);
    }

    // Last resort — play the first available animation
    if (!action && names.length > 0) {
      const firstKey = Object.keys(actions).find((k) => actions[k]);
      if (firstKey) action = actions[firstKey]!;
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
        position={[0, offsetY, 0]}
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
