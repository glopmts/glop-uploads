import ItemViewer from "@renderer/components/ItemViewer/ItemViewer"
import type { CardItem } from "@renderer/types/interfaces"
import { type FC, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import "./itens.scss"
import { renderItemPreview } from "./renderItems"

const FolderId: FC = () => {
  const [searchParams] = useSearchParams()
  const id = searchParams.get("id")
  const name = searchParams.get("name") || "Pasta"
  const [itens, setItens] = useState<CardItem[]>([])
  const [selectedItem, setSelectedItem] = useState<CardItem | null>(null)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; item: CardItem | null } | null>(null)

  const handleItemClick = (item: CardItem) => {
    setSelectedItem(item)
  }

  const closeViewer = () => {
    setSelectedItem(null)
  }

  const handleContextMenu = (e: React.MouseEvent, item: CardItem) => {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY, item })
  }

  const closeContextMenu = () => {
    setContextMenu(null)
  }

  const pathSegments = name.split("/").filter(Boolean)

  return (
    <section className="itens-id__container" onClick={closeContextMenu}>
      <nav className="itens-id__breadcrumb">
        <Link to="/">Home</Link>
        {pathSegments.map((segment, index) => {
          const path = `/${pathSegments.slice(0, index + 1).join("/")}`
          return (
            <span key={index}>
              <span className="itens-id__breadcrumb-separator">{">"}</span>
              <Link to={path}>{segment}</Link>
            </span>
          )
        })}
      </nav>

      <div className="itens-id__infor-details">
        <ul className="itens-id__ul">
          {itens.map((item) => (
            <li
              key={item.id}
              className="itens-id__card"
              onClick={() => handleItemClick(item)}
              onContextMenu={(e) => handleContextMenu(e, item)}
            >
              {renderItemPreview(item)}
            </li>
          ))}
        </ul>
        {itens.length === 0 && (
          <div className="itens-id__not-found">
            <span className="itens-id__text-not">Nenhum item encontrado!</span>
          </div>
        )}
      </div>

      {selectedItem && <ItemViewer item={selectedItem} onClose={closeViewer} />}

      {contextMenu && (
        <div
          className="context-menu"
          style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
        >
          <button onClick={closeViewer}>Abrir</button>
          <button onClick={() => console.log("Deletar:", contextMenu.item)}>Deletar</button>
        </div>
      )}
    </section>
  )
}

export default FolderId
