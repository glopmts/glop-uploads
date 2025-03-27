import ItemViewer from "@renderer/components/ItemViewer/ItemViewer"
import type { CardItem } from "@renderer/types/interfaces"
import axios from "axios"
import { type FC, useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import "./itens.scss"
import { renderItemPreview } from "./renderItems"

const FolderId: FC = () => {
  const [searchParams] = useSearchParams()
  const id = searchParams.get("id")
  const [itens, setItens] = useState<CardItem[]>([])
  const [selectedItem, setSelectedItem] = useState<CardItem | null>(null)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; item: CardItem | null } | null>(null)

  useEffect(() => {
    const fecthData = async () => {
      try {
        const res = await axios
      } catch (error) {
        console.log(error)
      }
    }
    fecthData();
  }, [id])

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

  return (
    <section className="itens-id__container" onClick={closeContextMenu}>
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

