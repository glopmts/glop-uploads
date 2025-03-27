import MenuFolder from "@renderer/components/menu-folrders/menu-folders"
import type { Folder } from "@renderer/types/interfaces"
import { useState, type FC } from "react"
import { File, FileText, Image, Music, Video } from "react-feather"
import { useNavigate } from "react-router-dom"

interface FolderItemProps {
  folder: Folder
}

const FolderItem: FC<FolderItemProps> = ({ folder }) => {
  const navigate = useNavigate();
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null)

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY })
  }

  const closeContextMenu = () => {
    setContextMenu(null)
  }

  const renderIcon = () => {
    switch (folder.type) {
      case "image":
        return <Image size={18} />
      case "document":
        return <FileText size={18} />
      case "video":
        return <Video size={18} />
      case "audio":
        return <Music size={18} />
      default:
        return <File size={18} />
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date)
  }

  const handleNavigate = (id: string) => {
    navigate({ pathname: "/items", search: `?id=${id}` });
  }

  return (
    <>
      <div className="folder-item" onContextMenu={handleContextMenu} onClick={() => handleNavigate(folder.id)}>
        <div className="folder-item__container" style={{ backgroundColor: folder.color || '#27272a' }}>
          <div className="folder-item__tab"></div>
          <div className="folder-item__content">
            <span className="folder-item__title">{folder.title}</span>
            <span className="folder-item__info">
              {folder.items.length} {folder.items.length === 1 ? "item" : "itens"} • {formatDate(folder.updatedAt)}
            </span>
          </div>
          <div className="folder-item__icon">{renderIcon()}</div>
        </div>
      </div>

      {contextMenu && (
        <MenuFolder position={contextMenu} onClose={closeContextMenu} folderId={folder.id} folderTitle={folder.title} />
      )}
    </>
  )
}

export default FolderItem

