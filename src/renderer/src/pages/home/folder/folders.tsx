import MenuFolder from "@renderer/components/menu-folrders/menu-folders"
import type { Folder } from "@renderer/types/interfaces"
import { useState, type FC } from "react"
import FolderItem from "./FolderItem"
import "./folders.scss"

const pastas: Folder[] = [
  {
    id: "pasta1",
    title: "Images",
    color: "#dc2626",
    createdAt: new Date(),
    updatedAt: new Date(),
    items: [
      {
        id: "pages",
        title: "Exemples",
        type: "image",
        path: "",
        size: "20mb",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
    type: "image",
  },
  {
    id: "pasta2",
    title: "Documents",
    color: "#2563eb",
    createdAt: new Date(),
    updatedAt: new Date(),
    items: [
      {
        id: "doc1",
        title: "Report",
        type: "document",
        path: "",
        size: "5mb",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
    type: "document",
  },
  {
    id: "pasta3",
    title: "Videos",
    color: "#16a34a",
    createdAt: new Date(),
    updatedAt: new Date(),
    items: [
      {
        id: "vid1",
        title: "Tutorial",
        type: "video",
        path: "",
        size: "150mb",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
    type: "video",
  },
  {
    id: "pasta4",
    title: "Audio",
    color: "#9333ea",
    createdAt: new Date(),
    updatedAt: new Date(),
    items: [
      {
        id: "aud1",
        title: "Podcast",
        type: "audio",
        path: "",
        size: "45mb",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
    type: "audio",
  },

  {
    id: "pasta5",
    title: "Audio",
    color: "",
    createdAt: new Date(),
    updatedAt: new Date(),
    items: [
      {
        id: "aud1",
        title: "Podcast",
        type: "audio",
        path: "",
        size: "45mb",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
    type: "audio",
  },
]

const UserFolders: FC = () => {
  const [sectionContextMenu, setSectionContextMenu] = useState<{ x: number; y: number } | null>(null)

  const handleSectionContextMenu = (e: React.MouseEvent) => {
    if (
      (e.target as HTMLElement).className === "folders__container-items" ||
      (e.target as HTMLElement).className === "folders__container"
    ) {
      e.preventDefault()
      setSectionContextMenu({ x: e.clientX, y: e.clientY })
    }
  }

  const closeSectionContextMenu = () => {
    setSectionContextMenu(null)
  }

  const sectionMenuOptions = [
    {
      label: "New Folder",
      icon: "folder-open",
      onClick: () => console.log("Creating new folder"),
    },
    {
      label: "Sort by Name",
      icon: "info",
      onClick: () => console.log("Sorting folders by name"),
    },
    {
      label: "Sort by Date",
      icon: "info",
      onClick: () => console.log("Sorting folders by date"),
    },
    {
      divider: true,
      label: "",
      onClick: () => { },
    },
    {
      label: "Refresh",
      icon: "info",
      onClick: () => console.log("Refreshing folder list"),
    },
  ]

  return (
    <section className="folders__container" onContextMenu={handleSectionContextMenu}>
      <h3 className="folders__h3">Pastas</h3>
      <div className="folders__container-items">
        {pastas.map((folder) => (
          <FolderItem key={folder.id} folder={folder} />
        ))}
      </div>
      {sectionContextMenu && (
        <MenuFolder position={sectionContextMenu} onClose={closeSectionContextMenu} options={sectionMenuOptions} />
      )}
    </section>
  )
}

export default UserFolders

