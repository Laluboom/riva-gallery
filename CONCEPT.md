# The Riva Gallery — Concept & Architecture

---

## Concept

A personal website reimagined as an immersive digital art museum. Instead of arriving at a homepage with a navigation bar, visitors enter a three-dimensional gallery space and walk through it. Content is discovered the way you discover art in a museum — by exploring, pausing, and looking closely.

The central idea: every category of content (artwork, writing, travel, books, projects) is treated as a curated exhibit worthy of a physical gallery wall.

---

## Gallery Structure

The space is divided into five themed rooms connected along a single corridor. Visitors move through them in sequence or jump directly.

| Room | Theme | Content Type |
|------|-------|-------------|
| 1 — Featured Collection | Signature works | Artwork, hero introduction |
| 2 — The Journal Wing | Essays and reflections | Blog posts as framed text exhibits |
| 3 — Travel Gallery | Photography and memory | Travel stories as large-format photographs |
| 4 — The Library | Curated reading | Books as cover art in a grid |
| 5 — The Artist's Studio | Personal story | About, projects, contact |

---

## Visitor Experience

### Entry Flow

1. **Loading screen** — Animated brand intro, communicates tone before anything is seen.
2. **Entry portal** — Full-screen overlay listing the rooms and a single call to action.
3. **Gallery** — The 3D canvas renders silently in the background; on entry the visitor is standing at the mouth of the first room.

### Movement Controls

| Input | Action |
|-------|--------|
| Scroll wheel | Move between rooms |
| Touch swipe (vertical) | Move between rooms |
| W / S or ↑ / ↓ | Move between rooms |
| Click + drag | Rotate view left/right (clamped ±65°) |
| A / D or ← / → | Look left/right |
| Room name buttons | Jump to any room |
| Dot indicators | Jump to any room |

### Exhibit Interaction

- **Hover** — a museum-style plaque appears below the piece
- **Click** — a slide-in panel opens from the right showing full description, metadata, and extended text
- **Close** — ✕ button or Escape key

---

## 3D System

### Technology

Three.js (r128/r134 UMD bundle). In the Next.js build, consumed via React Three Fiber with `@react-three/drei`.

### Scene Layout

One `THREE.Group` per room, offset along the negative Z axis:

```
Room 0  →  z =   0
Room 1  →  z = -22
Room 2  →  z = -44
Room 3  →  z = -66
Room 4  →  z = -88
```

All geometry inside a room group is in local space. Each room is 16 units wide, 8 units tall, 22 units deep.

### Room Geometry

Rooms are assembled from `PlaneGeometry` (walls, floor, ceiling) and `BoxGeometry` (mouldings, baseboards, doorway arch). No 3D model files are loaded — everything is built procedurally at runtime.

| Surface | Geometry |
|---------|----------|
| Floor / Ceiling | `PlaneGeometry(16, 22)` |
| Back / Front walls | `PlaneGeometry(16, 8)` |
| Left / Right walls | `PlaneGeometry(22, 8)` |
| Crown moulding | `BoxGeometry` bars at ceiling height |
| Baseboard | `BoxGeometry` bars at floor level |
| Doorway arch | Two pillars + lintel `BoxGeometry` |

Wall colour varies per room via `MeshStandardMaterial.color`. Roughness ~0.88 to absorb light naturally.

### Artwork Frames

Each exhibit is a `THREE.Group` containing three elements:

1. **Frame** — four `BoxGeometry` bars (top, bottom, left, right). Material varies by content type:
   - Artwork → gold `#C9A84C`, metalness 0.68
   - Travel → off-white, low metalness (photograph mount)
   - Book → exhibit accent colour, low metalness
   - Journal/default → dark `#3A3028`, minimal

2. **Canvas plane** — `PlaneGeometry` carrying a procedurally generated `CanvasTexture`, slightly proud of the wall.

3. **Museum plaque** — second `PlaneGeometry` below the frame with title and subtitle on a parchment ground.

