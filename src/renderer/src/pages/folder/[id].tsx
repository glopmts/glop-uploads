// FolderId.tsx
import { CardItem, Folder } from "@renderer/types/interfaces"
import { type FC, useEffect, useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import "./itens.scss"
import { renderItemPreview } from "./renderItems"

const FolderId: FC = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const id = searchParams.get("id")
  const name = searchParams.get("name") || "Pasta"
  const [currentFolder, setCurrentFolder] = useState<Folder | null>(null)
  const [selectedItem, setSelectedItem] = useState<CardItem | null>(null)

  // Simulação de busca dos dados da pasta
  useEffect(() => {
    // Aqui você faria uma chamada API ou buscaria do estado global
    // Estou simulando com um timeout
    const timer = setTimeout(() => {
      const mockFolders: Folder[] = [
        {
          id: "pasta1",
          title: "Images",
          color: "#dc2626",
          type: "folder",
          isFolder: true,
          path: "",
          size: "20mb",
          createdAt: new Date(),
          updatedAt: new Date(),
          items: [
            {
              id: "subpasta1",
              title: "Vacation",
              type: "folder",
              color: "#f59e0b",
              isFolder: true,
              path: "",
              size: "10mb",
              createdAt: new Date(),
              updatedAt: new Date(),
              items: [
                {
                  id: "img1",
                  title: "Beach.jpg",
                  type: "image",
                  path: "",
                  size: "2mb",
                  createdAt: new Date(),
                  updatedAt: new Date(),
                },
              ]
            },
            {
              id: "img1",
              title: "Beach.jpg",
              type: "image",
              path: "",
              size: "2mb",
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
        },
      ]

      const folder = mockFolders.find(f => f.id === id) || null
      setCurrentFolder(folder)
    }, 300)

    return () => clearTimeout(timer)
  }, [id])

  const handleItemClick = (item: CardItem) => {
    if (item.type === "folder") {
      navigate(`/folder?id=${item.id}&name=${encodeURIComponent(`${name}/${item.title}`)}`)
    } else {
      setSelectedItem(item)
    }
  }

  const pathSegments = name.split("/").filter(Boolean)

  return (
    <section className="itens-id__container">
      <nav className="itens-id__breadcrumb">
        <Link to="/">Home</Link>
        {pathSegments.map((segment, index) => {
          const path = `/folder?id=${id}&name=${pathSegments.slice(0, index + 1).join("/")}`
          return (
            <span key={index}>
              <span className="itens-id__breadcrumb-separator">{">"}</span>
              <Link to={path}>{segment}</Link>
            </span>
          )
        })}
      </nav>

      <div className="itens-id__infor-details">
        {currentFolder ? (
          <ul className="itens-id__ul">
            {currentFolder.items.map((item) => (
              <li
                key={item.id}
                className="itens-id__card"
                onClick={() => handleItemClick(item)}
              >
                {renderItemPreview(item)}
              </li>
            ))}
          </ul>
        ) : (
          <div className="itens-id__not-found">
            <span className="itens-id__text-not">Carregando pasta...</span>
          </div>
        )}

        {currentFolder?.items.length === 0 && (
          <div className="itens-id__not-found">
            <span className="itens-id__text-not">Pasta vazia</span>
          </div>
        )}
      </div>
    </section>
  )
}

export default FolderId