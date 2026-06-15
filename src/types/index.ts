// ========== 梦想之书 ==========
export interface DreamBook {
  id: string
  title: string
  coverImage?: string
  style: StyleTemplate
  pageFlipMode: PageFlipMode
  isPublic: boolean
  createdAt: string
  updatedAt: string
}

export type StyleTemplate = 'vintage' | 'starry' | 'light' | 'dark'
export type PageFlipMode = '3d' | 'swipe'

// ========== 书页与元素 ==========
export interface Page {
  id: string
  bookId: string
  pageNumber: number
  content: PageContent
  createdAt: string
  updatedAt: string
}

export interface PageContent {
  elements: PageElement[]
}

export type PageElementType = 'text' | 'image' | 'doodle'

export interface PageElement {
  id: string
  type: PageElementType
  x: number
  y: number
  width: number
  height: number
  data: TextElementData | ImageElementData | DoodleElementData
}

export interface TextElementData {
  content: string
  font: string
  size: number
  color: string
}

export interface ImageElementData {
  src: string
  filter?: ImageFilter
}

export interface ImageFilter {
  brightness: number   // 默认 100
  contrast: number     // 默认 100
  saturation: number   // 默认 100
}

export interface DoodleElementData {
  svgPath: string
  strokeColor: string
  strokeWidth: number
}

// ========== 互动 ==========
export interface Interaction {
  id: string
  bookId: string
  nickname: string
  type: 'like' | 'comment'
  content?: string
  createdAt: string
}

// ========== 编辑器快照（撤销/重做） ==========
export interface EditorSnapshot {
  elements: PageElement[]
}
