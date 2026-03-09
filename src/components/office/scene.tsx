'use client';

import { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Text, Sky } from '@react-three/drei';
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
      {/* Main floor - light wood */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[24, 20]} />
        <meshStandardMaterial color="#c4a882" roughness={0.6} metalness={0.02} />
      </mesh>
      {/* Wood plank lines */}
      {Array.from({ length: 30 }).map((_, i) => {
        const pos = i * 0.8 - 12;
        return (
          <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[pos, 0.001, 0]}>
            <planeGeometry args={[0.005, 20]} />
            <meshStandardMaterial color="#b09870" transparent opacity={0.3} />
          </mesh>
        );
      })}
      {/* Carpet / rug under desks */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0.5]}>
        <planeGeometry args={[14, 6]} />
        <meshStandardMaterial color="#8890a8" roughness={0.95} />
      </mesh>
    </group>
  );
}

/* ---- WALLS ---- */
function Walls() {
  return (
    <group>
      {/* Back wall - light */}
      <mesh position={[0, 2.5, -8]} receiveShadow>
        <planeGeometry args={[24, 5]} />
        <meshStandardMaterial color="#e8e4e0" roughness={0.9} />
      </mesh>
      {/* Left wall */}
      <mesh position={[-12, 2.5, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[16, 5]} />
        <meshStandardMaterial color="#e4e0dc" roughness={0.9} />
      </mesh>
      {/* Right wall - windows */}
      <mesh position={[12, 2.5, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[16, 5]} />
        <meshStandardMaterial color="#e4e0dc" roughness={0.9} />
      </mesh>

      {/* Windows on right wall (light sources) */}
      {[-4, 0, 4].map((z, i) => (
        <group key={i}>
          {/* Window frame */}
          <mesh position={[11.98, 2.8, z]} rotation={[0, -Math.PI / 2, 0]}>
            <planeGeometry args={[2.5, 2.8]} />
            <meshStandardMaterial
              color="#c8e0f8"
              emissive="#d0e8ff"
              emissiveIntensity={0.6}
              transparent
              opacity={0.85}
            />
          </mesh>
          {/* Window dividers */}
          <mesh position={[11.97, 2.8, z]} rotation={[0, -Math.PI / 2, 0]}>
            <boxGeometry args={[0.02, 2.8, 0.04]} />
            <meshStandardMaterial color="#f0f0f0" />
          </mesh>
          <mesh position={[11.97, 2.8, z]} rotation={[0, -Math.PI / 2, 0]}>
            <boxGeometry args={[2.5, 0.02, 0.04]} />
            <meshStandardMaterial color="#f0f0f0" />
          </mesh>
          {/* Light coming through windows */}
          <pointLight position={[10, 3, z]} intensity={0.8} distance={12} color="#fff8f0" />
        </group>
      ))}

      {/* Windows on left wall */}
      {[-4, 0, 4].map((z, i) => (
        <group key={`lw-${i}`}>
          <mesh position={[-11.98, 2.8, z]} rotation={[0, Math.PI / 2, 0]}>
            <planeGeometry args={[2.5, 2.8]} />
            <meshStandardMaterial
              color="#c8e0f8"
              emissive="#d0e8ff"
              emissiveIntensity={0.6}
              transparent
              opacity={0.85}
            />
          </mesh>
          <mesh position={[-11.97, 2.8, z]} rotation={[0, Math.PI / 2, 0]}>
            <boxGeometry args={[0.02, 2.8, 0.04]} />
            <meshStandardMaterial color="#f0f0f0" />
          </mesh>
          <mesh position={[-11.97, 2.8, z]} rotation={[0, Math.PI / 2, 0]}>
            <boxGeometry args={[2.5, 0.02, 0.04]} />
            <meshStandardMaterial color="#f0f0f0" />
          </mesh>
          <pointLight position={[-10, 3, z]} intensity={0.6} distance={12} color="#fff8f0" />
        </group>
      ))}

      {/* Accent wall strip (back wall) - indigo */}
      <mesh position={[0, 1.0, -7.98]}>
        <planeGeometry args={[24, 0.03]} />
        <meshStandardMaterial color="#6366f1" emissive="#6366f1" emissiveIntensity={0.3} />
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
        <meshStandardMaterial color="#f5f5f5" />
      </mesh>
      {/* Inner */}
      <mesh position={[0, 0, 0.011]}>
        <planeGeometry args={[1.3, 0.7]} />
        <meshStandardMaterial color="#ffffff" />
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

/* ---- PLANTS ---- */
function Plant({
  position,
  size = 1,
  potColor = '#d4a574',
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
        <meshStandardMaterial color="#5a4a38" roughness={1} />
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
              color={i % 3 === 0 ? '#3a8a4a' : i % 3 === 1 ? '#4aaa5a' : '#2e7a40'}
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
        <meshStandardMaterial color="#e0d0c0" roughness={0.85} />
      </mesh>
      {/* Trunk */}
      <mesh position={[0, 0.7, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.04, 0.8, 6]} />
        <meshStandardMaterial color="#8a6a40" roughness={0.9} />
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
            <meshStandardMaterial color="#3a9a4a" roughness={0.8} />
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
        <meshStandardMaterial color="#f0ece8" metalness={0.05} roughness={0.5} />
      </mesh>
      {(
        [[-1.8, 0.36, -0.65], [1.8, 0.36, -0.65], [-1.8, 0.36, 0.65], [1.8, 0.36, 0.65]] as [number, number, number][]
      ).map((pos, i) => (
        <mesh key={i} position={pos}>
          <boxGeometry args={[0.035, 0.72, 0.035]} />
          <meshStandardMaterial color="#c0c0c8" metalness={0.7} roughness={0.3} />
        </mesh>
      ))}
      <Text
        position={[0, 0.78, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.1}
        color="#8888a0"
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
        <meshStandardMaterial color="#e8e0d8" metalness={0.1} roughness={0.5} />
      </mesh>
      {/* Central leg */}
      <mesh position={[0, 0.36, 0]}>
        <cylinderGeometry args={[0.08, 0.12, 0.72, 8]} />
        <meshStandardMaterial color="#c0c0c8" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Base */}
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 0.04, 8]} />
        <meshStandardMaterial color="#c0c0c8" metalness={0.7} roughness={0.3} />
      </mesh>
      <Text
        position={[0, 0.78, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.1}
        color="#8888a0"
        anchorX="center"
        anchorY="middle"
        font={undefined}
      >
        BOARDROOM
      </Text>
      {/* Overhead pendant light */}
      <mesh position={[0, 3.5, 0]}>
        <cylinderGeometry args={[0.01, 0.01, 1.5, 4]} />
        <meshStandardMaterial color="#d0d0d8" />
      </mesh>
      <mesh position={[0, 2.7, 0]}>
        <coneGeometry args={[0.25, 0.15, 8, 1, true]} />
        <meshStandardMaterial color="#f0f0f0" metalness={0.4} roughness={0.3} side={THREE.DoubleSide} />
      </mesh>
      <pointLight position={[0, 2.5, 0]} intensity={0.4} distance={5} color="#fffaf0" />
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
        <meshStandardMaterial color="#e8e0d8" roughness={0.6} />
      </mesh>
      {/* Counter top */}
      <mesh position={[0, 1.01, 0]}>
        <boxGeometry args={[1.65, 0.02, 0.65]} />
        <meshStandardMaterial color="#f5f0ec" metalness={0.15} roughness={0.4} />
      </mesh>
      {/* Coffee machine */}
      <mesh position={[0.3, 1.25, 0]}>
        <boxGeometry args={[0.35, 0.45, 0.3]} />
        <meshStandardMaterial color="#2a2a30" metalness={0.4} roughness={0.4} />
      </mesh>
      {/* Power light */}
      <mesh position={[0.42, 1.35, 0.16]}>
        <sphereGeometry args={[0.015, 6, 6]} />
        <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={2} />
      </mesh>
      {/* Coffee mug */}
      <mesh position={[-0.3, 1.06, 0.1]}>
        <cylinderGeometry args={[0.04, 0.035, 0.08, 8]} />
        <meshStandardMaterial color="#f8f4f0" roughness={0.7} />
      </mesh>
      {/* Steam from mug */}
      <mesh position={[-0.3, 1.14, 0.1]}>
        <sphereGeometry args={[0.02, 6, 6]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.2} />
      </mesh>

      <Text
        position={[0, 1.6, 0]}
        fontSize={0.08}
        color="#888898"
        anchorX="center"
        anchorY="middle"
        font={undefined}
      >
        ☕ COFFEE BAR
      </Text>

      {/* Shelf above */}
      <mesh position={[0, 1.8, -0.2]}>
        <boxGeometry args={[1.4, 0.03, 0.25]} />
        <meshStandardMaterial color="#e8e0d8" roughness={0.7} />
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
        <meshStandardMaterial color="#ffffff" roughness={0.2} />
      </mesh>
      {/* Frame */}
      <mesh position={[0, 0.605, 0]}>
        <boxGeometry args={[2.05, 0.03, 0.05]} />
        <meshStandardMaterial color="#c0c0c8" metalness={0.6} />
      </mesh>
      <mesh position={[0, -0.605, 0]}>
        <boxGeometry args={[2.05, 0.03, 0.05]} />
        <meshStandardMaterial color="#c0c0c8" metalness={0.6} />
      </mesh>
      {/* Tray */}
      <mesh position={[0, -0.65, 0.05]}>
        <boxGeometry args={[1.8, 0.03, 0.08]} />
        <meshStandardMaterial color="#c0c0c8" metalness={0.6} />
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
        <meshStandardMaterial color="#d4c8b8" roughness={0.8} />
      </mesh>
      {/* Shelves */}
      {[-0.6, -0.2, 0.2, 0.6].map((y, i) => (
        <group key={i}>
          <mesh position={[0, y, 0]}>
            <boxGeometry args={[1.15, 0.02, 0.28]} />
            <meshStandardMaterial color="#e0d8c8" roughness={0.7} />
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
                  ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#3b82f6', '#a855f7', '#334155'][
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
      {/* ---- LIGHTING — BRIGHT DAYTIME ---- */}
      {/* Strong ambient fill */}
      <ambientLight intensity={0.6} color="#f8f4f0" />

      {/* Sun — warm directional key light */}
      <directionalLight
        position={[10, 12, 8]}
        intensity={1.2}
        color="#fff8e8"
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

      {/* Cool fill from opposite side */}
      <directionalLight position={[-8, 8, 4]} intensity={0.5} color="#e0e8ff" />

      {/* Overhead fill */}
      <directionalLight position={[0, 10, 0]} intensity={0.3} color="#ffffff" />

      {/* ---- ENVIRONMENT ---- */}
      <Floor />
      <Walls />

      {/* NO ceiling — open top for brightness */}

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
      <Plant position={[6, 0, 2]} size={1} potColor="#e0d0c0" />
      <Plant position={[-1.5, 0.73, -0.15]} size={0.5} potColor="#c8a880" />
      <Plant position={[1.5, 0.73, -0.15]} size={0.4} potColor="#c0a070" />
      <TallPlant position={[-10, 0, -6]} />
      <TallPlant position={[10, 0, -6]} />
      <TallPlant position={[-6, 0, -6]} />
      <Plant position={[8, 0, 2]} size={0.8} />

      {/* ---- DECORATIVE ---- */}
      <Bookshelf position={[10, 1, -7.8]} />

      {/* ---- SKY ---- */}
      <Sky
        distance={450000}
        sunPosition={[10, 20, 5]}
        inclination={0.55}
        azimuth={0.25}
        rayleigh={0.5}
      />

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

      <Environment preset="apartment" />
    </>
  );
}

export default function OfficeScene({ agents }: OfficeSceneProps) {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [8, 6, 10], fov: 45 }}
        shadows
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.5 }}
      >
        <Suspense fallback={null}>
          <SceneContent agents={agents} />
        </Suspense>
      </Canvas>
    </div>
  );
}
