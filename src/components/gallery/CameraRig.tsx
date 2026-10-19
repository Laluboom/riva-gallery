'use client'
import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useGalleryStore } from '@/lib/store'
import { ROOM_POSITIONS, CAMERA_HEIGHT, ROOM_DEPTH } from '@/data/content'
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
  const setCurrentRoom = useGalleryStore((s) => s.setCurrentRoom)

  const standDepth = standDepthFor(size.width, size.height)
  const gazeLift = gazeLiftFor(size.width, size.height)
  const targetPos = useRef(new THREE.Vector3(0, CAMERA_HEIGHT, 2))
  const currentPos = useRef(new THREE.Vector3(0, CAMERA_HEIGHT, 2))
  const targetLook = useRef(new THREE.Vector3(0, CAMERA_HEIGHT - 0.1, -5))
  const placed = useRef(false)

  useEffect(() => {
    const roomIdx = Math.round(progress)
    const clampedRoom = Math.max(0, Math.min(roomIdx, GALLERY_ROOMS.length - 1))
    const roomZ = ROOM_POSITIONS[clampedRoom]

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
    const lerpFactor = 1 - Math.pow(0.05, delta)

    currentPos.current.lerp(targetPos.current, lerpFactor * 2.5)

    camera.position.copy(currentPos.current)

    const lookX = Math.sin(lookAngle) * 5
    const lookZ = currentPos.current.z - Math.cos(lookAngle) * 5

    targetLook.current.set(lookX, CAMERA_HEIGHT - 0.08 + gazeLift, lookZ)

    const currentLook = new THREE.Vector3()
    currentLook.copy(camera.getWorldDirection(new THREE.Vector3()))
    currentLook.multiplyScalar(5).add(camera.position)

    currentLook.lerp(targetLook.current, lerpFactor * 3)
    camera.lookAt(currentLook)
  })

  return null
}
