'use client'
import { useRef, useMemo } from 'react'
import * as THREE from 'three'
import { ROOM_WIDTH, ROOM_HEIGHT, ROOM_DEPTH } from '@/data/content'

interface GalleryRoomProps {
  position: [number, number, number]
  wallColor?: string
  isActive?: boolean
}

export function GalleryRoom({ position, wallColor = '#FFF8EE', isActive = false }: GalleryRoomProps) {
  const floorTexture = useMemo(() => createParquetTexture(), [])
  const wallMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(wallColor),
        roughness: 0.85,
        metalness: 0.0,
      }),
    [wallColor]
  )
  const ceilingMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#FFFBF4',
        roughness: 0.9,
        metalness: 0.0,
      }),
    []
  )
  const floorMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: floorTexture,
        roughness: 0.85,
        metalness: 0.0,
      }),
    [floorTexture]
  )
  const moldingMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#FFF8EE',
        roughness: 0.7,
        metalness: 0.1,
      }),
    []
  )
  const baseMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#EADFC9',
        roughness: 0.8,
        metalness: 0.05,
      }),
    []
  )

  const [x, y, z] = position

  return (
    <group position={position}>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -ROOM_DEPTH / 2]} receiveShadow>
        <planeGeometry args={[ROOM_WIDTH, ROOM_DEPTH]} />
        <primitive object={floorMaterial} />
      </mesh>

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, ROOM_HEIGHT, -ROOM_DEPTH / 2]}>
        <planeGeometry args={[ROOM_WIDTH, ROOM_DEPTH]} />
        <primitive object={ceilingMaterial} />
      </mesh>

      {/* Back wall */}
      <mesh position={[0, ROOM_HEIGHT / 2, -ROOM_DEPTH]} receiveShadow>
        <planeGeometry args={[ROOM_WIDTH, ROOM_HEIGHT]} />
        <primitive object={wallMaterial} />
      </mesh>

      {/* Front wall (entrance/exit) */}
      <mesh rotation={[0, Math.PI, 0]} position={[0, ROOM_HEIGHT / 2, 0]}>
        <planeGeometry args={[ROOM_WIDTH, ROOM_HEIGHT]} />
        <primitive object={wallMaterial} />
      </mesh>

      {/* Left wall */}
      <mesh rotation={[0, Math.PI / 2, 0]} position={[-ROOM_WIDTH / 2, ROOM_HEIGHT / 2, -ROOM_DEPTH / 2]}>
        <planeGeometry args={[ROOM_DEPTH, ROOM_HEIGHT]} />
        <primitive object={wallMaterial} />
      </mesh>

      {/* Right wall */}
      <mesh rotation={[0, -Math.PI / 2, 0]} position={[ROOM_WIDTH / 2, ROOM_HEIGHT / 2, -ROOM_DEPTH / 2]}>
        <planeGeometry args={[ROOM_DEPTH, ROOM_HEIGHT]} />
        <primitive object={wallMaterial} />
      </mesh>

      {/* Crown molding - top of walls */}
      <CrownMolding material={moldingMaterial} />

      {/* Baseboard - bottom of walls */}
      <Baseboard material={baseMaterial} />

      {/* Ceiling coffers - decorative grid */}
      <CeilingDetail />

      {/* Doorway to next room (front opening suggestion) */}
      <DoorwayArch />
    </group>
  )
}

function CrownMolding({ material }: { material: THREE.Material }) {
  const h = 0.08
  const d = 0.06
  const y = ROOM_HEIGHT - h / 2

  return (
    <group>
      {/* Back */}
      <mesh position={[0, y, -ROOM_DEPTH + d / 2]}>
        <boxGeometry args={[ROOM_WIDTH, h, d]} />
        <primitive object={material} />
      </mesh>
      {/* Left */}
      <mesh position={[-ROOM_WIDTH / 2 + d / 2, y, -ROOM_DEPTH / 2]}>
        <boxGeometry args={[d, h, ROOM_DEPTH]} />
        <primitive object={material} />
      </mesh>
      {/* Right */}
      <mesh position={[ROOM_WIDTH / 2 - d / 2, y, -ROOM_DEPTH / 2]}>
        <boxGeometry args={[d, h, ROOM_DEPTH]} />
        <primitive object={material} />
      </mesh>
    </group>
  )
}

