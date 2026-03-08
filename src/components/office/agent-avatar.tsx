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
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);

  const isCass = agentId === 'cass';
  // Cass: Megan Fox inspired — dark hair, warm skin, fitted silhouette
  const skinColor = isCass ? '#d4a574' : color;
  const bodyColor = isCass ? '#1a1a2e' : color;
  const hairColor = isCass ? '#1a0f0a' : new THREE.Color(color).offsetHSL(0, -0.2, -0.3).getStyle();
  const eyeColor = isCass ? '#4a9ead' : '#ffffff';

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();

    if (isWorking) {
      // Typing: arms alternate, subtle lean forward
      if (leftArmRef.current) {
        leftArmRef.current.rotation.x = Math.sin(t * 8) * 0.12 - 0.6;
      }
      if (rightArmRef.current) {
        rightArmRef.current.rotation.x = Math.sin(t * 8 + Math.PI) * 0.12 - 0.6;
      }
      if (headRef.current) {
        headRef.current.rotation.x = Math.sin(t * 0.8) * 0.03 - 0.05;
        headRef.current.rotation.y = Math.sin(t * 0.5) * 0.08;
      }
    } else {
      // Idle: gentle breathing, slight weight shift
      if (groupRef.current) {
        groupRef.current.position.y = position[1] + Math.sin(t * 1.2) * 0.01;
      }
      if (leftArmRef.current) {
        leftArmRef.current.rotation.x = Math.sin(t * 0.8) * 0.03;
        leftArmRef.current.rotation.z = 0.08;
      }
      if (rightArmRef.current) {
        rightArmRef.current.rotation.x = Math.sin(t * 0.8 + 0.5) * 0.03;
        rightArmRef.current.rotation.z = -0.08;
      }
      if (headRef.current) {
        headRef.current.rotation.y = Math.sin(t * 0.3) * 0.1;
      }
      // Slight idle weight shift on legs
      if (leftLegRef.current) {
        leftLegRef.current.rotation.x = Math.sin(t * 0.6) * 0.02;
      }
      if (rightLegRef.current) {
        rightLegRef.current.rotation.x = Math.sin(t * 0.6 + Math.PI) * 0.02;
      }
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* ---- LEGS ---- */}
      {/* Left Leg */}
      <group ref={leftLegRef} position={[-0.08, 0.32, 0]}>
        {/* Thigh */}
        <mesh position={[0, 0, 0]} castShadow>
          <capsuleGeometry args={[0.055, 0.22, 6, 8]} />
          <meshStandardMaterial color={isCass ? '#1e293b' : bodyColor} />
        </mesh>
        {/* Shin */}
        <mesh position={[0, -0.25, 0]} castShadow>
          <capsuleGeometry args={[0.048, 0.2, 6, 8]} />
          <meshStandardMaterial color={isCass ? '#1e293b' : bodyColor} />
        </mesh>
        {/* Shoe */}
        <mesh position={[0, -0.42, 0.03]} castShadow>
          <boxGeometry args={[0.1, 0.06, 0.16]} />
          <meshStandardMaterial color={isCass ? '#0f0f0f' : '#1a1a25'} />
        </mesh>
      </group>

      {/* Right Leg */}
      <group ref={rightLegRef} position={[0.08, 0.32, 0]}>
        <mesh position={[0, 0, 0]} castShadow>
          <capsuleGeometry args={[0.055, 0.22, 6, 8]} />
          <meshStandardMaterial color={isCass ? '#1e293b' : bodyColor} />
        </mesh>
        <mesh position={[0, -0.25, 0]} castShadow>
          <capsuleGeometry args={[0.048, 0.2, 6, 8]} />
          <meshStandardMaterial color={isCass ? '#1e293b' : bodyColor} />
        </mesh>
        <mesh position={[0, -0.42, 0.03]} castShadow>
          <boxGeometry args={[0.1, 0.06, 0.16]} />
          <meshStandardMaterial color={isCass ? '#0f0f0f' : '#1a1a25'} />
        </mesh>
      </group>

      {/* ---- TORSO ---- */}
      {/* Lower torso / hips */}
      <mesh position={[0, 0.55, 0]} castShadow>
        <capsuleGeometry args={[0.14, 0.12, 6, 8]} />
        <meshStandardMaterial color={bodyColor} />
      </mesh>
      {/* Upper torso */}
      <mesh position={[0, 0.72, 0]} castShadow>
        <capsuleGeometry args={[0.15, 0.16, 6, 8]} />
        <meshStandardMaterial color={bodyColor} />
      </mesh>
      {/* Shoulders */}
      <mesh position={[0, 0.82, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <capsuleGeometry args={[0.16, 0.04, 6, 8]} />
        <meshStandardMaterial color={bodyColor} />
      </mesh>

      {/* ---- NECK ---- */}
      <mesh position={[0, 0.9, 0]} castShadow>
        <cylinderGeometry args={[0.045, 0.055, 0.06, 8]} />
        <meshStandardMaterial color={skinColor} />
      </mesh>

      {/* ---- HEAD ---- */}
      <group ref={headRef} position={[0, 1.02, 0]}>
        {/* Head shape - slightly oval */}
        <mesh castShadow>
          <sphereGeometry args={[0.13, 12, 10]} />
          <meshStandardMaterial color={skinColor} />
        </mesh>
        {/* Jaw / chin area */}
        <mesh position={[0, -0.06, 0.02]}>
          <sphereGeometry args={[0.1, 10, 8]} />
          <meshStandardMaterial color={skinColor} />
        </mesh>

        {/* Hair */}
        {isCass ? (
          // Megan Fox: long dark hair, sleek
          <group>
            {/* Top of hair */}
            <mesh position={[0, 0.06, -0.01]}>
              <sphereGeometry args={[0.14, 10, 8]} />
              <meshStandardMaterial color={hairColor} />
            </mesh>
            {/* Back hair - long, flowing */}
            <mesh position={[0, -0.06, -0.06]}>
              <capsuleGeometry args={[0.12, 0.25, 6, 8]} />
              <meshStandardMaterial color={hairColor} />
            </mesh>
            {/* Hair sides */}
            <mesh position={[-0.1, -0.02, 0]}>
              <capsuleGeometry args={[0.06, 0.15, 6, 8]} />
              <meshStandardMaterial color={hairColor} />
            </mesh>
            <mesh position={[0.1, -0.02, 0]}>
              <capsuleGeometry args={[0.06, 0.15, 6, 8]} />
              <meshStandardMaterial color={hairColor} />
            </mesh>
          </group>
        ) : (
          // Other agents: short styled hair
          <mesh position={[0, 0.07, -0.01]}>
            <sphereGeometry args={[0.135, 10, 8]} />
            <meshStandardMaterial color={hairColor} />
          </mesh>
        )}

        {/* Eyes */}
        <mesh position={[-0.045, 0.01, 0.11]}>
          <sphereGeometry args={[0.025, 8, 8]} />
          <meshStandardMaterial color="white" />
        </mesh>
        <mesh position={[0.045, 0.01, 0.11]}>
          <sphereGeometry args={[0.025, 8, 8]} />
          <meshStandardMaterial color="white" />
        </mesh>
        {/* Irises */}
        <mesh position={[-0.045, 0.01, 0.13]}>
          <sphereGeometry args={[0.014, 8, 8]} />
          <meshStandardMaterial
            color={eyeColor}
            emissive={isCass ? eyeColor : undefined}
            emissiveIntensity={isCass ? 0.3 : 0}
          />
        </mesh>
        <mesh position={[0.045, 0.01, 0.13]}>
          <sphereGeometry args={[0.014, 8, 8]} />
          <meshStandardMaterial
            color={eyeColor}
            emissive={isCass ? eyeColor : undefined}
            emissiveIntensity={isCass ? 0.3 : 0}
          />
        </mesh>
        {/* Pupils */}
        <mesh position={[-0.045, 0.01, 0.135]}>
          <sphereGeometry args={[0.007, 6, 6]} />
          <meshStandardMaterial color="#0a0a0a" />
        </mesh>
        <mesh position={[0.045, 0.01, 0.135]}>
          <sphereGeometry args={[0.007, 6, 6]} />
          <meshStandardMaterial color="#0a0a0a" />
        </mesh>

        {/* Lips / mouth */}
        <mesh position={[0, -0.04, 0.11]}>
          <boxGeometry args={[0.06, 0.012, 0.01]} />
          <meshStandardMaterial color={isCass ? '#c47070' : new THREE.Color(skinColor).offsetHSL(0, 0.1, -0.15).getStyle()} />
        </mesh>

        {/* Nose */}
        <mesh position={[0, -0.01, 0.13]}>
          <sphereGeometry args={[0.015, 6, 6]} />
          <meshStandardMaterial color={new THREE.Color(skinColor).offsetHSL(0, 0, -0.03).getStyle()} />
        </mesh>
      </group>

      {/* ---- ARMS ---- */}
      {/* Left Arm */}
      <group ref={leftArmRef} position={[-0.2, 0.78, 0]}>
        {/* Upper arm */}
        <mesh position={[0, -0.08, 0]} castShadow>
          <capsuleGeometry args={[0.045, 0.14, 6, 8]} />
          <meshStandardMaterial color={bodyColor} />
        </mesh>
        {/* Forearm */}
        <mesh position={[0, -0.24, 0.02]} castShadow>
          <capsuleGeometry args={[0.038, 0.14, 6, 8]} />
          <meshStandardMaterial color={isCass ? skinColor : bodyColor} />
        </mesh>
        {/* Hand */}
        <mesh position={[0, -0.35, 0.03]} castShadow>
          <sphereGeometry args={[0.03, 8, 6]} />
          <meshStandardMaterial color={skinColor} />
        </mesh>
      </group>

      {/* Right Arm */}
      <group ref={rightArmRef} position={[0.2, 0.78, 0]}>
        <mesh position={[0, -0.08, 0]} castShadow>
          <capsuleGeometry args={[0.045, 0.14, 6, 8]} />
          <meshStandardMaterial color={bodyColor} />
        </mesh>
        <mesh position={[0, -0.24, 0.02]} castShadow>
          <capsuleGeometry args={[0.038, 0.14, 6, 8]} />
          <meshStandardMaterial color={isCass ? skinColor : bodyColor} />
        </mesh>
        <mesh position={[0, -0.35, 0.03]} castShadow>
          <sphereGeometry args={[0.03, 8, 6]} />
          <meshStandardMaterial color={skinColor} />
        </mesh>
      </group>

      {/* ---- STATUS INDICATOR ---- */}
      {isWorking && (
        <mesh position={[0, 1.25, 0]}>
          <sphereGeometry args={[0.025, 8, 8]} />
          <meshStandardMaterial
            color="#22c55e"
            emissive="#22c55e"
            emissiveIntensity={2}
          />
        </mesh>
      )}
    </group>
  );
}
