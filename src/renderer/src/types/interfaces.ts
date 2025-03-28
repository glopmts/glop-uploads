export type ItemType = "image" | "file" | "video" | "audio" | "document" | "folder"

export interface CardItem {
  id: string
  title: string
  type: ItemType
  path?: string
  thumbnail?: string
  size?: string
  createdAt: Date
  updatedAt: Date
}

export interface Folder extends CardItem {
  id: string
  title: string
  type: ItemType
  color?: string
  items: (CardItem | Folder)[]
  createdAt: Date
  updatedAt: Date
  isFolder?: boolean 
}