function Baseboard({ material }: { material: THREE.Material }) {
  const h = 0.12
  const d = 0.04
  const y = h / 2

  return (
    <group>
      <mesh position={[0, y, -ROOM_DEPTH + d / 2]}>
        <boxGeometry args={[ROOM_WIDTH, h, d]} />
        <primitive object={material} />
      </mesh>
      <mesh position={[-ROOM_WIDTH / 2 + d / 2, y, -ROOM_DEPTH / 2]}>
        <boxGeometry args={[d, h, ROOM_DEPTH]} />
        <primitive object={material} />
      </mesh>
      <mesh position={[ROOM_WIDTH / 2 - d / 2, y, -ROOM_DEPTH / 2]}>
        <boxGeometry args={[d, h, ROOM_DEPTH]} />
        <primitive object={material} />
      </mesh>
    </group>
  )
}

function CeilingDetail() {
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#E8E3DA',
        roughness: 0.9,
      }),
    []
  )

  const beams = []
  const cols = 3
  const rows = 4
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      const x = -ROOM_WIDTH / 2 + ((c + 1) * ROOM_WIDTH) / (cols + 1)
      const z = -((r + 1) * ROOM_DEPTH) / (rows + 1)
      beams.push({ x, z })
    }
  }

  return (
    <group>
      {/* Longitudinal beams */}
      {[-ROOM_WIDTH * 0.25, 0, ROOM_WIDTH * 0.25].map((x, i) => (
        <mesh key={`l${i}`} position={[x, ROOM_HEIGHT - 0.02, -ROOM_DEPTH / 2]}>
          <boxGeometry args={[0.06, 0.04, ROOM_DEPTH]} />
          <primitive object={material} />
        </mesh>
      ))}
      {/* Cross beams */}
      {[-ROOM_DEPTH * 0.25, -ROOM_DEPTH * 0.5, -ROOM_DEPTH * 0.75].map((z, i) => (
        <mesh key={`c${i}`} position={[0, ROOM_HEIGHT - 0.02, z]}>
          <boxGeometry args={[ROOM_WIDTH, 0.04, 0.06]} />
          <primitive object={material} />
        </mesh>
      ))}
    </group>
  )
}

function DoorwayArch() {
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#FFF8EE',
        roughness: 0.7,
      }),
    []
  )

  return (
    <group position={[0, 0, -ROOM_DEPTH]}>
      {/* Door left pillar */}
      <mesh position={[-1.4, ROOM_HEIGHT / 2 - 0.5, 0.02]}>
        <boxGeometry args={[0.2, ROOM_HEIGHT - 1, 0.06]} />
        <primitive object={material} />
      </mesh>
      {/* Door right pillar */}
      <mesh position={[1.4, ROOM_HEIGHT / 2 - 0.5, 0.02]}>
        <boxGeometry args={[0.2, ROOM_HEIGHT - 1, 0.06]} />
        <primitive object={material} />
      </mesh>
      {/* Door top arch lintel */}
      <mesh position={[0, ROOM_HEIGHT - 0.6, 0.02]}>
        <boxGeometry args={[3.0, 0.22, 0.06]} />
        <primitive object={material} />
      </mesh>
    </group>
  )
}

function createParquetTexture(): THREE.Texture {
  const size = 512
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!

  // Pale oak. The gold belongs on the frames, not underfoot.
  const colors = ['#C7B193', '#BFA886', '#CEB99C', '#B69E7D']
  const plankW = 64
  const plankH = 20

  for (let row = 0; row < Math.ceil(size / plankH); row++) {
    const offset = (row % 2) * (plankW / 2)
    for (let col = -1; col < Math.ceil(size / plankW) + 1; col++) {
      const colorIdx = (row + col) % colors.length
      ctx.fillStyle = colors[Math.abs(colorIdx)]
      const x = col * plankW + offset
      const y = row * plankH
      ctx.fillRect(x + 1, y + 1, plankW - 2, plankH - 2)

      ctx.strokeStyle = 'rgba(0,0,0,0.18)'
      ctx.lineWidth = 1
      ctx.strokeRect(x + 1, y + 1, plankW - 2, plankH - 2)

      const grain = ctx.createLinearGradient(x, y, x + plankW, y + plankH)
      grain.addColorStop(0, 'rgba(255,255,255,0.03)')
      grain.addColorStop(0.5, 'rgba(0,0,0,0.05)')
      grain.addColorStop(1, 'rgba(255,255,255,0.03)')
      ctx.fillStyle = grain
      ctx.fillRect(x + 1, y + 1, plankW - 2, plankH - 2)
    }
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(3, 3)
  return texture
}
