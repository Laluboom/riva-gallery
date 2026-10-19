'use client'
import { useRef, useState, useMemo, useCallback, useEffect, Suspense } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Text, Html, useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { Exhibit } from '@/types'
import { useGalleryStore } from '@/lib/store'

interface ArtworkFrameProps {
  exhibit: Exhibit
  position: [number, number, number]
  rotation?: [number, number, number]
  isActive?: boolean
}

/** Each size is a diagonal budget; the artwork's own aspect ratio decides the shape. */
const FRAME_CONFIGS = {
  small: { w: 1.2, h: 0.9 },
  medium: { w: 1.8, h: 1.3 },
  large: { w: 2.6, h: 1.9 },
  wide: { w: 3.2, h: 1.4 },
}

/**
 * Fits the frame to the picture instead of cropping the picture to the frame.
 * The area of the slot is preserved so a portrait and a landscape piece still
 * read as comparable in weight on the wall.
 */
function fitToAspect(w: number, h: number, aspect?: number) {
  if (!aspect || !isFinite(aspect) || aspect <= 0) return { w, h }
  const area = w * h
  const fitH = Math.sqrt(area / aspect)
  return { w: fitH * aspect, h: fitH }
}

/**
 * Loads the exhibit's photograph. Separated from ArtworkFrame because
 * useTexture suspends, and only the picture plane should be held back by it —
 * the frame, plaque and lighting render immediately.
 */
function PhotoPlane({
  url,
  w,
  h,
  frameDepth,
  roughness,
}: {
  url: string
  w: number
  h: number
  frameDepth: number
  roughness: number
}) {
  const texture = useTexture(url)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 8

  // drei caches loaded textures in the useLoader cache, so unmounting a room's
  // frames does not on its own release any GPU memory — the count only grows as
  // you walk through the gallery. Dropping the cache entry and disposing on
  // unmount is what actually frees it. Safe here because every exhibit has its
  // own image URL, so no other frame is sharing this texture.
  useEffect(() => {
    return () => {
      useTexture.clear(url)
      texture.dispose()
    }
  }, [url, texture])

  return (
    <mesh position={[0, 0, frameDepth * 0.3]} castShadow receiveShadow>
      <planeGeometry args={[w, h]} />
      <meshStandardMaterial map={texture} roughness={roughness} metalness={0} toneMapped />
    </mesh>
  )
}

