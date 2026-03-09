'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import AgentAvatar from './agent-avatar';

interface ExecutiveDeskProps {
  position: [number, number, number];
  agentName: string;
  agentId: string;
  agentColor: string;
  isWorking: boolean;
}

function WideMonitor({
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
      mat.emissiveIntensity = 0.2;
    }
  });

  return (
    <group position={position}>
      {/* Monitor arm */}
      <mesh position={[0, -0.18, 0]}>
        <cylinderGeometry args={[0.025, 0.03, 0.35, 8]} />
        <meshStandardMaterial color="#c0c0c8" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Arm base */}
      <mesh position={[0, -0.36, 0.03]}>
        <boxGeometry args={[0.15, 0.015, 0.1]} />
        <meshStandardMaterial color="#c0c0c8" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Ultrawide bezel */}
      <mesh>
        <boxGeometry args={[0.8, 0.35, 0.018]} />
        <meshStandardMaterial color="#1a1a20" metalness={0.3} roughness={0.5} />
      </mesh>
      {/* Screen */}
      <mesh ref={screenRef} position={[0, 0, 0.01]}>
        <planeGeometry args={[0.76, 0.31]} />
        <meshStandardMaterial
          color={isWorking ? '#0a1528' : '#060a12'}
          emissive={isWorking ? color : '#0a1020'}
          emissiveIntensity={isWorking ? 0.8 : 0.2}
        />
      </mesh>
    </group>
  );
}

function MechanicalKeyboard() {
  return (
    <group position={[0, 0.78, 0.18]}>
      {/* Keyboard body - slightly angled */}
      <mesh rotation={[0.05, 0, 0]}>
        <boxGeometry args={[0.38, 0.015, 0.13]} />
        <meshStandardMaterial color="#2a2a30" metalness={0.3} roughness={0.5} />
      </mesh>
      {/* Key rows */}
      {[0.04, 0.02, 0, -0.02, -0.04].map((z, i) => (
        <mesh key={i} position={[0, 0.009, z]} rotation={[0.05, 0, 0]}>
          <boxGeometry args={[0.34, 0.004, 0.014]} />
          <meshStandardMaterial color="#353540" />
        </mesh>
      ))}
      {/* Wrist rest */}
      <mesh position={[0, 0.003, 0.1]}>
        <boxGeometry args={[0.38, 0.01, 0.05]} />
        <meshStandardMaterial color="#3a3a42" roughness={0.8} />
      </mesh>
    </group>
  );
}

