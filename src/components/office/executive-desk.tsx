'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import GLBAvatar from './glb-avatar';

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

function CoffeeMug({ position, mugColor = '#f8f4f0' }: { position: [number, number, number]; mugColor?: string }) {
  return (
    <group position={position}>
      {/* Mug body */}
      <mesh>
        <cylinderGeometry args={[0.035, 0.03, 0.07, 8]} />
        <meshStandardMaterial color={mugColor} roughness={0.6} />
      </mesh>
      {/* Handle */}
      <mesh position={[0.04, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.018, 0.005, 6, 12, Math.PI]} />
        <meshStandardMaterial color={mugColor} roughness={0.6} />
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
      {/* ---- DOUBLE-WIDE DESK SURFACE ---- */}
      <mesh position={[0, 0.74, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.2, 0.05, 0.9]} />
        <meshStandardMaterial color="#f5f0ec" metalness={0.05} roughness={0.4} />
      </mesh>

      {/* Desk edge trim — indigo accent */}
      <mesh position={[0, 0.74, 0.45]}>
        <boxGeometry args={[3.2, 0.05, 0.015]} />
        <meshStandardMaterial color="#6366f1" metalness={0.3} roughness={0.5} />
      </mesh>

      {/* Legs — brushed steel */}
      {(
        [
          [-1.5, 0.37, -0.38],
          [1.5, 0.37, -0.38],
          [-1.5, 0.37, 0.38],
          [1.5, 0.37, 0.38],
        ] as [number, number, number][]
      ).map((pos, i) => (
        <mesh key={i} position={pos}>
          <boxGeometry args={[0.04, 0.74, 0.04]} />
          <meshStandardMaterial color="#c0c0c8" metalness={0.8} roughness={0.2} />
        </mesh>
      ))}

      {/* Modesty panel — back */}
      <mesh position={[0, 0.42, -0.42]}>
        <boxGeometry args={[3.1, 0.62, 0.015]} />
        <meshStandardMaterial color="#e8e4e0" metalness={0.05} roughness={0.7} />
      </mesh>

      {/* ---- TRIPLE MONITORS — centered ---- */}
      <WideMonitor position={[-0.85, 1.12, -0.2]} isWorking={isWorking} color={agentColor} />
      <WideMonitor position={[0, 1.12, -0.2]} isWorking={isWorking} color={agentColor} />
      <WideMonitor position={[0.85, 1.12, -0.2]} isWorking={isWorking} color={agentColor} />

      {/* ---- KEYBOARD + MOUSE ---- */}
      {/* Keyboard */}
      <group position={[0, 0.78, 0.18]}>
        <mesh rotation={[0.05, 0, 0]}>
          <boxGeometry args={[0.38, 0.015, 0.13]} />
          <meshStandardMaterial color="#2a2a30" metalness={0.3} roughness={0.5} />
        </mesh>
        {[0.04, 0.02, 0, -0.02, -0.04].map((z, i) => (
          <mesh key={i} position={[0, 0.009, z]} rotation={[0.05, 0, 0]}>
            <boxGeometry args={[0.34, 0.004, 0.014]} />
            <meshStandardMaterial color="#353540" />
          </mesh>
        ))}
      </group>
      {/* Mouse + pad */}
      <group position={[0.4, 0.77, 0.18]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.2, 0.18]} />
          <meshStandardMaterial color="#1a1a22" roughness={0.95} />
        </mesh>
        <mesh position={[0, 0.005, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <capsuleGeometry args={[0.018, 0.035, 6, 8]} />
          <meshStandardMaterial color="#1e1e28" metalness={0.3} roughness={0.4} />
        </mesh>
      </group>

      {/* ---- COFFEE MUGS ---- */}
      <CoffeeMug position={[-1.2, 0.81, 0.25]} mugColor="#6366f1" />
      <CoffeeMug position={[1.2, 0.81, 0.2]} mugColor="#f8f4f0" />

      {/* ---- DESK PLANT ---- */}
      <group position={[-1.4, 0.77, -0.15]}>
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

      {/* ---- NAME PLATE ---- */}
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

      {/* ---- AGENT (in front of desk, facing monitors) ---- */}
      <group position={[0, 0, 1.0]} rotation={[0, Math.PI, 0]}>
        <GLBAvatar
          color={agentColor}
          agentId={agentId}
          isWorking={isWorking}
        />
        <Billboard position={[0, 2.1, 0]} follow lockX={false} lockY={false} lockZ={false}>
          <mesh position={[0, 0, -0.01]}>
            {/* +0.4 extra for the star emoji prefix */}
            <planeGeometry args={[agentName.length * 0.075 + 0.55, 0.18]} />
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