Frame position is driven by a per-room layout table (wall: `back` / `left` / `right`, plus Z or X offset). Adding a new exhibit only requires a data entry and a layout entry — no geometry code changes.

### Procedural Textures

No external images. Every artwork is generated at runtime via the browser's 2D Canvas API and uploaded to the GPU as a `THREE.CanvasTexture`. Each content category has its own drawing routine:

| Category | Technique |
|----------|-----------|
| Artwork | Random radial gradient blobs + bezier curve strokes in accent colour |
| Journal | Horizontal ruled lines + vertical margin line |
| Travel | Radial vignette, sine-wave horizon lines, sun/moon circle |
| Book | Double inset border, stacked title words, author name below rule |
| About / Project | Concentric circles + monogram in large serif type |

The gradient base (`gradientFrom` → `gradientTo`) is drawn first; all marks sit on top at low `globalAlpha` so the gradient bleeds through. Textures are created once and cached — never re-generated during the session.

### Camera System

`PerspectiveCamera`, `fov = 65`, eye height `y = 1.7`. Per-room target positions:

```
Room 0  →  z =  -8
Room 1  →  z = -30
Room 2  →  z = -52
Room 3  →  z = -74
Room 4  →  z = -96
```

Each frame: `camera.position.lerp(target, 0.065)` for smooth movement. Look direction computed from look angle via `Math.sin`/`Math.cos`, also lerped (factor 0.09) for responsive feel.

### Lighting

| Light | Details |
|-------|---------|
| Ambient | `#FFF5E0`, intensity 0.38 — lifts shadows |
| Hemisphere | Sky warm white / ground amber, 0.14 — tinted fill |
| Ceiling spots ×3 per room | `SpotLight` downlights, one per column |
| Wall fills ×2 per room | `SpotLight('#FFD070')` — raking warm light across artwork walls |

Tone mapping: `ACESFilmicToneMapping`, exposure 1.15. Scene fog (`16–72` units) fades distant rooms to parchment, providing depth and hiding room boundaries.

### Raycasting

`THREE.Raycaster.intersectObjects(hoverables)` runs every frame. Only the artwork canvas planes (not frame bars or plaques) are in the `hoverables` array. Hits drive hover plaque visibility and click-to-open panel behaviour.

---

## Performance

- Pixel ratio capped at `min(devicePixelRatio, 2)`
- Shadow maps on ceiling spots only; wall fills cast no shadows
- Texture resolution scales with frame size, not fixed large
- Three.js canvas loaded via `dynamic({ ssr: false })` — zero server-side overhead
- Fog reduces fragment work for out-of-view rooms

---

## Content Data Shape

```typescript
interface Exhibit {
  title: string
  subtitle?: string
  category: 'artwork' | 'journal' | 'travel' | 'book' | 'project' | 'about'
  year?: string
  description: string
  longDescription?: string
  gradientFrom: string    // texture background start
  gradientTo: string      // texture background end
  accentColor: string     // marks, frame colour, plaque accents
  medium?: string
  tags?: string[]
  metadata?: Record<string, string>
  size?: 'small' | 'medium' | 'large' | 'wide'
  frameStyle?: 'ornate' | 'minimal' | 'photograph' | 'book' | 'installation'
}
```

---

## Visual Identity

| Token | Value | Usage |
|-------|-------|-------|
| Museum gold | `#C9A84C` | Active states, ornate frames, monogram |
| Deep warm black | `#1A1410` | Scene background |
| Wall near-whites | `#F8F6F1` – `#F0ECE4` | Per-room wall surfaces |
| Parchment | `#F4EFE6` | Panel and plaque surfaces |
| Display face | Playfair Display | Titles, room names, monogram |
| Body face | Inter | Labels, descriptions, metadata |

---

## Stack

Next.js 14 · TypeScript · React Three Fiber · Three.js · Framer Motion · Tailwind CSS · Zustand
