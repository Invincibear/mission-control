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

  // Sims-style colors
  const skinColor = '#f0c8a0';
  const shirtColor = isCass ? '#111118' : color; // Cass: black tank top
  const pantsColor = isCass ? '#1e293b' : '#334155';
  const hairColor = isCass ? '#0f0a06' : new THREE.Color(color).offsetHSL(0, -0.3, -0.4).getStyle();
  const shoeColor = '#2a2a30';
  const tattooColor = '#2a4a5a';

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();

    if (isWorking) {
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
      {/* ---- LEGS ---- */}
      {isCass ? (
        <>
          {/* Cass: short-shorts + bare legs */}
          {/* Short shorts */}
          <mesh position={[0, 0.38, 0]} castShadow>
            <capsuleGeometry args={[0.12, 0.04, 4, 8]} />
            <meshStandardMaterial color={pantsColor} roughness={0.7} />
          </mesh>
          {/* Left leg — bare skin */}
          <mesh position={[-0.07, 0.18, 0]} castShadow>
            <capsuleGeometry args={[0.048, 0.2, 4, 8]} />
            <meshStandardMaterial color={skinColor} roughness={0.6} />
          </mesh>
          {/* Right leg — bare skin */}
          <mesh position={[0.07, 0.18, 0]} castShadow>
            <capsuleGeometry args={[0.048, 0.2, 4, 8]} />
            <meshStandardMaterial color={skinColor} roughness={0.6} />
          </mesh>
        </>
      ) : (
        <>
          {/* Other agents: full pants */}
          <mesh position={[-0.06, 0.2, 0]} castShadow>
            <capsuleGeometry args={[0.05, 0.18, 4, 8]} />
            <meshStandardMaterial color={pantsColor} roughness={0.8} />
          </mesh>
          <mesh position={[0.06, 0.2, 0]} castShadow>
            <capsuleGeometry args={[0.05, 0.18, 4, 8]} />
            <meshStandardMaterial color={pantsColor} roughness={0.8} />
          </mesh>
        </>
      )}
      {/* Shoes */}
      <mesh position={[-0.065, 0.05, 0.02]}>
        <boxGeometry args={[0.08, 0.05, 0.12]} />
        <meshStandardMaterial color={isCass ? '#1a1a1a' : shoeColor} roughness={0.7} />
      </mesh>
      <mesh position={[0.065, 0.05, 0.02]}>
        <boxGeometry args={[0.08, 0.05, 0.12]} />
        <meshStandardMaterial color={isCass ? '#1a1a1a' : shoeColor} roughness={0.7} />
      </mesh>

      {/* ---- BODY ---- */}
      {isCass ? (
        <>
          {/* Cass: curvy figure with tank top */}
          {/* Waist — narrow */}
          <mesh position={[0, 0.48, 0]} castShadow>
            <capsuleGeometry args={[0.1, 0.06, 6, 8]} />
            <meshStandardMaterial color={shirtColor} roughness={0.7} />
          </mesh>
          {/* Chest — fuller */}
          <mesh position={[0, 0.62, 0]} castShadow>
            <capsuleGeometry args={[0.15, 0.12, 6, 8]} />
            <meshStandardMaterial color={shirtColor} roughness={0.7} />
          </mesh>
          {/* Bust — two spheres for shape */}
          <mesh position={[-0.06, 0.62, 0.08]} castShadow>
            <sphereGeometry args={[0.07, 8, 8]} />
            <meshStandardMaterial color={shirtColor} roughness={0.7} />
          </mesh>
          <mesh position={[0.06, 0.62, 0.08]} castShadow>
            <sphereGeometry args={[0.07, 8, 8]} />
            <meshStandardMaterial color={shirtColor} roughness={0.7} />
          </mesh>
          {/* Tank top straps (skin visible at shoulders) */}
          <mesh position={[-0.1, 0.72, 0]}>
            <capsuleGeometry args={[0.03, 0.04, 4, 6]} />
            <meshStandardMaterial color={skinColor} roughness={0.6} />
          </mesh>
          <mesh position={[0.1, 0.72, 0]}>
            <capsuleGeometry args={[0.03, 0.04, 4, 6]} />
            <meshStandardMaterial color={skinColor} roughness={0.6} />
          </mesh>
          {/* Thin strap lines */}
          <mesh position={[-0.08, 0.74, 0.04]}>
            <boxGeometry args={[0.015, 0.06, 0.01]} />
            <meshStandardMaterial color={shirtColor} />
          </mesh>
          <mesh position={[0.08, 0.74, 0.04]}>
            <boxGeometry args={[0.015, 0.06, 0.01]} />
            <meshStandardMaterial color={shirtColor} />
          </mesh>
        </>
      ) : (
        /* Other agents: normal body */
        <mesh position={[0, 0.52, 0]} castShadow>
          <capsuleGeometry args={[0.14, 0.22, 6, 8]} />
          <meshStandardMaterial color={shirtColor} roughness={0.7} />
        </mesh>
      )}

      {/* ---- ARMS ---- */}
      {/* Left arm */}
      <group ref={leftArmRef} position={[isCass ? -0.19 : -0.18, 0.65, 0]}>
        {/* Upper arm — skin for Cass (tank top), shirt for others */}
        <mesh position={[0, -0.1, 0]} castShadow>
          <capsuleGeometry args={[0.038, 0.14, 4, 8]} />
          <meshStandardMaterial color={isCass ? skinColor : shirtColor} roughness={0.6} />
        </mesh>
        {/* Forearm */}
        <mesh position={[0, -0.22, 0]} castShadow>
          <capsuleGeometry args={[0.032, 0.1, 4, 8]} />
          <meshStandardMaterial color={skinColor} roughness={0.6} />
        </mesh>
        {/* Tattoo bands on left arm (Cass only) */}
        {isCass && (
          <>
            <mesh position={[0, -0.08, 0.035]}>
              <boxGeometry args={[0.05, 0.008, 0.01]} />
              <meshStandardMaterial color={tattooColor} roughness={0.9} />
            </mesh>
            <mesh position={[0, -0.1, 0.035]}>
              <boxGeometry args={[0.04, 0.006, 0.01]} />
              <meshStandardMaterial color={tattooColor} roughness={0.9} />
            </mesh>
            <mesh position={[0, -0.15, 0.03]}>
              <boxGeometry args={[0.035, 0.006, 0.01]} />
              <meshStandardMaterial color={tattooColor} roughness={0.9} />
            </mesh>
            {/* Forearm tattoo detail */}
            <mesh position={[0, -0.2, 0.03]}>
              <boxGeometry args={[0.025, 0.015, 0.008]} />
              <meshStandardMaterial color={tattooColor} roughness={0.9} />
            </mesh>
            <mesh position={[0, -0.22, 0.028]}>
              <boxGeometry args={[0.03, 0.008, 0.008]} />
              <meshStandardMaterial color={tattooColor} roughness={0.9} />
            </mesh>
          </>
        )}
        {/* Hand */}
        <mesh position={[0, -0.3, 0]}>
          <sphereGeometry args={[0.03, 6, 6]} />
          <meshStandardMaterial color={skinColor} roughness={0.7} />
        </mesh>
      </group>
      {/* Right arm */}
      <group ref={rightArmRef} position={[isCass ? 0.19 : 0.18, 0.65, 0]}>
        <mesh position={[0, -0.1, 0]} castShadow>
          <capsuleGeometry args={[0.038, 0.14, 4, 8]} />
          <meshStandardMaterial color={isCass ? skinColor : shirtColor} roughness={0.6} />
        </mesh>
        <mesh position={[0, -0.22, 0]} castShadow>
          <capsuleGeometry args={[0.032, 0.1, 4, 8]} />
          <meshStandardMaterial color={skinColor} roughness={0.6} />
        </mesh>
        {/* Tattoo on right arm (Cass only) — different pattern */}
        {isCass && (
          <>
            <mesh position={[0, -0.12, 0.035]}>
              <boxGeometry args={[0.045, 0.02, 0.008]} />
              <meshStandardMaterial color={tattooColor} roughness={0.9} />
            </mesh>
            <mesh position={[0, -0.16, 0.033]}>
              <boxGeometry args={[0.03, 0.012, 0.008]} />
              <meshStandardMaterial color={tattooColor} roughness={0.9} />
            </mesh>
            <mesh position={[0, -0.19, 0.03]}>
              <boxGeometry args={[0.04, 0.008, 0.008]} />
              <meshStandardMaterial color={tattooColor} roughness={0.9} />
            </mesh>
          </>
        )}
        <mesh position={[0, -0.3, 0]}>
          <sphereGeometry args={[0.03, 6, 6]} />
          <meshStandardMaterial color={skinColor} roughness={0.7} />
        </mesh>
      </group>

      {/* ---- NECK ---- */}
      <mesh position={[0, 0.76, 0]}>
        <cylinderGeometry args={[0.035, 0.04, 0.05, 8]} />
        <meshStandardMaterial color={skinColor} roughness={0.6} />
      </mesh>

      {/* ---- HEAD ---- */}
      <group ref={headRef} position={[0, 0.88, 0]}>
        {/* Head — big round Sims style */}
        <mesh castShadow>
          <sphereGeometry args={[0.15, 12, 10]} />
          <meshStandardMaterial color={skinColor} roughness={0.6} />
        </mesh>

        {/* Hair */}
        {isCass ? (
          // Cass: Megan Fox — long, voluminous, dark
          <>
            {/* Top volume */}
            <mesh position={[0, 0.07, -0.02]}>
              <sphereGeometry args={[0.16, 10, 8]} />
              <meshStandardMaterial color={hairColor} roughness={0.95} />
            </mesh>
            {/* Side hair — left, long and flowing */}
            <mesh position={[-0.12, -0.04, 0.02]}>
              <capsuleGeometry args={[0.06, 0.2, 4, 6]} />
              <meshStandardMaterial color={hairColor} roughness={0.95} />
            </mesh>
            {/* Side hair — right */}
            <mesh position={[0.12, -0.04, 0.02]}>
              <capsuleGeometry args={[0.06, 0.2, 4, 6]} />
              <meshStandardMaterial color={hairColor} roughness={0.95} />
            </mesh>
            {/* Back hair — long, past shoulders */}
            <mesh position={[0, -0.12, -0.06]}>
              <capsuleGeometry args={[0.12, 0.35, 4, 6]} />
              <meshStandardMaterial color={hairColor} roughness={0.95} />
            </mesh>
            {/* Extra back volume */}
            <mesh position={[0, -0.02, -0.08]}>
              <capsuleGeometry args={[0.13, 0.12, 4, 6]} />
              <meshStandardMaterial color={hairColor} roughness={0.95} />
            </mesh>
          </>
        ) : (
          <mesh position={[0, 0.08, -0.01]}>
            <sphereGeometry args={[0.15, 10, 8]} />
            <meshStandardMaterial color={hairColor} roughness={0.9} />
          </mesh>
        )}

        {/* Eyes — big, expressive */}
        <mesh position={[-0.05, 0.02, 0.13]}>
          <sphereGeometry args={[0.032, 8, 8]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        <mesh position={[0.05, 0.02, 0.13]}>
          <sphereGeometry args={[0.032, 8, 8]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        {/* Irises */}
        <mesh position={[-0.05, 0.02, 0.155]}>
          <sphereGeometry args={[0.018, 8, 8]} />
          <meshBasicMaterial color={isCass ? '#4a9ead' : '#5a8a6a'} />
        </mesh>
        <mesh position={[0.05, 0.02, 0.155]}>
          <sphereGeometry args={[0.018, 8, 8]} />
          <meshBasicMaterial color={isCass ? '#4a9ead' : '#5a8a6a'} />
        </mesh>
        {/* Pupils */}
        <mesh position={[-0.05, 0.02, 0.165]}>
          <sphereGeometry args={[0.008, 6, 6]} />
          <meshBasicMaterial color="#111111" />
        </mesh>
        <mesh position={[0.05, 0.02, 0.165]}>
          <sphereGeometry args={[0.008, 6, 6]} />
          <meshBasicMaterial color="#111111" />
        </mesh>
        {/* Eye shine */}
        <mesh position={[-0.042, 0.028, 0.168]}>
          <sphereGeometry args={[0.004, 4, 4]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        <mesh position={[0.058, 0.028, 0.168]}>
          <sphereGeometry args={[0.004, 4, 4]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>

        {/* Eyeliner / lashes (Cass — thicker, darker) */}
        {isCass && (
          <>
            <mesh position={[-0.05, 0.042, 0.13]}>
              <boxGeometry args={[0.05, 0.005, 0.02]} />
              <meshBasicMaterial color="#1a1a1a" />
            </mesh>
            <mesh position={[0.05, 0.042, 0.13]}>
              <boxGeometry args={[0.05, 0.005, 0.02]} />
              <meshBasicMaterial color="#1a1a1a" />
            </mesh>
          </>
        )}

        {/* Lips — fuller for Cass */}
        <mesh position={[0, -0.04, 0.14]}>
          <torusGeometry args={[isCass ? 0.028 : 0.025, isCass ? 0.006 : 0.004, 6, 12, Math.PI]} />
          <meshBasicMaterial color={isCass ? '#c45060' : '#d4868a'} />
        </mesh>

        {/* Blush */}
        <mesh position={[-0.08, -0.01, 0.12]}>
          <sphereGeometry args={[0.02, 6, 6]} />
          <meshStandardMaterial color="#f0a0a0" transparent opacity={0.35} roughness={1} />
        </mesh>
        <mesh position={[0.08, -0.01, 0.12]}>
          <sphereGeometry args={[0.02, 6, 6]} />
          <meshStandardMaterial color="#f0a0a0" transparent opacity={0.35} roughness={1} />
        </mesh>

        {/* Nose */}
        <mesh position={[0, -0.01, 0.15]}>
          <sphereGeometry args={[0.012, 6, 6]} />
          <meshStandardMaterial color={new THREE.Color(skinColor).offsetHSL(0, 0, -0.03).getStyle()} roughness={0.7} />
        </mesh>
      </group>

      {/* ---- STATUS INDICATOR ---- */}
      {isWorking && (
        <mesh position={[0, 1.15, 0]}>
          <sphereGeometry args={[0.02, 8, 8]} />
          <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={2} />
        </mesh>
      )}
    </group>
  );
}
