'use client'
import { Suspense, useMemo } from 'react'
import { GalleryRoom } from './GalleryRoom'
import { ArtworkFrame } from './ArtworkFrame'
import { GalleryLighting } from './GalleryLighting'
import { CameraRig } from './CameraRig'
import { RoomLabel } from './RoomLabel'
import { GALLERY_ROOMS, ROOM_POSITIONS, ROOM_WIDTH, ROOM_HEIGHT, ROOM_DEPTH } from '@/data/content'
import { useGalleryStore } from '@/lib/store'

type Placement = {
  pos: [number, number, number]
  rot: [number, number, number]
  idx: number
}

/**
 * Wall placement helpers. Positions are local to a room group, so every room
 * uses the same coordinates and the group's own -Z offset does the rest.
 */
const back = (idx: number, yFrac = 0.55): Placement => ({
  pos: [0, ROOM_HEIGHT * yFrac, -ROOM_DEPTH + 0.12],
  rot: [0, 0, 0],
  idx,
})

/** side: -1 left wall, +1 right wall. zFrac measured back from the doorway. */
const side = (idx: number, dir: -1 | 1, zFrac: number, yFrac = 0.52): Placement => ({
  pos: [ROOM_WIDTH * 0.44 * dir, ROOM_HEIGHT * yFrac, -ROOM_DEPTH * zFrac],
  rot: [0, (dir === -1 ? 1 : -1) * (Math.PI / 2), 0],
  idx,
})

/** A position on the back wall, offset from centre. xFrac: -0.5..0.5 of the width. */
const backAt = (idx: number, xFrac: number, yFrac: number): Placement => ({
  pos: [ROOM_WIDTH * xFrac, ROOM_HEIGHT * yFrac, -ROOM_DEPTH + 0.12],
  rot: [0, 0, 0],
  idx,
})

/**
 * Sixteen books. Ten hang on the back wall as a grid, because at a 65° field of
 * view from the middle of the room the side walls fall outside the view cone and
 * a book wall that reads as empty defeats the point. The remaining six sit on
 * the side walls, found by looking left and right.
 */
const shelf = (): Placement[] => {
  const out: Placement[] = []
  let idx = 0
  for (const yFrac of [0.68, 0.44]) {
    for (const xFrac of [-0.32, -0.16, 0, 0.16, 0.32]) {
      out.push(backAt(idx++, xFrac, yFrac))
    }
  }
  for (const dir of [-1, 1] as const) {
    for (const zFrac of [0.88, 0.72, 0.56]) {
      out.push(side(idx++, dir, zFrac, 0.55))
    }
  }
  return out
}

const EXHIBIT_LAYOUTS: Placement[][] = [
  // Room 0 — the featured collection: hero on the back wall, customs flanking.
  [back(0), side(1, -1, 0.82), side(2, -1, 0.55), side(3, 1, 0.82), side(4, 1, 0.55)],

  // Room 1 — the journal wing: soc series on the back wall, five essays along
  // the sides, the full archive by the doorway on the way out.
  [
    back(0),
    side(1, -1, 0.85),
    side(2, -1, 0.65),
    side(3, -1, 0.45),
    side(4, 1, 0.85),
    side(5, 1, 0.65),
    side(6, 1, 0.45),
  ],

  // Room 2 — the library: sixteen books, two rows deep on both walls.
  shelf(),

  // Room 3 — the artist's studio.
  [back(0), side(1, -1, 0.78), side(2, 1, 0.78), side(3, -1, 0.5)],
]

export function GalleryScene() {
  const currentRoom = useGalleryStore((s) => s.currentRoom)

  return (
    <>
      <CameraRig />
      <GalleryLighting currentRoom={currentRoom} />
      <fog attach="fog" args={['#FFF8EE', 20, 80]} />

      {GALLERY_ROOMS.map((room, roomIdx) => {
        const z = ROOM_POSITIONS[roomIdx]
        const layouts = EXHIBIT_LAYOUTS[roomIdx] || []

        // Only the current room and its neighbours hold decoded textures; the
        // rest are unmounted so three.js can release them.
        if (Math.abs(roomIdx - currentRoom) > 1) {
          return (
            <group key={room.id} position={[0, 0, z]}>
              <GalleryRoom position={[0, 0, 0]} wallColor={room.wallColor} isActive={false} />
            </group>
          )
        }

        return (
          <group key={room.id} position={[0, 0, z]}>
            <GalleryRoom
              position={[0, 0, 0]}
              wallColor={room.wallColor}
              isActive={currentRoom === roomIdx}
            />
            <RoomLabel
              name={room.name}
              subtitle={room.subtitle}
              position={[0, 0, 0]}
            />
            {layouts.map((layout) => {
              const exhibit = room.exhibits[layout.idx]
              if (!exhibit) return null
              return (
                <ArtworkFrame
                  key={exhibit.id}
                  exhibit={exhibit}
                  position={layout.pos}
                  rotation={layout.rot}
                  isActive={currentRoom === roomIdx}
                />
              )
            })}
          </group>
        )
      })}
    </>
  )
}
