'use client'
import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useGalleryStore } from '@/lib/store'
import { ROOM_POSITIONS, CAMERA_HEIGHT, ROOM_DEPTH, ROOM_WIDTH } from '@/data/content'
import { GALLERY_ROOMS } from '@/data/content'

/**
 * A 16-unit-wide room cannot show both side walls on a portrait screen: three.js
 * `fov` is vertical, so a tall viewport collapses horizontal coverage, and
 * widening the vertical fov far enough to compensate just fills the frame with
 * floor and ceiling.
 *
 * So portrait gets a different composition rather than a wider lens. The viewer
 * stands close to the back wall, where the focal piece fills the frame, and
 * reaches the side walls by looking left and right (drag, already wired for
 * touch). Landscape keeps the original room-sized view.
 */
const PORTRAIT_MAX_ASPECT = 0.85

/**
 * How far a full zoom walks the viewer forward, in world units.
 *
 * Zoom moves the viewer rather than narrowing the lens. A lens zoom magnifies
 * the frame but keeps every surface at the distance it was, so the room stays
 * as flat as a photograph of it — you get closer to the pixels, not to the
 * wall. Walking forward moves past the near art and opens the parallax that
 * makes the room read as a room.
 */
const MAX_DOLLY = 12

/** How close a dollied viewer may come to a wall, so zoom never clips through. */
const WALL_MARGIN = 1.2

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v))
}

function isPortrait(width: number, height: number) {
  return width / Math.max(height, 1) < PORTRAIT_MAX_ASPECT
}

function fovFor(width: number, height: number) {
  return isPortrait(width, height) ? 72 : 65
}

/**
 * How far into the room the viewer stands, as a fraction of its depth.
 *
 * Portrait cannot stand deep into the room: the shallowest side-wall placement
 * is at 0.45 of the depth, so a viewer at 0.68 would have several exhibits
 * behind them with no way to turn far enough to see them. 0.35 keeps every
 * placement ahead and inside the look limit, at the cost of a smaller focal
 * piece on the back wall.
 */
function standDepthFor(width: number, height: number) {
  return isPortrait(width, height) ? 0.35 : 0.3
}

/**
 * Standing close to the back wall puts the art above eye level, so portrait
 * tilts the gaze up to centre it. Landscape views the room from far enough back
 * that a level gaze already frames everything.
 */
function gazeLiftFor(width: number, height: number) {
  return isPortrait(width, height) ? 0.9 : 0
}

export function CameraRig() {
  const { camera, size } = useThree()
  const progress = useGalleryStore((s) => s.progress)
  const lookAngle = useGalleryStore((s) => s.lookAngle)
  const lookPitch = useGalleryStore((s) => s.lookPitch)
  const zoom = useGalleryStore((s) => s.zoom)
  const setCurrentRoom = useGalleryStore((s) => s.setCurrentRoom)

  const standDepth = standDepthFor(size.width, size.height)
  const gazeLift = gazeLiftFor(size.width, size.height)
  const targetPos = useRef(new THREE.Vector3(0, CAMERA_HEIGHT, 2))
  const currentPos = useRef(new THREE.Vector3(0, CAMERA_HEIGHT, 2))
  const targetLook = useRef(new THREE.Vector3(0, CAMERA_HEIGHT - 0.1, -5))
  const placed = useRef(false)
  const dollied = useRef(new THREE.Vector3())
  /** The current room's front edge, for keeping a dolly inside its walls. */
  const roomFrontZ = useRef(ROOM_POSITIONS[0])

  useEffect(() => {
    const roomIdx = Math.round(progress)
    const clampedRoom = Math.max(0, Math.min(roomIdx, GALLERY_ROOMS.length - 1))
    const roomZ = ROOM_POSITIONS[clampedRoom]
    roomFrontZ.current = roomZ

    // Landscape: just inside the doorway, so everything hung between 0.45 and
    // 0.85 of the depth is ahead of the viewer. Portrait: close to the back
    // wall — see standDepthFor.
    targetPos.current.set(0, CAMERA_HEIGHT, roomZ - ROOM_DEPTH * standDepth)

    // First placement snaps. Otherwise a visitor returning from an article to,
    // say, room 3 watches the camera fly the length of the gallery through the
    // unlit space between rooms, which reads as a black screen.
    if (!placed.current) {
      placed.current = true
      currentPos.current.copy(targetPos.current)
      camera.position.copy(targetPos.current)
    }

    setCurrentRoom(clampedRoom)
  }, [camera, progress, setCurrentRoom, standDepth])

  useEffect(() => {
    const perspective = camera as THREE.PerspectiveCamera
    perspective.fov = fovFor(size.width, size.height)
    perspective.updateProjectionMatrix()
  }, [camera, size.width, size.height])

  useFrame((state, delta) => {
    // `1 - 0.05^delta` is already the fraction to cover this frame, so the 2.5
    // and 3 below are speed-ups that can push it past 1 — an overshoot, and past
    // 2 a divergence that throws the camera millions of units away. At 60fps
    // delta is 0.016 and nothing shows; a frame longer than ~0.28s (a
    // backgrounded tab coming back, a hitch, a laptop waking) is what reaches
    // it. Clamping costs nothing and keeps a long frame to a straight jump.
    const lerpFactor = 1 - Math.pow(0.05, delta)
    const posAlpha = Math.min(1, lerpFactor * 2.5)
    const lookAlpha = Math.min(1, lerpFactor * 3)

    // Zoom walks forward along the current gaze. The approach tapers — 1/zoom
    // — so the last of the range is a nudge rather than a lunge at the wall.
    const dolly = (1 - 1 / zoom) * MAX_DOLLY
    const dirX = Math.sin(lookAngle)
    const dirZ = -Math.cos(lookAngle)
    const halfWidth = ROOM_WIDTH / 2 - WALL_MARGIN

    dollied.current.set(
      clamp(targetPos.current.x + dirX * dolly, -halfWidth, halfWidth),
      targetPos.current.y,
      clamp(
        targetPos.current.z + dirZ * dolly,
        roomFrontZ.current - ROOM_DEPTH + WALL_MARGIN,
        roomFrontZ.current - WALL_MARGIN
      )
    )

    currentPos.current.lerp(dollied.current, posAlpha)

    camera.position.copy(currentPos.current)

    // Relative to where the viewer now stands: a dollied camera is no longer on
    // the room's centre line, and an absolute target would swing the gaze.
    // Pitch shortens the horizontal reach by cos, so tilting up tilts the gaze
    // instead of swinging the target out along a longer arm.
    const flat = Math.cos(lookPitch) * 5
    const lookX = currentPos.current.x + Math.sin(lookAngle) * flat
    const lookZ = currentPos.current.z - Math.cos(lookAngle) * flat
    const lookY = CAMERA_HEIGHT - 0.08 + gazeLift + Math.sin(lookPitch) * 5

    targetLook.current.set(lookX, lookY, lookZ)

    const currentLook = new THREE.Vector3()
    currentLook.copy(camera.getWorldDirection(new THREE.Vector3()))
    currentLook.multiplyScalar(5).add(camera.position)

    currentLook.lerp(targetLook.current, lookAlpha)
    camera.lookAt(currentLook)
  })

  return null
}
