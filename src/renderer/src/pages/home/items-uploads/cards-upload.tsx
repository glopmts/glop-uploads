import type React from "react"

import ItemViewer from "@renderer/components/folders/ItemViewer/ItemViewer"
import { Select, type SelectOption } from "@renderer/components/ui/select/select"
import { useDownloadStore } from "@renderer/hooks/download-store"
import { useAuth } from "@renderer/hooks/useAuth"
import { useToastNotification } from "@renderer/hooks/useToastNotification"
import { renderItemPreview } from "@renderer/pages/folder/render-items"
import { itemUploadsUser } from "@renderer/services/items-uploads"
import UserItemsQuery from "@renderer/services/queryUploads"
import type { CardItem, ItemType } from "@renderer/types/interfaces"
import { motion } from "framer-motion"
import { useState, type FC } from "react"
import { Download, RefreshCcw } from "react-feather"
import MenuItems from "../../../components/folders/items/modal-items/menu-items"
import { LoadingSpinner } from "../../../components/ui/loading-spinner/loading-spinner"
import "./cards-upload.scss"

const CardsUpload: FC = () => {
  const { userId } = useAuth()
  const toast = useToastNotification()
  const { data: items = [], isLoading, refetch, error } = UserItemsQuery(userId!)
  const { getDownloadsForItem } = useDownloadStore()

  const [selectedItem, setSelectedItem] = useState<CardItem | null>(null)
  const [isRefetch, setRefecth] = useState(false)
  const [sectionContextMenu, setSectionContextMenu] = useState<{ x: number; y: number } | null>(null)
  const [contextMenuFolderId, setContextMenuFolderId] = useState<string | null>(null)
  const [selectType, setSelectType] = useState<ItemType | null>("all")
  const [dateFilter, setDateFilter] = useState<string>("all")

  const options: SelectOption[] = [
    { value: "all", label: "Todos" },
    { value: "image", label: "Images" },
    { value: "file", label: "Files" },
    { value: "video", label: "Videos" },
    { value: "audio", label: "Audio" },
    { value: "document", label: "Document" },
  ]

  const dateOptions: SelectOption[] = [
    { value: "all", label: "Todos" },
    { value: "today", label: "Hoje" },
    { value: "week", label: "Últimos 7 dias" },
    { value: "month", label: "Últimos 30 dias" },
  ]

  const handleChange = (value: string) => {
    const selectedType = value as ItemType
    setSelectType(selectedType)
  }

  const handleDateChange = (value: string) => {
    const dateFilter = value
    setDateFilter(dateFilter)
  }

  const filteredItems = items.filter((item) => {
    const itemDate = new Date(item.createdAt)
    const now = new Date()

    const matchesType = selectType === "all" || item.type === selectType

    let matchesDate = true
    if (dateFilter === "today") {
      matchesDate = itemDate.toDateString() === now.toDateString()
    } else if (dateFilter === "week") {
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(now.getDate() - 7)
      matchesDate = itemDate >= oneWeekAgo
    } else if (dateFilter === "month") {
      const oneMonthAgo = new Date()
      oneMonthAgo.setMonth(now.getMonth() - 1)
      matchesDate = itemDate >= oneMonthAgo
    }

    return matchesType && matchesDate
  })

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
      <div className="files__header">
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
        <div className="files__select-type">
          <Select
            options={options}
            disabled={false}
            onChange={handleChange}
            value={selectType || "all"}
            placeholder="Selecione tipo"
          />
          <Select
            options={dateOptions}
            disabled={false}
            onChange={handleDateChange}
            value={dateFilter}
            placeholder="Filtrar por data"
          />
        </div>
      </div>
      <div className="files__cards">
        {filteredItems.length > 0 ? (
          <ul className="itens-id__ul">
            {filteredItems.map((item) => {
              // Verificar se há downloads ativos para este item
              const itemDownloads = getDownloadsForItem(item.id)
              const hasActiveDownload = itemDownloads.some((d) => d.status === "downloading")

              return (
                <li
                  key={item.id}
                  className={`itens-id__card ${hasActiveDownload ? "itens-id__card--downloading" : ""}`}
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
                  {hasActiveDownload && (
                    <div className="itens-id__download-indicator">
                      <div className="download-indicator__icon">
                        <Download size={16} />
                      </div>
                    </div>
                  )}
                </li>
              )
            })}
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

