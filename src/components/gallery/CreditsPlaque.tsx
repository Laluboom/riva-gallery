'use client'
import { useState, useCallback } from 'react'
import { Html, Text } from '@react-three/drei'
import { ROOM_DEPTH, ROOM_WIDTH } from '@/data/content'

const CREDIT_URL = 'https://stalklalu.com'

/**
 * The builder's plaque, the way a building has one by the door rather than in
 * the lobby: small, low, and off to one side.
 *
 * Placed in the last room on the right wall at 0.43 of the depth and just above
 * the baseboard. The look angle is clamped to ±83°, so the doorway wall can
 * never be turned to — this sits at about 68°, which is reachable but only by
 * someone who walks to the end and deliberately looks right and down. It reads
 * as part of the moulding until the pointer finds it.
 */
export function CreditsPlaque() {
  const [hovered, setHovered] = useState(false)

  const open = useCallback(() => {
    window.open(CREDIT_URL, '_blank', 'noopener,noreferrer')
  }, [])

  return (
    <group
      position={[ROOM_WIDTH * 0.437, 0.62, -ROOM_DEPTH * 0.43]}
      rotation={[0, -Math.PI / 2, 0]}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onClick={open}
    >
      <mesh>
        <planeGeometry args={[0.62, 0.16]} />
        <meshStandardMaterial
          color={hovered ? '#C9A84C' : '#E6DCC6'}
          roughness={hovered ? 0.3 : 0.75}
          metalness={hovered ? 0.6 : 0.15}
        />
      </mesh>
      <Text
        position={[0, 0.028, 0.002]}
        fontSize={0.038}
        color={hovered ? '#2A1E14' : '#9A8A6A'}
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.04}
        font="/fonts/PlayfairDisplay-Regular.ttf"
      >
        built by laluboom & his claude
      </Text>
      <Text
        position={[0, -0.035, 0.002]}
        fontSize={0.028}
        color={hovered ? '#501511' : '#A89878'}
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.06}
      >
        stalklalu.com
      </Text>

      {/* The engraving is only a few pixels tall from across the room, which is
          what keeps it hidden. Once the pointer finds it, this renders at screen
          resolution so it can actually be read. */}
      {hovered && (
        <Html center distanceFactor={6} position={[0, 0.3, 0.05]} style={{ pointerEvents: 'none' }}>
          <div
            style={{
              whiteSpace: 'nowrap',
              background: 'rgba(255, 248, 238, 0.94)',
              border: '1px solid #C9A84C',
              borderRadius: 2,
              padding: '6px 10px',
              fontFamily: "'Libre Franklin', sans-serif",
              fontSize: 11,
              letterSpacing: '0.08em',
              color: '#2A1E14',
              textAlign: 'center',
              lineHeight: 1.5,
            }}
          >
            built by laluboom &amp; his claude
            <br />
            <span style={{ color: '#501511' }}>stalklalu.com ↗</span>
          </div>
        </Html>
      )}
    </group>
  )
}
