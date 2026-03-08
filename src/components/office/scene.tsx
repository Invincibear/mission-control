'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Text } from '@react-three/drei';
import Desk from './desk';

interface AgentInfo {
  id: string;
  name: string;
  color: string;
  isWorking: boolean;
}

function Floor() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#12121a" />
      </mesh>
      {Array.from({ length: 21 }).map((_, i) => {
        const pos = i - 10;
        return (
          <group key={i}>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[pos, 0.001, 0]}>
              <planeGeometry args={[0.01, 20]} />
              <meshStandardMaterial color="#2a2a3a" transparent opacity={0.5} />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, pos]}>
              <planeGeometry args={[20, 0.01]} />
              <meshStandardMaterial color="#2a2a3a" transparent opacity={0.5} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

function SharedTable() {
  return (
    <group position={[0, 0, -4]}>
      <mesh position={[0, 0.75, 0]}>
        <boxGeometry args={[4, 0.08, 1.5]} />
        <meshStandardMaterial color="#2a2a3a" />
      </mesh>
      {([[-1.8, 0.375, -0.6], [1.8, 0.375, -0.6], [-1.8, 0.375, 0.6], [1.8, 0.375, 0.6]] as [number, number, number][]).map((pos, i) => (
        <mesh key={i} position={pos}>
          <boxGeometry args={[0.08, 0.75, 0.08]} />
          <meshStandardMaterial color="#1a1a25" />
        </mesh>
      ))}
      <Text
        position={[0, 0.85, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.15}
        color="#686878"
        anchorX="center"
        anchorY="middle"
      >
        SHARED WORKSPACE
      </Text>
    </group>
  );
}

function Boardroom() {
  return (
    <group position={[6, 0, -2]}>
      <mesh position={[0, 0.75, 0]}>
        <cylinderGeometry args={[1.2, 1.2, 0.08, 8]} />
        <meshStandardMaterial color="#2a2a3a" />
      </mesh>
      <mesh position={[0, 0.375, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.75, 8]} />
        <meshStandardMaterial color="#1a1a25" />
      </mesh>
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.6, 0.6, 0.04, 8]} />
        <meshStandardMaterial color="#1a1a25" />
      </mesh>
      {Array.from({ length: 6 }).map((_, i) => {
        const angle = (i / 6) * Math.PI * 2;
        const x = Math.cos(angle) * 1.8;
        const z = Math.sin(angle) * 1.8;
        return (
          <group key={i} position={[x, 0, z]} rotation={[0, -angle + Math.PI, 0]}>
            <mesh position={[0, 0.45, 0]}>
              <boxGeometry args={[0.4, 0.05, 0.4]} />
              <meshStandardMaterial color="#1a1a25" />
            </mesh>
            <mesh position={[0, 0.7, -0.18]}>
              <boxGeometry args={[0.4, 0.45, 0.04]} />
              <meshStandardMaterial color="#1a1a25" />
            </mesh>
            <mesh position={[0, 0.22, 0]}>
              <cylinderGeometry args={[0.025, 0.025, 0.44, 6]} />
              <meshStandardMaterial color="#3a3a4a" />
            </mesh>
          </group>
        );
      })}
      <Text
        position={[0, 0.85, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.12}
        color="#686878"
        anchorX="center"
        anchorY="middle"
      >
        BOARDROOM
      </Text>
    </group>
  );
}

function CoffeeMachine() {
  return (
    <group position={[-6, 0, -3]}>
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[1.2, 1, 0.6]} />
        <meshStandardMaterial color="#2a2a3a" />
      </mesh>
      <mesh position={[0, 1.2, 0]}>
        <boxGeometry args={[0.5, 0.5, 0.4]} />
        <meshStandardMaterial color="#1a1a25" />
      </mesh>
      <mesh position={[0.15, 1.35, 0.21]}>
        <sphereGeometry args={[0.03, 6, 6]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={1} />
      </mesh>
      <mesh position={[0, 1.05, 0.15]}>
        <cylinderGeometry args={[0.06, 0.05, 0.1, 8]} />
        <meshStandardMaterial color="#e8e8ed" />
      </mesh>
      <Text
        position={[0, 1.55, 0]}
        fontSize={0.08}
        color="#686878"
        anchorX="center"
        anchorY="middle"
      >
        COFFEE
      </Text>
    </group>
  );
}

function Walls() {
  return (
    <group>
      <mesh position={[0, 2, -8]}>
        <planeGeometry args={[20, 4]} />
        <meshStandardMaterial color="#1a1a25" />
      </mesh>
      <mesh position={[-10, 2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[16, 4]} />
        <meshStandardMaterial color="#1a1a25" />
      </mesh>
      <mesh position={[10, 2, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[16, 4]} />
        <meshStandardMaterial color="#1a1a25" />
      </mesh>
    </group>
  );
}

interface OfficeSceneProps {
  agents: AgentInfo[];
}

function SceneContent({ agents }: OfficeSceneProps) {
  const deskPositions: [number, number, number][] = [
    [-3, 0, 1],
    [0, 0, 1],
    [3, 0, 1],
    [-3, 0, -1.5],
    [0, 0, -1.5],
    [3, 0, -1.5],
  ];

  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 8, 5]} intensity={0.6} castShadow />
      <pointLight position={[-6, 3, -3]} intensity={0.3} color="#f59e0b" />
      <pointLight position={[0, 3, 0]} intensity={0.4} color="#6366f1" />

      <Floor />
      <Walls />

      {agents.map((agent, i) => {
        const pos = deskPositions[i % deskPositions.length];
        const isFrontRow = pos[2] > 0;
        return (
          <Desk
            key={agent.id}
            position={pos}
            agentName={agent.name}
            agentColor={agent.color}
            isWorking={agent.isWorking}
            rotation={isFrontRow ? [0, Math.PI, 0] : [0, 0, 0]}
          />
        );
      })}

      <SharedTable />
      <Boardroom />
      <CoffeeMachine />

      <OrbitControls
        makeDefault
        minDistance={3}
        maxDistance={15}
        minPolarAngle={0.2}
        maxPolarAngle={Math.PI / 2.2}
        target={[0, 1, 0]}
      />

      <Environment preset="night" />
    </>
  );
}

export default function OfficeScene({ agents }: OfficeSceneProps) {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [6, 5, 8], fov: 50 }}
        shadows
        gl={{ antialias: true }}
      >
        <Suspense fallback={null}>
          <SceneContent agents={agents} />
        </Suspense>
      </Canvas>
    </div>
  );
}
