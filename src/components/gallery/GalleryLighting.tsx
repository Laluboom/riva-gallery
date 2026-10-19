'use client'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { ROOM_POSITIONS, ROOM_WIDTH, ROOM_HEIGHT, ROOM_DEPTH } from '@/data/content'

export function GalleryLighting({ currentRoom }: { currentRoom: number }) {
  const ambientRef = useRef<THREE.AmbientLight>(null)

  return (
    <>
      <ambientLight ref={ambientRef} intensity={0.72} color="#FFF8EE" />
      <hemisphereLight args={['#FFF5E0', '#8B6914', 0.15]} />

      {ROOM_POSITIONS.map((z, idx) => (
        <RoomLights key={idx} z={z} isActive={currentRoom === idx} />
      ))}
    </>
  )
}

function RoomLights({ z, isActive }: { z: number; isActive: boolean }) {
  const centerZ = z - ROOM_DEPTH / 2

  const fixtures = [
    { x: -ROOM_WIDTH * 0.3, fx: -ROOM_WIDTH * 0.3 },
    { x: 0, fx: 0 },
    { x: ROOM_WIDTH * 0.3, fx: ROOM_WIDTH * 0.3 },
  ]

  return (
    <>
      {fixtures.map((f, i) => (
        <group key={i}>
          <spotLight
            position={[f.x, ROOM_HEIGHT - 0.3, centerZ]}
            angle={0.55}
            penumbra={0.6}
            intensity={isActive ? 2.5 : 1.2}
            color="#FFF5E0"
            target-position={[f.fx, 0, centerZ]}
            castShadow
            shadow-mapSize={[512, 512]}
          />
        </group>
      ))}

      <pointLight
        position={[0, ROOM_HEIGHT * 0.7, centerZ]}
        intensity={isActive ? 0.6 : 0.2}
        color="#FFE8C0"
        distance={ROOM_WIDTH * 1.5}
        decay={2}
      />

      <spotLight
        position={[-ROOM_WIDTH * 0.45, ROOM_HEIGHT * 0.8, centerZ + ROOM_DEPTH * 0.1]}
        angle={0.4}
        penumbra={0.8}
        intensity={isActive ? 1.8 : 0.8}
        color="#FFD070"
        target-position={[-ROOM_WIDTH * 0.45, 0, centerZ]}
        castShadow={false}
      />
      <spotLight
        position={[ROOM_WIDTH * 0.45, ROOM_HEIGHT * 0.8, centerZ + ROOM_DEPTH * 0.1]}
        angle={0.4}
        penumbra={0.8}
        intensity={isActive ? 1.8 : 0.8}
        color="#FFD070"
        target-position={[ROOM_WIDTH * 0.45, 0, centerZ]}
        castShadow={false}
      />

      <spotLight
        position={[0, ROOM_HEIGHT * 0.8, z - 1]}
        angle={0.5}
        penumbra={0.7}
        intensity={isActive ? 1.5 : 0.5}
        color="#FFE4B0"
        target-position={[0, 0, z - 1]}
      />
    </>
  )
}
