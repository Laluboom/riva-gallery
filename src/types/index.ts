export type ExhibitCategory = 'artwork' | 'journal' | 'travel' | 'book' | 'project' | 'about'

/** An entry in a panel that lists other things — a series, an archive, an index, a quote wall. */
export interface CollectionItem {
  title: string
  subtitle?: string
  href?: string
  meta?: string
  thumbUrl?: string
}

export interface ExhibitCollection {
  kind: 'series' | 'archive' | 'index' | 'quotes'
  items: CollectionItem[]
}

export interface Exhibit {
  id: string
  title: string
  subtitle?: string
  year?: string
  category: ExhibitCategory
  medium?: string
  description: string
  longDescription?: string
  tags?: string[]
  /** Optimised webp for the frame texture. When absent the frame draws a procedural texture. */
  imageUrl?: string
  /** Full-size version of imageUrl, for the 2D panel where screen space is real. */
  fullUrl?: string
  thumbUrl?: string
  /** width / height of imageUrl, so the frame can match the artwork instead of cropping it. */
  aspect?: number
  gradientFrom?: string
  gradientTo?: string
  accentColor?: string
  link?: string
  metadata?: Record<string, string>
  /** When set, the exhibit opens a list panel rather than a single description. */
  collection?: ExhibitCollection
  frameStyle?: 'ornate' | 'minimal' | 'photograph' | 'book' | 'installation'
  size?: 'small' | 'medium' | 'large' | 'wide'
}

export interface GalleryRoom {
  id: string
  name: string
  subtitle: string
  exhibits: Exhibit[]
  wallColor?: string
  accentColor?: string
  ambientLight?: number
}

export interface GalleryState {
  currentRoom: number
  activeExhibit: Exhibit | null
  isLoading: boolean
  cameraProgress: number
  isDragging: boolean
  lookAngle: number
}
