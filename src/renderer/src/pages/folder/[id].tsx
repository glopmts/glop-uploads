import ItemViewer from "@renderer/components/folders/ItemViewer/ItemViewer"
import { useAuth } from "@renderer/hooks/useAuth"
import { itemUploadsUser } from "@renderer/services/items-uploads"
import type { CardItem, Folder } from "@renderer/types/interfaces"
import { type FC, useEffect, useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import "./itens.scss"
import { renderItemPreview } from "./render-items"

const FolderId: FC = () => {
  const { userId } = useAuth();
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const id = searchParams.get("id")
  const name = searchParams.get("name") || "Pasta"
  const type = searchParams.get("type")
  const [folders, setFolders] = useState<Folder[]>([])
  const [items, setItems] = useState<CardItem[]>([])
  const [selectedItem, setSelectedItem] = useState<CardItem | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      if (!userId || !type) {
        setIsLoading(false)
        return
      }
      try {
        setIsLoading(true)
        const res = await itemUploadsUser.getUploadsFolder(userId, type, id!)
        setFolders(res.folders || [])
        setItems(res.items || [])
      } catch (error) {
        console.error("Erro ao buscar a pasta:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [userId, type, id])

  const handleItemClick = (item: CardItem) => {
    if (item.type === "folder") {
      navigate(`/folder?id=${item.id}&name=${encodeURIComponent(`${name}/${item.title}`)}&type=${item.type}`)
    } else {
      setSelectedItem(item)
    }
  }

  const closeViewer = () => {
    setSelectedItem(null)
  }

  const pathSegments = name.split("/").filter(Boolean)

  return (
    <section className="itens-id__container">
      <nav className="itens-id__breadcrumb" aria-label="Navegação">
        <Link to="/">Home</Link>
        {pathSegments.map((segment, index) => {
          const path = `/folder?id=${id}&name=${encodeURIComponent(pathSegments.slice(0, index + 1).join("/"))}&type=${type}`
          return (
            <span key={index}>
              <span className="itens-id__breadcrumb-separator">{">"}</span>
              <Link to={path}>{segment}</Link>
            </span>
          )
        })}
      </nav>

      <div className="itens-id__infor-details">
        {isLoading ? (
          <div className="itens-id__loading">
            <span>Carregando...</span>
          </div>
        ) : (
          <>
            {folders.length > 0 && (
              <>
                <h2>Pastas</h2>
                <ul className="itens-id__ul">
                  {folders.map((folder) => (
                    <li
                      key={folder.id}
                      className="itens-id__card"
                      onClick={() => navigate(`/folder?id=${folder.id}&name=${encodeURIComponent(folder.title)}&type=${folder.type}`)}
                      tabIndex={0}
                      role="button"
                      aria-label={`Pasta ${folder.title}`}
                      onKeyDown={(e) => e.key === 'Enter' && navigate(`/folder?id=${folder.id}&name=${encodeURIComponent(folder.title)}&type=${folder.type}`)}
                    >
                      <div className="item-preview-container folder">
                        <div className="folder-preview">📁</div>
                        <div className="item-title">{folder.title}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            )}

            {items.length > 0 ? (
              <>
                <h2>Itens</h2>
                <ul className="itens-id__ul">
                  {items.map((item) => (
                    <li
                      key={item.id}
                      className="itens-id__card"
                      onClick={() => handleItemClick(item)}
                      tabIndex={0}
                      role="button"
                      aria-label={`Item ${item.title}`}
                      onKeyDown={(e) => e.key === 'Enter' && handleItemClick(item)}
                    >
                      {renderItemPreview(item)}
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <div className="itens-id__not-found">
                <span className="itens-id__text-not">Nenhum item encontrado</span>
              </div>
            )}
          </>
        )}
      </div>

      {selectedItem && (
        <ItemViewer item={selectedItem} onClose={closeViewer} />
      )}
    </section>
  )
}

export default FolderId
