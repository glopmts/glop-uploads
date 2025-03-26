export type ItemType = "image" | "file" | "video" | "audio" | "document"

export interface CardItem {
  id: string
  title: string
  type: ItemType
  path: string
  thumbnail?: string
  size?: string
  createdAt: Date
  updatedAt: Date
}

export interface Folder {
  id: string
  title: string
  type: ItemType
  items: CardItem[]
  createdAt: Date
  updatedAt: Date
}
