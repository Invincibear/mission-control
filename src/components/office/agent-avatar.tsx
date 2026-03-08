'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface AgentAvatarProps {
  color: string;
  isWorking?: boolean;
  position?: [number, number, number];
}

export default function AgentAvatar({ color, isWorking = false, position = [0, 0, 0] }: AgentAvatarProps) {
  const groupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Mesh>(null);
  const leftArmRef = useRef<THREE.Mesh>(null);
  const rightArmRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.getElapsedTime();

    if (isWorking) {
      // Typing animation - arms move up and down alternately
      if (leftArmRef.current) {
        leftArmRef.current.rotation.x = Math.sin(t * 8) * 0.15 - 0.3;
      }
      if (rightArmRef.current) {
        rightArmRef.current.rotation.x = Math.sin(t * 8 + Math.PI) * 0.15 - 0.3;
      }
      // Subtle body bob while working
      if (bodyRef.current) {
        bodyRef.current.position.y = Math.sin(t * 2) * 0.02;
      }
    } else {
      // Idle bobbing
      groupRef.current.position.y = position[1] + Math.sin(t * 1.5) * 0.05;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Body */}
      <mesh ref={bodyRef} position={[0, 0.5, 0]}>
        <capsuleGeometry args={[0.2, 0.4, 4, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {/* Head */}
      <mesh position={[0, 1.05, 0]}>
        <sphereGeometry args={[0.18, 8, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {/* Eyes */}
      <mesh position={[-0.07, 1.08, 0.15]}>
        <sphereGeometry args={[0.04, 6, 6]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[0.07, 1.08, 0.15]}>
        <sphereGeometry args={[0.04, 6, 6]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />
      </mesh>

      {/* Pupils */}
      <mesh position={[-0.07, 1.08, 0.18]}>
        <sphereGeometry args={[0.02, 6, 6]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>
      <mesh position={[0.07, 1.08, 0.18]}>
        <sphereGeometry args={[0.02, 6, 6]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>

      {/* Left Arm */}
      <mesh ref={leftArmRef} position={[-0.3, 0.55, 0.1]}>
        <capsuleGeometry args={[0.06, 0.3, 4, 6]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {/* Right Arm */}
      <mesh ref={rightArmRef} position={[0.3, 0.55, 0.1]}>
        <capsuleGeometry args={[0.06, 0.3, 4, 6]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}
