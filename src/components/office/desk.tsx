'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

interface DeskProps {
  position: [number, number, number];
  agentName: string;
  agentColor: string;
  isWorking: boolean;
  rotation?: [number, number, number];
}

function Monitor({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, -0.15, 0]}>
        <boxGeometry args={[0.04, 0.3, 0.04]} />
        <meshStandardMaterial color="#22222f" />
      </mesh>
      <mesh position={[0, -0.3, 0.05]}>
        <boxGeometry args={[0.15, 0.02, 0.1]} />
        <meshStandardMaterial color="#22222f" />
      </mesh>
      <mesh>
        <boxGeometry args={[0.5, 0.32, 0.02]} />
        <meshStandardMaterial color="#12121a" />
      </mesh>
      <mesh position={[0, 0, 0.011]}>
        <planeGeometry args={[0.45, 0.27]} />
        <meshStandardMaterial
          color="#0a1628"
          emissive="#1a3a6a"
          emissiveIntensity={0.6}
        />
      </mesh>
    </group>
  );
}

function AgentAvatar({
  color,
  name,
  isWorking,
}: {
  color: string;
  name: string;
  isWorking: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    if (isWorking) {
      groupRef.current.position.y = Math.sin(t * 4) * 0.008;
    } else {
      groupRef.current.position.y = Math.sin(t * 1.5) * 0.012;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh position={[0, 0.55, 0]} castShadow>
        <boxGeometry args={[0.28, 0.35, 0.18]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, 0.85, 0]} castShadow>
        <boxGeometry args={[0.2, 0.2, 0.18]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[-0.04, 0.87, 0.091]}>
        <planeGeometry args={[0.04, 0.04]} />
        <meshBasicMaterial color="white" />
      </mesh>
      <mesh position={[0.04, 0.87, 0.091]}>
        <planeGeometry args={[0.04, 0.04]} />
        <meshBasicMaterial color="white" />
      </mesh>
      <mesh position={[-0.04, 0.87, 0.092]}>
        <planeGeometry args={[0.02, 0.02]} />
        <meshBasicMaterial color="#12121a" />
      </mesh>
      <mesh position={[0.04, 0.87, 0.092]}>
        <planeGeometry args={[0.02, 0.02]} />
        <meshBasicMaterial color="#12121a" />
      </mesh>
      <mesh position={[-0.2, 0.5, 0.05]} castShadow>
        <boxGeometry args={[0.08, 0.25, 0.08]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0.2, 0.5, 0.05]} castShadow>
        <boxGeometry args={[0.08, 0.25, 0.08]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <Text
        position={[0, 1.1, 0]}
        fontSize={0.09}
        color="#e8e8ed"
        anchorX="center"
        anchorY="middle"
      >
        {name}
      </Text>
      {isWorking && (
        <mesh position={[0, 1.25, 0]}>
          <sphereGeometry args={[0.03, 8, 8]} />
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

function Chair() {
  return (
    <group position={[0, 0, 0.65]}>
      <mesh position={[0, 0.42, 0]}>
        <boxGeometry args={[0.35, 0.04, 0.35]} />
        <meshStandardMaterial color="#1e1e2e" />
      </mesh>
      <mesh position={[0, 0.68, -0.16]}>
        <boxGeometry args={[0.35, 0.48, 0.04]} />
        <meshStandardMaterial color="#1e1e2e" />
      </mesh>
      <mesh position={[0, 0.22, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 0.4, 6]} />
        <meshStandardMaterial color="#3a3a4a" />
      </mesh>
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.04, 8]} />
        <meshStandardMaterial color="#3a3a4a" />
      </mesh>
    </group>
  );
}

export default function Desk({
  position,
  agentName,
  agentColor,
  isWorking,
  rotation = [0, 0, 0],
}: DeskProps) {
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0.72, 0]} castShadow>
        <boxGeometry args={[1.6, 0.05, 0.7]} />
        <meshStandardMaterial color="#2a2a3a" />
      </mesh>
      {(
        [
          [-0.72, 0.36, -0.3],
          [0.72, 0.36, -0.3],
          [-0.72, 0.36, 0.3],
          [0.72, 0.36, 0.3],
        ] as [number, number, number][]
      ).map((pos, i) => (
        <mesh key={i} position={pos}>
          <boxGeometry args={[0.04, 0.72, 0.04]} />
          <meshStandardMaterial color="#1a1a25" />
        </mesh>
      ))}
      <Monitor position={[-0.3, 1.08, -0.15]} />
      <Monitor position={[0.3, 1.08, -0.15]} />
      <mesh position={[0, 0.76, 0.1]}>
        <boxGeometry args={[0.35, 0.015, 0.12]} />
        <meshStandardMaterial color="#12121a" />
      </mesh>
      <mesh position={[0.35, 0.76, 0.1]}>
        <boxGeometry args={[0.05, 0.015, 0.08]} />
        <meshStandardMaterial color="#12121a" />
      </mesh>
      <Chair />
      <group position={[0, 0, 0.6]}>
        <AgentAvatar
          color={agentColor}
          name={agentName}
          isWorking={isWorking}
        />
      </group>
    </group>
  );
}
