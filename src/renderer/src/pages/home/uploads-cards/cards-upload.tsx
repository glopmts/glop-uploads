import type React from "react"

import ItemViewer from "@renderer/components/folders/ItemViewer/ItemViewer"
import MenuItems from "@renderer/components/items/modal-items/menu-items"
import { LoadingSpinner } from "@renderer/components/loading-spinner/loading-spinner"
import { useAuth } from "@renderer/hooks/useAuth"
import { useToastNotification } from "@renderer/hooks/useToastNotification"
import { renderItemPreview } from "@renderer/pages/folder/render-items"
import { itemUploadsUser } from "@renderer/services/items-uploads"
import UserItemsQuery from "@renderer/services/queryUploads"
import type { CardItem } from "@renderer/types/interfaces"
import { motion } from "framer-motion"
import { useState, type FC } from "react"
import { RefreshCcw } from "react-feather"
import "./cards-upload.scss"

const CardsUpload: FC = () => {
  const { userId } = useAuth()
  const toast = useToastNotification()
  const { data: items = [], isLoading, refetch, error } = UserItemsQuery(userId!)

  const [selectedItem, setSelectedItem] = useState<CardItem | null>(null)
  const [isRefetch, setRefecth] = useState(false)
  const [sectionContextMenu, setSectionContextMenu] = useState<{ x: number; y: number } | null>(null)
  const [contextMenuFolderId, setContextMenuFolderId] = useState<string | null>(null)

  const handleFolderContextMenu = (e: React.MouseEvent, folderId: string) => {
    e.preventDefault()
    e.stopPropagation()
    setContextMenuFolderId(folderId)
    setSectionContextMenu({ x: e.clientX, y: e.clientY })
  }

  const closeSectionContextMenu = () => {
    setSectionContextMenu(null)
  }

  const handleSectionContextMenu = (e: React.MouseEvent) => {
    if (
      (e.target as HTMLElement).className === "folders__container-items" ||
      (e.target as HTMLElement).className === "folders__container"
    ) {
      e.preventDefault()
      setContextMenuFolderId(null)
      setSectionContextMenu({ x: e.clientX, y: e.clientY })
    }
  }

  const closeViewer = () => {
    setSelectedItem(null)
  }

  const handleItemClick = (item: CardItem) => {
    setSelectedItem(item)
  }

  const handleRefetch = async () => {
    setRefecth(true)
    await refetch()
    setRefecth(false)
    setTimeout(() => setRefecth(false), 500)
  }

  const handleDelete = async (id: string) => {
    try {
      await itemUploadsUser.deleteItem(id)
      await refetch()
      toast.success("Deletado!", "Item deletado com sucesso")
    } catch (error) {
      toast.error("Erro", "Não foi possível deletar o item")
      console.log(error)
    }
  }

  if (error) {
    return (
      <div className="erro">
        <span className="erro__message">{error.message}</span>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="loading-cards">
        <LoadingSpinner size="small" color="#6200ee" thickness={6} speed="fast" text="Processing..." />
      </div>
    )
  }

  return (
    <div className="files__container" onContextMenu={handleSectionContextMenu}>
      <div className="files__title">
        <h3>Arquivos Salvos</h3>
        <div className="files__options">
          <button
            onClick={handleRefetch}
            className={`files__button-refetch ${isRefetch ? "files__button-refetch--spinning" : ""}`}
          >
            <motion.div
              animate={{ rotate: isRefetch ? 360 : 0 }}
              transition={{ duration: 0.6, ease: "easeInOut", repeat: isRefetch ? Number.POSITIVE_INFINITY : 0 }}
              className="files__refetch-icons"
            >
              <RefreshCcw size={17} />
            </motion.div>
          </button>
        </div>
      </div>
      <div className="files__cards">
        {items.length > 0 ? (
          <ul className="itens-id__ul">
            {items.map((item) => (
              <li
                key={item.id}
                className="itens-id__card"
                tabIndex={0}
                role="button"
                onContextMenu={(e) => handleFolderContextMenu(e, item.id)}
                onClick={() => handleItemClick(item)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    handleItemClick(item)
                  }
                }}
                aria-label={`Item ${item.title}`}
              >
                {renderItemPreview(item)}
              </li>
            ))}
          </ul>
        ) : (
          <div className="itens-id__not-found">
            <span className="itens-id__text-not">Nenhum item encontrado</span>
          </div>
        )}
      </div>
      {selectedItem && <ItemViewer item={selectedItem} onClose={closeViewer} />}
      {sectionContextMenu && (
        <MenuItems
          position={sectionContextMenu}
          onClose={closeSectionContextMenu}
          folderId={contextMenuFolderId!}
          handleDelete={handleDelete}
        />
      )}
    </div>
  )
}

export default CardsUpload

