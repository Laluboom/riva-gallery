'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ThreeEvent } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import { ROOM_DEPTH, ROOM_WIDTH } from '@/data/content'

const CREDIT_URL = 'https://stalklalu.com'

/**
 * At rest the engraving is the wall colour (#FFF8EE) taken a few percent down,
 * with no plate behind it: close enough to read as a shadow in the plaster,
 * far enough that a careful look picks it out.
 */
const RESTING_INK = '#F3E9D9'

/**
 * What the engraving darkens to once found. Deep enough to read against the
 * plaster, short of black: a plaque is cut into a wall, not printed on it, and
 * full black would read as a label stuck on top.
 */
const FOUND_INK = '#6E5F49'

/** Matches GalleryRoom's wall material, so the text shades with the wall. */
const WALL_ROUGHNESS = 0.85

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
  // Touch has no hover, so the first tap stands in for it. A ref is enough:
  // nothing rendered depends on it, only the handlers read it.
  const armed = useRef(false)
  const setArmed = useCallback((v: boolean) => {
    armed.current = v
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
      position={[ROOM_WIDTH / 2, 0.62, -ROOM_DEPTH * 0.62]}
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

      <Text
        position={[0, 0.028, 0.002]}
        fontSize={0.038}
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.04}
        font="/fonts/PlayfairDisplay-Regular.ttf"
      >
        built by laluboom &amp; his claude
        {/* Lit like the wall it sits on, so the engraving keeps the same
            offset from the plaster under every light in the room — faint at
            rest, and still part of the wall once it darkens. */}
        <meshStandardMaterial
          color={revealed ? FOUND_INK : RESTING_INK}
          roughness={WALL_ROUGHNESS}
          metalness={0}
        />
      </Text>
      <Text
        position={[0, -0.035, 0.002]}
        fontSize={0.028}
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.06}
      >
        stalklalu.com
        <meshStandardMaterial
          color={revealed ? FOUND_INK : RESTING_INK}
          roughness={WALL_ROUGHNESS}
          metalness={0}
        />
      </Text>

    </group>
  )
}
