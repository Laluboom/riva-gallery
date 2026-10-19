'use client'
import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import { GalleryScene } from './GalleryScene'
import * as THREE from 'three'

export function GalleryCanvas() {
  return (
    <Canvas
      shadows
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.1,
        outputColorSpace: THREE.SRGBColorSpace,
      }}
      camera={{ fov: 65, near: 0.1, far: 200, position: [0, 1.6, 2] }}
      style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
      performance={{ min: 0.5 }}
      onCreated={({ gl }) => {
        if (process.env.NODE_ENV !== 'production') {
          ;(window as unknown as { __gl?: unknown }).__gl = gl
        }
      }}
    >
      <Suspense fallback={null}>
        <GalleryScene />
      </Suspense>
    </Canvas>
  )
}
