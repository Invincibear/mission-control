'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import AgentAvatar from './agent-avatar';

interface DeskProps {
  position: [number, number, number];
  agentName: string;
  agentId: string;
  agentColor: string;
  isWorking: boolean;
  rotation?: [number, number, number];
}

function Monitor({
  position,
  isWorking,
  color,
}: {
  position: [number, number, number];
  isWorking: boolean;
  color: string;
}) {
  const screenRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!screenRef.current) return;
    const mat = screenRef.current.material as THREE.MeshStandardMaterial;
    if (isWorking) {
      const t = clock.getElapsedTime();
      mat.emissiveIntensity = 0.8 + Math.sin(t * 2) * 0.2;
    } else {
      mat.emissiveIntensity = 0.15;
    }
  });

  return (
    <group position={position}>
      {/* Monitor stand */}
      <mesh position={[0, -0.15, 0]}>
        <cylinderGeometry args={[0.02, 0.025, 0.3, 8]} />
        <meshStandardMaterial color="#2a2a35" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Stand base */}
      <mesh position={[0, -0.3, 0.03]}>
        <boxGeometry args={[0.12, 0.01, 0.08]} />
        <meshStandardMaterial color="#2a2a35" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Screen bezel */}
      <mesh>
        <boxGeometry args={[0.5, 0.32, 0.015]} />
        <meshStandardMaterial color="#1a1a22" metalness={0.3} roughness={0.5} />
      </mesh>
      {/* Screen */}
      <mesh ref={screenRef} position={[0, 0, 0.009]}>
        <planeGeometry args={[0.46, 0.28]} />
        <meshStandardMaterial
          color={isWorking ? '#0e1a30' : '#080c14'}
          emissive={isWorking ? color : '#111828'}
          emissiveIntensity={isWorking ? 0.8 : 0.15}
        />
      </mesh>
    </group>
  );
}

function Keyboard() {
  return (
    <group position={[0, 0.76, 0.12]}>
      <mesh>
        <boxGeometry args={[0.3, 0.008, 0.1]} />
        <meshStandardMaterial color="#1e1e28" metalness={0.2} roughness={0.6} />
      </mesh>
      {/* Key rows (subtle details) */}
      {[0.03, 0.01, -0.01, -0.03].map((z, i) => (
        <mesh key={i} position={[0, 0.005, z]}>
          <boxGeometry args={[0.26, 0.003, 0.015]} />
          <meshStandardMaterial color="#252530" />
        </mesh>
      ))}
    </group>
  );
}

function Mouse() {
  return (
    <group position={[0.32, 0.76, 0.12]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <capsuleGeometry args={[0.015, 0.03, 6, 8]} />
        <meshStandardMaterial color="#1e1e28" metalness={0.2} roughness={0.5} />
      </mesh>
    </group>
  );
}

export default function Desk({
  position,
  agentName,
  agentId,
  agentColor,
  isWorking,
  rotation = [0, 0, 0],
}: DeskProps) {
  return (
    <group position={position} rotation={rotation}>
      {/* Desk surface */}
      <mesh position={[0, 0.72, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.6, 0.04, 0.7]} />
        <meshStandardMaterial color="#3a3545" metalness={0.1} roughness={0.7} />
      </mesh>

      {/* Desk legs - metal */}
      {(
        [
          [-0.72, 0.36, -0.3],
          [0.72, 0.36, -0.3],
          [-0.72, 0.36, 0.3],
          [0.72, 0.36, 0.3],
        ] as [number, number, number][]
      ).map((pos, i) => (
        <mesh key={i} position={pos}>
          <boxGeometry args={[0.035, 0.72, 0.035]} />
          <meshStandardMaterial color="#2a2a35" metalness={0.7} roughness={0.3} />
        </mesh>
      ))}

      {/* Modesty panel */}
      <mesh position={[0, 0.4, -0.32]}>
        <boxGeometry args={[1.5, 0.6, 0.015]} />
        <meshStandardMaterial color="#2a2535" metalness={0.1} roughness={0.8} />
      </mesh>

      {/* Monitors */}
      <Monitor position={[-0.3, 1.08, -0.15]} isWorking={isWorking} color={agentColor} />
      <Monitor position={[0.3, 1.08, -0.15]} isWorking={isWorking} color={agentColor} />

      <Keyboard />
      <Mouse />

      {/* Name plate on desk edge */}
      <Text
        position={[0, 0.75, 0.34]}
        fontSize={0.05}
        color="#888898"
        anchorX="center"
        anchorY="middle"
        font={undefined}
      >
        {agentName}
      </Text>

      {/* Agent standing behind desk */}
      <group position={[0, 0, 0.7]}>
        <AgentAvatar
          color={agentColor}
          agentId={agentId}
          isWorking={isWorking}
        />
      </group>
    </group>
  );
}
