'use client';

import { Component, useRef, useState, useEffect, useMemo, type ReactNode } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import AgentAvatar from './agent-avatar';

interface GLBAvatarProps {
  color: string;
  agentId?: string;
  isWorking?: boolean;
  position?: [number, number, number];
}

// Model paths per character type
function getModelPath(agentId?: string): string {
  const isCass = agentId === 'cass' || agentId === 'main';
  return isCass ? '/models/character-female.glb' : '/models/character-default.glb';
}

function LoadedAvatar({
  modelPath,
  color,
  isWorking = false,
  position = [0, 0, 0],
}: GLBAvatarProps & { modelPath: string }) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF(modelPath);

  // Clone scene once via useMemo so we don't re-clone every render
  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);
    // Enable shadows on all meshes
    clone.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    return clone;
  }, [scene]);

  // Idle animation — gentle sway/breathing
  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();

    if (isWorking) {
      groupRef.current.rotation.y = Math.sin(t * 0.5) * 0.03;
      groupRef.current.position.y = position[1] + Math.sin(t * 2) * 0.003;
    } else {
      groupRef.current.position.y = position[1] + Math.sin(t * 1.2) * 0.008;
      groupRef.current.rotation.y = Math.sin(t * 0.3) * 0.04;
    }
  });

  // Auto-scale: normalize model to ~1.05 units tall (matching primitive avatar height)
  const { scaleFactor, offsetX, offsetY, offsetZ } = useMemo(() => {
    const bbox = new THREE.Box3().setFromObject(clonedScene);
    const size = new THREE.Vector3();
    bbox.getSize(size);
    const targetHeight = 1.05;
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

  return (
    <group ref={groupRef} position={position}>
      <group
        scale={[scaleFactor, scaleFactor, scaleFactor]}
        position={[offsetX, offsetY, offsetZ]}
      >
        <primitive object={clonedScene} />
      </group>

      {/* Status indicator — same as primitive avatar */}
      {isWorking && (
        <mesh position={[0, 1.15, 0]}>
          <sphereGeometry args={[0.02, 8, 8]} />
          <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={2} />
        </mesh>
      )}
    </group>
  );
}

// Error boundary to catch useGLTF load failures and fall back to primitive avatar
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

  // Check if model file exists before attempting to load
  useEffect(() => {
    fetch(modelPath, { method: 'HEAD' })
      .then((res) => setModelAvailable(res.ok))
      .catch(() => setModelAvailable(false));
  }, [modelPath]);

  // While checking, show primitive avatar (no flash — it's the same shape)
  if (modelAvailable !== true) {
    return <AgentAvatar {...props} />;
  }

  const fallback = (
    <AgentAvatar
      color={props.color}
      agentId={props.agentId}
      isWorking={props.isWorking}
      position={props.position}
    />
  );

  return (
    <GLBErrorBoundary fallback={fallback}>
      <LoadedAvatar {...props} modelPath={modelPath} />
    </GLBErrorBoundary>
  );
}
