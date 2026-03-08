'use client';

import { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Text } from '@react-three/drei';
import * as THREE from 'three';
import Desk from './desk';

interface AgentInfo {
  id: string;
  name: string;
  color: string;
  isWorking: boolean;
}

/* ---- FLOOR ---- */
function Floor() {
  return (
    <group>
      {/* Main floor - warm wood tone */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[24, 20]} />
        <meshStandardMaterial color="#1e1a16" roughness={0.8} metalness={0.05} />
      </mesh>
      {/* Wood plank lines */}
      {Array.from({ length: 30 }).map((_, i) => {
        const pos = i * 0.8 - 12;
        return (
          <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[pos, 0.001, 0]}>
            <planeGeometry args={[0.005, 20]} />
            <meshStandardMaterial color="#2a241e" transparent opacity={0.4} />
          </mesh>
        );
      })}
      {/* Carpet / rug under desks */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0.5]}>
        <planeGeometry args={[14, 6]} />
        <meshStandardMaterial color="#1a1822" roughness={0.95} />
      </mesh>
    </group>
  );
}

/* ---- WALLS ---- */
function Walls() {
  return (
    <group>
      {/* Back wall */}
      <mesh position={[0, 2.5, -8]} receiveShadow>
        <planeGeometry args={[24, 5]} />
        <meshStandardMaterial color="#1e1c24" roughness={0.9} />
      </mesh>
      {/* Left wall */}
      <mesh position={[-12, 2.5, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[16, 5]} />
        <meshStandardMaterial color="#1c1a22" roughness={0.9} />
      </mesh>
      {/* Right wall */}
      <mesh position={[12, 2.5, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[16, 5]} />
        <meshStandardMaterial color="#1c1a22" roughness={0.9} />
      </mesh>

      {/* Accent wall strip (back wall) */}
      <mesh position={[0, 1.0, -7.98]}>
        <planeGeometry args={[24, 0.03]} />
        <meshStandardMaterial color="#6366f1" emissive="#6366f1" emissiveIntensity={0.5} />
      </mesh>

      {/* Wall art / posters */}
      <WallArt position={[-4, 2.8, -7.96]} text="SHIP IT" color="#22c55e" />
      <WallArt position={[0, 2.8, -7.96]} text="🦞" color="#f59e0b" size={0.4} />
      <WallArt position={[4, 2.8, -7.96]} text="MISSION CTRL" color="#6366f1" />
    </group>
  );
}

function WallArt({
  position,
  text,
  color,
  size = 0.18,
}: {
  position: [number, number, number];
  text: string;
  color: string;
  size?: number;
}) {
  return (
    <group position={position}>
      {/* Frame */}
      <mesh>
        <boxGeometry args={[1.4, 0.8, 0.02]} />
        <meshStandardMaterial color="#2a2830" />
      </mesh>
      {/* Inner */}
      <mesh position={[0, 0, 0.011]}>
        <planeGeometry args={[1.3, 0.7]} />
        <meshStandardMaterial color="#12111a" />
      </mesh>
      <Text
        position={[0, 0, 0.02]}
        fontSize={size}
        color={color}
        anchorX="center"
        anchorY="middle"
        font={undefined}
      >
        {text}
      </Text>
    </group>
  );
}

/* ---- CEILING LIGHTS ---- */
function CeilingLights() {
  const positions: [number, number, number][] = [
    [-4, 4.8, 0],
    [0, 4.8, 0],
    [4, 4.8, 0],
    [-4, 4.8, -4],
    [0, 4.8, -4],
    [4, 4.8, -4],
  ];

  return (
    <group>
      {/* Ceiling */}
      <mesh position={[0, 5, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[24, 20]} />
        <meshStandardMaterial color="#14131a" side={THREE.DoubleSide} />
      </mesh>

      {positions.map((pos, i) => (
        <group key={i} position={pos}>
          {/* Light fixture housing */}
          <mesh>
            <boxGeometry args={[1.2, 0.04, 0.15]} />
            <meshStandardMaterial color="#2a2830" metalness={0.5} roughness={0.3} />
          </mesh>
          {/* Light panel */}
          <mesh position={[0, -0.03, 0]}>
            <planeGeometry args={[1.1, 0.12]} />
            <meshStandardMaterial
              color="#f0f0ff"
              emissive="#e8e8ff"
              emissiveIntensity={0.4}
              transparent
              opacity={0.9}
            />
          </mesh>
          {/* Actual light source */}
          <pointLight
            position={[0, -0.5, 0]}
            intensity={0.25}
            distance={6}
            color="#f0eef8"
            castShadow={i < 3}
          />
        </group>
      ))}
    </group>
  );
}

/* ---- PLANTS ---- */
function Plant({
  position,
  size = 1,
  potColor = '#4a3728',
}: {
  position: [number, number, number];
  size?: number;
  potColor?: string;
}) {
  const leaves = useMemo(() => {
    const items: { angle: number; tilt: number; height: number; scale: number }[] = [];
    for (let i = 0; i < 8; i++) {
      items.push({
        angle: (i / 8) * Math.PI * 2 + Math.random() * 0.3,
        tilt: 0.3 + Math.random() * 0.4,
        height: 0.1 + Math.random() * 0.15,
        scale: 0.7 + Math.random() * 0.6,
      });
    }
    return items;
  }, []);

  return (
    <group position={position} scale={size}>
      {/* Pot */}
      <mesh position={[0, 0.12, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.1, 0.24, 8]} />
        <meshStandardMaterial color={potColor} roughness={0.9} />
      </mesh>
      {/* Soil */}
      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.11, 0.11, 0.02, 8]} />
        <meshStandardMaterial color="#2a1f14" roughness={1} />
      </mesh>
      {/* Leaves */}
      {leaves.map((leaf, i) => (
        <group
          key={i}
          position={[0, 0.26 + leaf.height * size, 0]}
          rotation={[leaf.tilt, leaf.angle, 0]}
        >
          <mesh position={[0, 0.08 * leaf.scale, 0]} castShadow>
            <sphereGeometry args={[0.06 * leaf.scale, 6, 6]} />
            <meshStandardMaterial
              color={i % 3 === 0 ? '#1a4a2a' : i % 3 === 1 ? '#2a6a3a' : '#1e5530'}
              roughness={0.8}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* ---- TALL PLANT ---- */
function TallPlant({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Pot */}
      <mesh position={[0, 0.2, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.14, 0.4, 8]} />
        <meshStandardMaterial color="#3a3035" roughness={0.85} />
      </mesh>
      {/* Trunk */}
      <mesh position={[0, 0.7, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.04, 0.8, 6]} />
        <meshStandardMaterial color="#4a3520" roughness={0.9} />
      </mesh>
      {/* Canopy */}
      {[0, 1, 2, 3, 4].map((i) => {
        const angle = (i / 5) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[
              Math.cos(angle) * 0.15,
              1.0 + Math.random() * 0.2,
              Math.sin(angle) * 0.15,
            ]}
            castShadow
          >
            <sphereGeometry args={[0.15 + Math.random() * 0.05, 8, 6]} />
            <meshStandardMaterial color="#1a5a2a" roughness={0.8} />
          </mesh>
        );
      })}
    </group>
  );
}

/* ---- SHARED TABLE ---- */
function SharedTable() {
  return (
    <group position={[0, 0, -5]}>
      <mesh position={[0, 0.72, 0]} castShadow receiveShadow>
        <boxGeometry args={[4, 0.05, 1.5]} />
        <meshStandardMaterial color="#3a3545" metalness={0.1} roughness={0.7} />
      </mesh>
      {(
        [[-1.8, 0.36, -0.65], [1.8, 0.36, -0.65], [-1.8, 0.36, 0.65], [1.8, 0.36, 0.65]] as [number, number, number][]
      ).map((pos, i) => (
        <mesh key={i} position={pos}>
          <boxGeometry args={[0.035, 0.72, 0.035]} />
          <meshStandardMaterial color="#2a2a35" metalness={0.7} roughness={0.3} />
        </mesh>
      ))}
      <Text
        position={[0, 0.78, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.1}
        color="#4a4a5a"
        anchorX="center"
        anchorY="middle"
        font={undefined}
      >
        SHARED WORKSPACE
      </Text>
    </group>
  );
}

/* ---- BOARDROOM ---- */
function Boardroom() {
  return (
    <group position={[8, 0, -3]}>
      {/* Conference table */}
      <mesh position={[0, 0.72, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.4, 1.4, 0.05, 12]} />
        <meshStandardMaterial color="#3a3040" metalness={0.15} roughness={0.6} />
      </mesh>
      {/* Central leg */}
      <mesh position={[0, 0.36, 0]}>
        <cylinderGeometry args={[0.08, 0.12, 0.72, 8]} />
        <meshStandardMaterial color="#2a2a35" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Base */}
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 0.04, 8]} />
        <meshStandardMaterial color="#2a2a35" metalness={0.7} roughness={0.3} />
      </mesh>
      <Text
        position={[0, 0.78, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.1}
        color="#4a4a5a"
        anchorX="center"
        anchorY="middle"
        font={undefined}
      >
        BOARDROOM
      </Text>
      {/* Overhead pendant light */}
      <mesh position={[0, 3.5, 0]}>
        <cylinderGeometry args={[0.01, 0.01, 1.5, 4]} />
        <meshStandardMaterial color="#2a2a35" />
      </mesh>
      <mesh position={[0, 2.7, 0]}>
        <coneGeometry args={[0.25, 0.15, 8, 1, true]} />
        <meshStandardMaterial color="#2a2830" metalness={0.6} roughness={0.3} side={THREE.DoubleSide} />
      </mesh>
      <pointLight position={[0, 2.5, 0]} intensity={0.5} distance={5} color="#f5e6d0" castShadow />
    </group>
  );
}

/* ---- COFFEE STATION ---- */
function CoffeeStation() {
  return (
    <group position={[-8, 0, -4]}>
      {/* Counter */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[1.6, 1, 0.6]} />
        <meshStandardMaterial color="#2a2535" roughness={0.7} />
      </mesh>
      {/* Counter top */}
      <mesh position={[0, 1.01, 0]}>
        <boxGeometry args={[1.65, 0.02, 0.65]} />
        <meshStandardMaterial color="#3a3545" metalness={0.2} roughness={0.5} />
      </mesh>
      {/* Coffee machine */}
      <mesh position={[0.3, 1.25, 0]}>
        <boxGeometry args={[0.35, 0.45, 0.3]} />
        <meshStandardMaterial color="#1a1a22" metalness={0.4} roughness={0.4} />
      </mesh>
      {/* Power light */}
      <mesh position={[0.42, 1.35, 0.16]}>
        <sphereGeometry args={[0.015, 6, 6]} />
        <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={2} />
      </mesh>
      {/* Coffee mug */}
      <mesh position={[-0.3, 1.06, 0.1]}>
        <cylinderGeometry args={[0.04, 0.035, 0.08, 8]} />
        <meshStandardMaterial color="#e8e0d0" roughness={0.7} />
      </mesh>
      {/* Steam from mug */}
      <mesh position={[-0.3, 1.14, 0.1]}>
        <sphereGeometry args={[0.02, 6, 6]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.15} />
      </mesh>

      <Text
        position={[0, 1.6, 0]}
        fontSize={0.08}
        color="#686878"
        anchorX="center"
        anchorY="middle"
        font={undefined}
      >
        ☕ COFFEE BAR
      </Text>

      {/* Shelf above */}
      <mesh position={[0, 1.8, -0.2]}>
        <boxGeometry args={[1.4, 0.03, 0.25]} />
        <meshStandardMaterial color="#2a2535" roughness={0.7} />
      </mesh>
      {/* Mugs on shelf */}
      {[-0.4, -0.15, 0.1, 0.35].map((x, i) => (
        <mesh key={i} position={[x, 1.85, -0.2]}>
          <cylinderGeometry args={[0.03, 0.025, 0.06, 8]} />
          <meshStandardMaterial
            color={['#6366f1', '#22c55e', '#f59e0b', '#ef4444'][i]}
            roughness={0.6}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ---- WHITEBOARD ---- */
function Whiteboard({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Board */}
      <mesh>
        <boxGeometry args={[2, 1.2, 0.04]} />
        <meshStandardMaterial color="#e8e8f0" roughness={0.3} />
      </mesh>
      {/* Frame */}
      <mesh position={[0, 0.605, 0]}>
        <boxGeometry args={[2.05, 0.03, 0.05]} />
        <meshStandardMaterial color="#4a4a55" metalness={0.6} />
      </mesh>
      <mesh position={[0, -0.605, 0]}>
        <boxGeometry args={[2.05, 0.03, 0.05]} />
        <meshStandardMaterial color="#4a4a55" metalness={0.6} />
      </mesh>
      {/* Tray */}
      <mesh position={[0, -0.65, 0.05]}>
        <boxGeometry args={[1.8, 0.03, 0.08]} />
        <meshStandardMaterial color="#4a4a55" metalness={0.6} />
      </mesh>
      {/* Markers */}
      {[-0.2, 0, 0.2].map((x, i) => (
        <mesh key={i} position={[x, -0.64, 0.06]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.01, 0.01, 0.1, 6]} />
          <meshStandardMaterial color={['#ef4444', '#22c55e', '#3b82f6'][i]} />
        </mesh>
      ))}
    </group>
  );
}

/* ---- BOOKSHELF ---- */
function Bookshelf({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Shelf frame */}
      <mesh>
        <boxGeometry args={[1.2, 2, 0.3]} />
        <meshStandardMaterial color="#2a2530" roughness={0.8} />
      </mesh>
      {/* Shelves */}
      {[-0.6, -0.2, 0.2, 0.6].map((y, i) => (
        <group key={i}>
          <mesh position={[0, y, 0]}>
            <boxGeometry args={[1.15, 0.02, 0.28]} />
            <meshStandardMaterial color="#3a3540" roughness={0.7} />
          </mesh>
          {/* Books */}
          {Array.from({ length: 4 + Math.floor(Math.random() * 3) }).map((_, j) => (
            <mesh
              key={j}
              position={[-0.4 + j * 0.14, y + 0.1, 0]}
            >
              <boxGeometry args={[0.08 + Math.random() * 0.04, 0.16 + Math.random() * 0.04, 0.18]} />
              <meshStandardMaterial
                color={
                  ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#3b82f6', '#a855f7', '#1e293b'][
                    Math.floor(Math.random() * 7)
                  ]
                }
                roughness={0.8}
              />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

/* ---- MAIN SCENE ---- */
interface OfficeSceneProps {
  agents: AgentInfo[];
}

function SceneContent({ agents }: OfficeSceneProps) {
  const deskPositions: [number, number, number][] = [
    [-3.5, 0, 1],
    [0, 0, 1],
    [3.5, 0, 1],
    [-3.5, 0, -1.5],
    [0, 0, -1.5],
    [3.5, 0, -1.5],
  ];

  return (
    <>
      {/* ---- LIGHTING ---- */}
      {/* Ambient base */}
      <ambientLight intensity={0.15} color="#e8e0f0" />

      {/* Key light - warm directional */}
      <directionalLight
        position={[8, 10, 6]}
        intensity={0.4}
        color="#ffeedd"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={30}
        shadow-camera-near={0.1}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
      />

      {/* Fill light - cool */}
      <directionalLight position={[-5, 6, 3]} intensity={0.15} color="#aabbff" />

      {/* Accent lights */}
      <pointLight position={[-8, 2.5, -4]} intensity={0.3} color="#f59e0b" distance={6} />
      <pointLight position={[0, 3, 0]} intensity={0.2} color="#6366f1" distance={8} />

      {/* ---- ENVIRONMENT ---- */}
      <Floor />
      <Walls />
      <CeilingLights />

      {/* ---- DESKS ---- */}
      {agents.map((agent, i) => {
        const pos = deskPositions[i % deskPositions.length];
        const isFrontRow = pos[2] > 0;
        return (
          <Desk
            key={agent.id}
            position={pos}
            agentName={agent.name}
            agentId={agent.id}
            agentColor={agent.color}
            isWorking={agent.isWorking}
            rotation={isFrontRow ? [0, Math.PI, 0] : [0, 0, 0]}
          />
        );
      })}

      {/* ---- FURNITURE ---- */}
      <SharedTable />
      <Boardroom />
      <CoffeeStation />
      <Whiteboard position={[-2, 2.5, -7.95]} />

      {/* ---- PLANTS ---- */}
      <Plant position={[-6, 0, 2]} size={1.2} />
      <Plant position={[6, 0, 2]} size={1} potColor="#3a3035" />
      <Plant position={[-1.5, 0.73, -0.15]} size={0.5} potColor="#5a4a3a" />
      <Plant position={[1.5, 0.73, -0.15]} size={0.4} potColor="#4a3a30" />
      <TallPlant position={[-10, 0, -6]} />
      <TallPlant position={[10, 0, -6]} />
      <TallPlant position={[-6, 0, -6]} />
      <Plant position={[8, 0, 2]} size={0.8} />

      {/* ---- DECORATIVE ---- */}
      <Bookshelf position={[10, 1, -7.8]} />

      {/* ---- CONTROLS ---- */}
      <OrbitControls
        makeDefault
        minDistance={3}
        maxDistance={18}
        minPolarAngle={0.2}
        maxPolarAngle={Math.PI / 2.1}
        target={[0, 1.2, -1]}
        enableDamping
        dampingFactor={0.05}
      />

      <Environment preset="night" />
      <fog attach="fog" args={['#0a0a12', 12, 25]} />
    </>
  );
}

export default function OfficeScene({ agents }: OfficeSceneProps) {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [8, 6, 10], fov: 45 }}
        shadows
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }}
      >
        <Suspense fallback={null}>
          <SceneContent agents={agents} />
        </Suspense>
      </Canvas>
    </div>
  );
}
