'use client'
import { Text } from '@react-three/drei'
import { ROOM_DEPTH, ROOM_HEIGHT } from '@/data/content'

interface RoomLabelProps {
  name: string
  subtitle: string
  position: [number, number, number]
}

export function RoomLabel({ name, subtitle, position }: RoomLabelProps) {
  return (
    <group position={position}>
      {/* On the back wall, above the focal piece. It used to sit at z = -0.05,
          which is the doorway end of the room — behind the viewer, so it never
          appeared. Sized for the ~15-unit viewing distance. */}
      <Text
        position={[0, ROOM_HEIGHT * 0.9, -ROOM_DEPTH + 0.1]}
        fontSize={0.52}
        color="#2A1E14"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.12}
        font="/fonts/PlayfairDisplay-Regular.ttf"
      >
        {name}
      </Text>
      <Text
        position={[0, ROOM_HEIGHT * 0.79, -ROOM_DEPTH + 0.1]}
        fontSize={0.24}
        color="#5A4A38"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.08}
      >
        {subtitle}
      </Text>
      {/* Decorative line */}
      {/* Between the name and the subtitle, so it clears the Library's top
          row of books at 0.68 of the wall height. */}
      <mesh position={[0, ROOM_HEIGHT * 0.85, -ROOM_DEPTH + 0.1]}>
        <planeGeometry args={[3.2, 0.02]} />
        <meshStandardMaterial color="#501511" />
      </mesh>
    </group>
  )
}