function GamingMouse() {
  return (
    <group position={[0.4, 0.78, 0.18]}>
      {/* Mouse pad */}
      <mesh position={[0, -0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.2, 0.18]} />
        <meshStandardMaterial color="#1a1a22" roughness={0.95} />
      </mesh>
      {/* Mouse body */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <capsuleGeometry args={[0.018, 0.035, 6, 8]} />
        <meshStandardMaterial color="#1e1e28" metalness={0.3} roughness={0.4} />
      </mesh>
    </group>
  );
}

export default function ExecutiveDesk({
  position,
  agentName,
  agentId,
  agentColor,
  isWorking,
}: ExecutiveDeskProps) {
  return (
    <group position={position}>
      {/* ---- DESK SURFACE — larger L-shape ---- */}
      {/* Main desk surface */}
      <mesh position={[0, 0.74, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.2, 0.05, 0.9]} />
        <meshStandardMaterial color="#f5f0ec" metalness={0.05} roughness={0.4} />
      </mesh>
      {/* Side wing (L-shape extension) */}
      <mesh position={[-1.2, 0.74, -0.5]} castShadow receiveShadow>
        <boxGeometry args={[0.7, 0.05, 0.6]} />
        <meshStandardMaterial color="#f5f0ec" metalness={0.05} roughness={0.4} />
      </mesh>

      {/* Desk edge trim — dark accent */}
      <mesh position={[0, 0.74, 0.45]}>
        <boxGeometry args={[2.2, 0.05, 0.015]} />
        <meshStandardMaterial color="#6366f1" metalness={0.3} roughness={0.5} />
      </mesh>

      {/* Legs — brushed steel */}
      {(
        [
          [-1.0, 0.37, -0.38],
          [1.0, 0.37, -0.38],
          [-1.0, 0.37, 0.38],
          [1.0, 0.37, 0.38],
          [-1.5, 0.37, -0.75],
        ] as [number, number, number][]
      ).map((pos, i) => (
        <mesh key={i} position={pos}>
          <boxGeometry args={[0.04, 0.74, 0.04]} />
          <meshStandardMaterial color="#c0c0c8" metalness={0.8} roughness={0.2} />
        </mesh>
      ))}

      {/* Modesty panel — back */}
      <mesh position={[0, 0.42, -0.42]}>
        <boxGeometry args={[2.1, 0.62, 0.015]} />
        <meshStandardMaterial color="#e8e4e0" metalness={0.05} roughness={0.7} />
      </mesh>

      {/* ---- TRIPLE ULTRAWIDE MONITORS ---- */}
      <WideMonitor position={[-0.5, 1.12, -0.2]} isWorking={isWorking} color={agentColor} />
      <WideMonitor position={[0.5, 1.12, -0.2]} isWorking={isWorking} color={agentColor} />
      {/* Side monitor on L-wing */}
      <group position={[-1.2, 1.05, -0.5]} rotation={[0, 0.4, 0]}>
        <WideMonitor position={[0, 0, 0]} isWorking={isWorking} color={agentColor} />
      </group>

      <MechanicalKeyboard />
      <GamingMouse />

      {/* ---- DESK ACCESSORIES ---- */}
      {/* Coffee mug with lobster emoji */}
      <mesh position={[0.75, 0.8, 0.25]}>
        <cylinderGeometry args={[0.035, 0.03, 0.07, 8]} />
        <meshStandardMaterial color="#6366f1" roughness={0.6} />
      </mesh>
      {/* Mug handle */}
      <mesh position={[0.785, 0.8, 0.25]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.018, 0.005, 6, 12, Math.PI]} />
        <meshStandardMaterial color="#6366f1" roughness={0.6} />
      </mesh>

      {/* Small desk plant */}
      <group position={[-0.85, 0.77, 0.25]}>
        <mesh>
          <cylinderGeometry args={[0.04, 0.035, 0.06, 8]} />
          <meshStandardMaterial color="#d4a574" roughness={0.85} />
        </mesh>
        <mesh position={[0, 0.05, 0]}>
          <sphereGeometry args={[0.03, 6, 6]} />
          <meshStandardMaterial color="#4a9a50" roughness={0.7} />
        </mesh>
        {[0, 1, 2, 3].map((j) => {
          const a = (j / 4) * Math.PI * 2;
          return (
            <mesh key={j} position={[Math.cos(a) * 0.02, 0.045, Math.sin(a) * 0.02]}>
              <sphereGeometry args={[0.02, 5, 5]} />
              <meshStandardMaterial color={j % 2 === 0 ? '#3d8a45' : '#5aaa58'} roughness={0.75} />
            </mesh>
          );
        })}
      </group>

      {/* ---- NAME PLATE on desk — engraved style ---- */}
      <group position={[0, 0.77, 0.38]}>
        <mesh>
          <boxGeometry args={[0.3, 0.06, 0.03]} />
          <meshStandardMaterial color="#1a1a22" metalness={0.5} roughness={0.3} />
        </mesh>
        <Text
          position={[0, 0, 0.016]}
          fontSize={0.025}
          color="#c8c8d0"
          anchorX="center"
          anchorY="middle"
          font={undefined}
        >
          {agentName.toUpperCase()}
        </Text>
      </group>

      {/* ---- AGENT (facing the room — boss position) ---- */}
      <group position={[0, 0, -0.8]} rotation={[0, Math.PI, 0]}>
        <AgentAvatar
          color={agentColor}
          agentId={agentId}
          isWorking={isWorking}
        />
        {/* Floating name label */}
        <Billboard position={[0, 1.45, 0]} follow lockX={false} lockY={false} lockZ={false}>
          <mesh position={[0, 0, -0.01]}>
            <planeGeometry args={[agentName.length * 0.075 + 0.2, 0.18]} />
            <meshBasicMaterial color="#6366f1" transparent opacity={0.9} />
          </mesh>
          <Text
            fontSize={0.1}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
            font={undefined}
          >
            ⭐ {agentName}
          </Text>
        </Billboard>
      </group>
    </group>
  );
}