export function ArtworkFrame({ exhibit, position, rotation = [0, 0, 0], isActive = false }: ArtworkFrameProps) {
  const groupRef = useRef<THREE.Group>(null)
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)
  const setActiveExhibit = useGalleryStore((s) => s.setActiveExhibit)

  const size = exhibit.size ?? 'medium'
  const slot = FRAME_CONFIGS[size]
  const { w, h } = fitToAspect(slot.w, slot.h, exhibit.aspect)

  const frameDepth = exhibit.frameStyle === 'ornate' ? 0.06 : 0.03
  const frameThickness = exhibit.frameStyle === 'ornate' ? 0.12 : 0.07
  const isPhotograph = exhibit.frameStyle === 'photograph'
  const isBook = exhibit.frameStyle === 'book'

  const hasPhoto = Boolean(exhibit.imageUrl)
  const artTexture = useMemo(
    () => (hasPhoto ? null : createArtTexture(exhibit, w * 256, h * 256)),
    [hasPhoto, exhibit, w, h]
  )

  const frameMaterial = useMemo(() => {
    if (exhibit.frameStyle === 'ornate') {
      return new THREE.MeshStandardMaterial({ color: '#C9A84C', roughness: 0.3, metalness: 0.7 })
    }
    if (exhibit.frameStyle === 'photograph') {
      return new THREE.MeshStandardMaterial({ color: '#E8E4DC', roughness: 0.5, metalness: 0.1 })
    }
    if (exhibit.frameStyle === 'book') {
      return new THREE.MeshStandardMaterial({
        color: exhibit.accentColor || '#6B4226',
        roughness: 0.8,
        metalness: 0.0,
      })
    }
    return new THREE.MeshStandardMaterial({ color: '#3A3028', roughness: 0.6, metalness: 0.2 })
  }, [exhibit.frameStyle, exhibit.accentColor])

  const artMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: artTexture ?? null,
        roughness: exhibit.frameStyle === 'photograph' ? 0.1 : 0.7,
        metalness: 0.0,
        emissive: new THREE.Color(exhibit.gradientTo || '#000'),
        emissiveIntensity: hovered ? 0.12 : 0.04,
      }),
    [artTexture, hovered, exhibit.frameStyle, exhibit.gradientTo]
  )

  // Rooms unmount as you walk away, so anything created per mount accumulates:
  // without this the gallery gained roughly four textures per traversal.
  // Deliberately split in two — artMaterial is rebuilt on every hover, so
  // bundling it with the texture would dispose a live texture twice a hover.
  useEffect(() => {
    return () => {
      artTexture?.dispose()
      frameMaterial.dispose()
    }
  }, [artTexture, frameMaterial])

  useEffect(() => {
    const material = artMaterial
    return () => material.dispose()
  }, [artMaterial])

  useFrame((state) => {
    if (!groupRef.current) return
    const t = state.clock.elapsedTime

    if (hovered) {
      groupRef.current.position.z = position[2] + Math.sin(t * 2) * 0.003 + 0.02
      groupRef.current.scale.setScalar(1.015)
    } else {
      groupRef.current.position.z = position[2]
      groupRef.current.scale.setScalar(1.0)
    }
  })

  const handleClick = useCallback(() => {
    setActiveExhibit(exhibit)
  }, [exhibit, setActiveExhibit])

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={rotation as [number, number, number]}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onClick={handleClick}
    >
      {/* Outer frame */}
      <FrameBorder w={w} h={h} thickness={frameThickness} depth={frameDepth} material={frameMaterial} />

      {/* The artwork itself: the real photograph where we have one, a procedural
          texture otherwise — which is also what shows while the photo loads. */}
      {exhibit.imageUrl ? (
        <Suspense
          fallback={
            <mesh position={[0, 0, frameDepth * 0.3]}>
              <planeGeometry args={[w, h]} />
              <meshStandardMaterial color="#EDE6D8" roughness={0.9} />
            </mesh>
          }
        >
          <PhotoPlane
            url={exhibit.imageUrl}
            w={w}
            h={h}
            frameDepth={frameDepth}
            roughness={isPhotograph ? 0.25 : 0.55}
          />
        </Suspense>
      ) : (
        <mesh ref={meshRef} position={[0, 0, frameDepth * 0.3]} castShadow receiveShadow>
          <planeGeometry args={[w, h]} />
          <primitive object={artMaterial} />
        </mesh>
      )}

      {/* Spotlight cone hinting */}
      {hovered && (
        <pointLight
          position={[0, h * 0.3, 0.4]}
          color={exhibit.accentColor || '#FFE8A0'}
          intensity={2.0}
          distance={3}
          decay={2}
        />
      )}

      {/* Museum plaque */}
      {hovered && (
        <group position={[0, -h / 2 - 0.18, 0.01]}>
          <mesh>
            <planeGeometry args={[Math.min(w, 2.0), 0.26]} />
            <meshStandardMaterial color="#E8DFC8" roughness={0.6} />
          </mesh>
          <Text
            position={[0, 0.04, 0.01]}
            fontSize={0.065}
            color="#2A1E14"
            anchorX="center"
            anchorY="middle"
            font="/fonts/PlayfairDisplay-Bold.ttf"
            maxWidth={Math.min(w - 0.1, 1.8)}
          >
            {exhibit.title}
          </Text>
          <Text
            position={[0, -0.06, 0.01]}
            fontSize={0.045}
            color="#5A4A3A"
            anchorX="center"
            anchorY="middle"
            maxWidth={Math.min(w - 0.1, 1.8)}
          >
            {exhibit.subtitle || exhibit.medium || exhibit.year || ''}
          </Text>
        </group>
      )}
    </group>
  )
}

