'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ThreeEvent } from '@react-three/fiber'
import { Html, Text } from '@react-three/drei'
import { ROOM_DEPTH, ROOM_WIDTH } from '@/data/content'

const CREDIT_URL = 'https://stalklalu.com'

/** How long a tap-revealed label stays up before hiding itself again. */
const TOUCH_REVEAL_MS = 5000

/**
 * The builder's plaque, the way a building has one by the door rather than in
 * the lobby: small, low on the studio's right wall and past the last exhibit,
 * so it takes walking to the end and deliberately looking right to find.
 *
 * It sits at 0.62 of the room depth rather than closer to the doorway. Nearer
 * placements are at a steeper angle from where the viewer stands — 76° in
 * portrait, which foreshortens the plaque to a quarter of its width and leaves
 * a sliver nobody could hit. 0.62 reads at about 45° on desktop and 50° in
 * portrait while still being well outside the default view.
 */
export function CreditsPlaque() {
  const [revealed, setRevealed] = useState(false)
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Touch has no hover, so the first tap stands in for it. Kept in both a ref
  // and state: the handlers need the value synchronously, the label needs a
  // render when it changes.
  const armed = useRef(false)
  const [armedNow, setArmedNow] = useState(false)
  const setArmed = useCallback((v: boolean) => {
    armed.current = v
    setArmedNow(v)
  }, [])

  useEffect(() => () => {
    if (hideTimer.current) clearTimeout(hideTimer.current)
  }, [])

  const open = useCallback(() => {
    window.open(CREDIT_URL, '_blank', 'noopener,noreferrer')
  }, [])

  const handlePointerDown = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation()
      if (e.pointerType !== 'touch') return

      // First tap reveals and does nothing else, so a thumb landing here by
      // accident never navigates away. The second opens the link.
      if (armed.current) {
        open()
        return
      }
      setArmed(true)
      setRevealed(true)
      if (hideTimer.current) clearTimeout(hideTimer.current)
      hideTimer.current = setTimeout(() => {
        setArmed(false)
        setRevealed(false)
      }, TOUCH_REVEAL_MS)
    },
    [open, setArmed]
  )

  const handleClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation()
      // Touch is handled on pointerdown; letting the synthesised click through
      // would open the link on the first tap.
      if (armed.current) return
      open()
    },
    [open]
  )

  return (
    <group
      position={[ROOM_WIDTH * 0.437, 0.62, -ROOM_DEPTH * 0.62]}
      rotation={[0, -Math.PI / 2, 0]}
      onPointerEnter={() => setRevealed(true)}
      onPointerLeave={() => {
        if (!armed.current) setRevealed(false)
      }}
      onPointerDown={handlePointerDown}
      onClick={handleClick}
    >
      {/* An invisible target far larger than the engraving. The plaque stays
          small enough to miss, but a thumb that lands near it still connects. */}
      <mesh visible={false} position={[0, 0, 0.01]}>
        <planeGeometry args={[1.9, 1.1]} />
      </mesh>

      <mesh>
        <planeGeometry args={[0.62, 0.16]} />
        <meshStandardMaterial
          color={revealed ? '#C9A84C' : '#E6DCC6'}
          roughness={revealed ? 0.3 : 0.75}
          metalness={revealed ? 0.6 : 0.15}
        />
      </mesh>
      <Text
        position={[0, 0.028, 0.002]}
        fontSize={0.038}
        color={revealed ? '#2A1E14' : '#9A8A6A'}
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.04}
        font="/fonts/PlayfairDisplay-Regular.ttf"
      >
        built by laluboom &amp; his claude
      </Text>
      <Text
        position={[0, -0.035, 0.002]}
        fontSize={0.028}
        color={revealed ? '#501511' : '#A89878'}
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.06}
      >
        stalklalu.com
      </Text>

      {/* The engraving is only a few pixels tall from across the room, which is
          what keeps it hidden. Once found, this renders at screen resolution so
          it can actually be read — bare text, no panel, sitting a shade off the
          wall behind it so it stays part of the room rather than a label on it. */}
      {revealed && (
        <Html center distanceFactor={6} position={[0, 0.34, 0.05]} style={{ pointerEvents: 'none' }}>
          <div
            style={{
              whiteSpace: 'nowrap',
              fontFamily: "'Libre Franklin', sans-serif",
              fontSize: 11,
              letterSpacing: '0.08em',
              color: '#8A7A60',
              textAlign: 'center',
              lineHeight: 1.6,
            }}
          >
            built by laluboom &amp; his claude
            <br />
            <span style={{ color: '#7E7058' }}>
              {armedNow ? 'tap again to visit stalklalu.com' : 'stalklalu.com'}
            </span>
          </div>
        </Html>
      )}
    </group>
  )
}
