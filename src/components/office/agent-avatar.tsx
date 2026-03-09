'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface AgentAvatarProps {
  color: string;
  agentId?: string;
  isWorking?: boolean;
  position?: [number, number, number];
}

export default function AgentAvatar({
  color,
  agentId,
  isWorking = false,
  position = [0, 0, 0],
}: AgentAvatarProps) {
  const groupRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);

  const isCass = agentId === 'cass' || agentId === 'main';

  // Sims-style: bright, cartoonish colors
  const skinColor = isCass ? '#f0c8a0' : '#f0c8a0';
  const shirtColor = isCass ? '#6366f1' : color;
  const pantsColor = isCass ? '#1e293b' : '#334155';
  const hairColor = isCass ? '#1a0f0a' : new THREE.Color(color).offsetHSL(0, -0.3, -0.4).getStyle();
  const shoeColor = '#2a2a30';

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();

    if (isWorking) {
      // Typing animation
      if (leftArmRef.current) {
        leftArmRef.current.rotation.x = Math.sin(t * 6) * 0.1 - 0.5;
      }
      if (rightArmRef.current) {
        rightArmRef.current.rotation.x = Math.sin(t * 6 + Math.PI) * 0.1 - 0.5;
      }
      if (headRef.current) {
        headRef.current.rotation.y = Math.sin(t * 0.5) * 0.06;
      }
    } else {
      // Idle: gentle sway
      if (groupRef.current) {
        groupRef.current.position.y = position[1] + Math.sin(t * 1.2) * 0.008;
      }
      if (leftArmRef.current) {
        leftArmRef.current.rotation.x = Math.sin(t * 0.8) * 0.02;
        leftArmRef.current.rotation.z = 0.15;
      }
      if (rightArmRef.current) {
        rightArmRef.current.rotation.x = Math.sin(t * 0.8 + 0.5) * 0.02;
        rightArmRef.current.rotation.z = -0.15;
      }
      if (headRef.current) {
        headRef.current.rotation.y = Math.sin(t * 0.3) * 0.08;
      }
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* ---- LEGS (short, stubby — Sims style) ---- */}
      {/* Left leg */}
      <mesh position={[-0.06, 0.2, 0]} castShadow>
        <capsuleGeometry args={[0.05, 0.18, 4, 8]} />
        <meshStandardMaterial color={pantsColor} roughness={0.8} />
      </mesh>
      {/* Right leg */}
      <mesh position={[0.06, 0.2, 0]} castShadow>
        <capsuleGeometry args={[0.05, 0.18, 4, 8]} />
        <meshStandardMaterial color={pantsColor} roughness={0.8} />
      </mesh>
      {/* Shoes */}
      <mesh position={[-0.06, 0.06, 0.02]}>
        <boxGeometry args={[0.08, 0.05, 0.12]} />
        <meshStandardMaterial color={shoeColor} roughness={0.7} />
      </mesh>
      <mesh position={[0.06, 0.06, 0.02]}>
        <boxGeometry args={[0.08, 0.05, 0.12]} />
        <meshStandardMaterial color={shoeColor} roughness={0.7} />
      </mesh>

      {/* ---- BODY (round, chunky torso — Sims style) ---- */}
      <mesh position={[0, 0.52, 0]} castShadow>
        <capsuleGeometry args={[0.14, 0.22, 6, 8]} />
        <meshStandardMaterial color={shirtColor} roughness={0.7} />
      </mesh>

      {/* ---- ARMS (short, rounded) ---- */}
      {/* Left arm */}
      <group ref={leftArmRef} position={[-0.18, 0.6, 0]}>
        <mesh position={[0, -0.12, 0]} castShadow>
          <capsuleGeometry args={[0.04, 0.16, 4, 8]} />
          <meshStandardMaterial color={shirtColor} roughness={0.7} />
        </mesh>
        {/* Hand */}
        <mesh position={[0, -0.24, 0]}>
          <sphereGeometry args={[0.035, 6, 6]} />
          <meshStandardMaterial color={skinColor} roughness={0.7} />
        </mesh>
      </group>
      {/* Right arm */}
      <group ref={rightArmRef} position={[0.18, 0.6, 0]}>
        <mesh position={[0, -0.12, 0]} castShadow>
          <capsuleGeometry args={[0.04, 0.16, 4, 8]} />
          <meshStandardMaterial color={shirtColor} roughness={0.7} />
        </mesh>
        <mesh position={[0, -0.24, 0]}>
          <sphereGeometry args={[0.035, 6, 6]} />
          <meshStandardMaterial color={skinColor} roughness={0.7} />
        </mesh>
      </group>

      {/* ---- HEAD (BIG, round — the Sims signature) ---- */}
      <group ref={headRef} position={[0, 0.82, 0]}>
        {/* Head — oversized sphere */}
        <mesh castShadow>
          <sphereGeometry args={[0.15, 12, 10]} />
          <meshStandardMaterial color={skinColor} roughness={0.6} />
        </mesh>

        {/* Hair */}
        {isCass ? (
          // Cass: long dark hair
          <>
            <mesh position={[0, 0.06, -0.02]}>
              <sphereGeometry args={[0.155, 10, 8]} />
              <meshStandardMaterial color={hairColor} roughness={0.9} />
            </mesh>
            {/* Side hair */}
            <mesh position={[-0.1, -0.02, 0.02]}>
              <capsuleGeometry args={[0.05, 0.12, 4, 6]} />
              <meshStandardMaterial color={hairColor} roughness={0.9} />
            </mesh>
            <mesh position={[0.1, -0.02, 0.02]}>
              <capsuleGeometry args={[0.05, 0.12, 4, 6]} />
              <meshStandardMaterial color={hairColor} roughness={0.9} />
            </mesh>
            {/* Back hair */}
            <mesh position={[0, -0.05, -0.06]}>
              <capsuleGeometry args={[0.1, 0.2, 4, 6]} />
              <meshStandardMaterial color={hairColor} roughness={0.9} />
            </mesh>
          </>
        ) : (
          // Others: short styled hair
          <mesh position={[0, 0.08, -0.01]}>
            <sphereGeometry args={[0.15, 10, 8]} />
            <meshStandardMaterial color={hairColor} roughness={0.9} />
          </mesh>
        )}

        {/* Eyes — big, round, friendly (Sims-style) */}
        {/* Left eye white */}
        <mesh position={[-0.05, 0.02, 0.13]}>
          <sphereGeometry args={[0.032, 8, 8]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        {/* Right eye white */}
        <mesh position={[0.05, 0.02, 0.13]}>
          <sphereGeometry args={[0.032, 8, 8]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        {/* Irises — large, colorful */}
        <mesh position={[-0.05, 0.02, 0.155]}>
          <sphereGeometry args={[0.018, 8, 8]} />
          <meshBasicMaterial color={isCass ? '#4a9ead' : '#5a8a6a'} />
        </mesh>
        <mesh position={[0.05, 0.02, 0.155]}>
          <sphereGeometry args={[0.018, 8, 8]} />
          <meshBasicMaterial color={isCass ? '#4a9ead' : '#5a8a6a'} />
        </mesh>
        {/* Pupils — small dots */}
        <mesh position={[-0.05, 0.02, 0.165]}>
          <sphereGeometry args={[0.008, 6, 6]} />
          <meshBasicMaterial color="#111111" />
        </mesh>
        <mesh position={[0.05, 0.02, 0.165]}>
          <sphereGeometry args={[0.008, 6, 6]} />
          <meshBasicMaterial color="#111111" />
        </mesh>
        {/* Eye shine (white dot reflection) */}
        <mesh position={[-0.042, 0.028, 0.168]}>
          <sphereGeometry args={[0.004, 4, 4]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        <mesh position={[0.058, 0.028, 0.168]}>
          <sphereGeometry args={[0.004, 4, 4]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>

        {/* Mouth — simple friendly smile */}
        <mesh position={[0, -0.04, 0.14]}>
          <torusGeometry args={[0.025, 0.004, 6, 12, Math.PI]} />
          <meshBasicMaterial color="#d4868a" />
        </mesh>

        {/* Blush spots (Sims signature) */}
        <mesh position={[-0.08, -0.01, 0.12]}>
          <sphereGeometry args={[0.02, 6, 6]} />
          <meshStandardMaterial color="#f0a0a0" transparent opacity={0.4} roughness={1} />
        </mesh>
        <mesh position={[0.08, -0.01, 0.12]}>
          <sphereGeometry args={[0.02, 6, 6]} />
          <meshStandardMaterial color="#f0a0a0" transparent opacity={0.4} roughness={1} />
        </mesh>

        {/* Nose — tiny bump */}
        <mesh position={[0, -0.01, 0.15]}>
          <sphereGeometry args={[0.012, 6, 6]} />
          <meshStandardMaterial color={new THREE.Color(skinColor).offsetHSL(0, 0, -0.03).getStyle()} roughness={0.7} />
        </mesh>
      </group>

      {/* ---- STATUS INDICATOR ---- */}
      {isWorking && (
        <group position={[0, 1.1, 0]}>
          <mesh>
            <sphereGeometry args={[0.02, 8, 8]} />
            <meshStandardMaterial
              color="#22c55e"
              emissive="#22c55e"
              emissiveIntensity={2}
            />
          </mesh>
        </group>
      )}
    </group>
  );
}