function FrameBorder({
  w,
  h,
  thickness,
  depth,
  material,
}: {
  w: number
  h: number
  thickness: number
  depth: number
  material: THREE.Material
}) {
  const t = thickness
  const d = depth

  return (
    <group>
      {/* Top */}
      <mesh position={[0, h / 2 + t / 2, 0]}>
        <boxGeometry args={[w + t * 2, t, d]} />
        <primitive object={material} />
      </mesh>
      {/* Bottom */}
      <mesh position={[0, -(h / 2 + t / 2), 0]}>
        <boxGeometry args={[w + t * 2, t, d]} />
        <primitive object={material} />
      </mesh>
      {/* Left */}
      <mesh position={[-(w / 2 + t / 2), 0, 0]}>
        <boxGeometry args={[t, h + t * 2, d]} />
        <primitive object={material} />
      </mesh>
      {/* Right */}
      <mesh position={[w / 2 + t / 2, 0, 0]}>
        <boxGeometry args={[t, h + t * 2, d]} />
        <primitive object={material} />
      </mesh>
    </group>
  )
}

function createArtTexture(exhibit: Exhibit, width: number, height: number): THREE.Texture {
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(width)
  canvas.height = Math.round(height)
  const ctx = canvas.getContext('2d')!

  const from = exhibit.gradientFrom || '#1A1612'
  const to = exhibit.gradientTo || '#3D2B1F'
  const accent = exhibit.accentColor || '#C9A84C'

  const grad = ctx.createLinearGradient(0, 0, width, height)
  grad.addColorStop(0, from)
  grad.addColorStop(1, to)
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, width, height)

  // Abstract mark-making based on category
  if (exhibit.category === 'artwork') {
    drawAbstractArt(ctx, width, height, accent, from)
  } else if (exhibit.category === 'journal') {
    drawJournalTexture(ctx, width, height, accent)
  } else if (exhibit.category === 'travel') {
    drawTravelTexture(ctx, width, height, accent, from, to)
  } else if (exhibit.category === 'book') {
    drawBookTexture(ctx, width, height, accent, exhibit.title)
  } else if (exhibit.category === 'project') {
    drawProjectTexture(ctx, width, height, accent)
  } else {
    drawAboutTexture(ctx, width, height, accent)
  }

  const texture = new THREE.CanvasTexture(canvas)
  return texture
}

function drawAbstractArt(ctx: CanvasRenderingContext2D, w: number, h: number, accent: string, from: string) {
  ctx.globalAlpha = 0.3
  for (let i = 0; i < 12; i++) {
    const x = Math.random() * w
    const y = Math.random() * h
    const r = 20 + Math.random() * 80
    const grad = ctx.createRadialGradient(x, y, 0, x, y, r)
    grad.addColorStop(0, accent)
    grad.addColorStop(1, 'transparent')
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.globalAlpha = 0.15
  for (let i = 0; i < 8; i++) {
    ctx.strokeStyle = accent
    ctx.lineWidth = 1 + Math.random() * 3
    ctx.beginPath()
    ctx.moveTo(Math.random() * w, Math.random() * h)
    ctx.bezierCurveTo(
      Math.random() * w,
      Math.random() * h,
      Math.random() * w,
      Math.random() * h,
      Math.random() * w,
      Math.random() * h
    )
    ctx.stroke()
  }
  ctx.globalAlpha = 1
}

function drawJournalTexture(ctx: CanvasRenderingContext2D, w: number, h: number, accent: string) {
  ctx.globalAlpha = 0.12
  const lineH = 18
  for (let y = lineH * 2; y < h - lineH; y += lineH) {
    ctx.strokeStyle = accent
    ctx.lineWidth = 0.8
    ctx.beginPath()
    ctx.moveTo(w * 0.1, y)
    ctx.lineTo(w * 0.9, y)
    ctx.stroke()
  }
  ctx.globalAlpha = 0.5
  ctx.strokeStyle = accent
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(w * 0.15, 0)
  ctx.lineTo(w * 0.15, h)
  ctx.stroke()
  ctx.globalAlpha = 1
}

function drawTravelTexture(ctx: CanvasRenderingContext2D, w: number, h: number, accent: string, from: string, to: string) {
  ctx.globalAlpha = 0.2
  const horiz = ctx.createLinearGradient(0, h * 0.6, 0, h)
  horiz.addColorStop(0, 'transparent')
  horiz.addColorStop(1, 'rgba(0,0,0,0.6)')
  ctx.fillStyle = horiz
  ctx.fillRect(0, 0, w, h)

  ctx.globalAlpha = 0.15
  for (let i = 0; i < 5; i++) {
    const y = h * (0.1 + Math.random() * 0.5)
    ctx.strokeStyle = '#FFFFFF'
    ctx.lineWidth = 1
    ctx.beginPath()
    for (let x = 0; x < w; x += 4) {
      ctx.lineTo(x, y + Math.sin(x * 0.04 + i) * 6)
    }
    ctx.stroke()
  }
  ctx.globalAlpha = 1
}

function drawBookTexture(ctx: CanvasRenderingContext2D, w: number, h: number, accent: string, title: string) {
  ctx.globalAlpha = 0.25
  ctx.strokeStyle = accent
  ctx.lineWidth = 3
  ctx.strokeRect(w * 0.08, h * 0.08, w * 0.84, h * 0.84)
  ctx.lineWidth = 1
  ctx.strokeRect(w * 0.1, h * 0.1, w * 0.8, h * 0.8)

  ctx.globalAlpha = 0.9
  ctx.fillStyle = accent
  ctx.font = `bold ${Math.floor(w * 0.07)}px serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  const words = title.split(' ')
  const lineH = h * 0.1
  const startY = h * 0.35
  words.slice(0, 4).forEach((word, i) => {
    ctx.fillText(word, w / 2, startY + i * lineH)
  })

  ctx.globalAlpha = 0.4
  ctx.strokeStyle = accent
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(w * 0.2, h * 0.7)
  ctx.lineTo(w * 0.8, h * 0.7)
  ctx.stroke()

  ctx.globalAlpha = 1
}

function drawProjectTexture(ctx: CanvasRenderingContext2D, w: number, h: number, accent: string) {
  ctx.globalAlpha = 0.2
  const gridSize = 24
  ctx.strokeStyle = accent
  ctx.lineWidth = 0.5
  for (let x = 0; x < w; x += gridSize) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, h)
    ctx.stroke()
  }
  for (let y = 0; y < h; y += gridSize) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(w, y)
    ctx.stroke()
  }

  ctx.globalAlpha = 0.6
  const cx = w / 2
  const cy = h / 2
  const r = Math.min(w, h) * 0.2
  ctx.strokeStyle = accent
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(cx - r, cy)
  ctx.lineTo(cx + r, cy)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(cx, cy - r)
  ctx.lineTo(cx, cy + r)
  ctx.stroke()

  ctx.globalAlpha = 1
}

function drawAboutTexture(ctx: CanvasRenderingContext2D, w: number, h: number, accent: string) {
  ctx.globalAlpha = 0.15
  const cx = w / 2
  const cy = h / 2
  for (let i = 1; i <= 4; i++) {
    ctx.strokeStyle = accent
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.arc(cx, cy, (Math.min(w, h) / 10) * i, 0, Math.PI * 2)
    ctx.stroke()
  }

  ctx.globalAlpha = 0.35
  ctx.fillStyle = accent
  ctx.font = `${Math.floor(w * 0.12)}px serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('RG', cx, cy)

  ctx.globalAlpha = 1
}
