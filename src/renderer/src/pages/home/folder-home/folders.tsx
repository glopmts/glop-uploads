import type React from "react"
import { useEffect, useState, type FC } from "react"

import MenuFolder from "@renderer/components/folders/menu-folrders/menu-folders"
import NewsFolderMenu from "@renderer/components/folders/news-folder-menu/news-folder-menu"
import { DndProviderWrapper } from "@renderer/context/DndContext"
import { useAuth } from "@renderer/hooks/useAuth"
import { useToastNotification } from "@renderer/hooks/useToastNotification"
import { foldersServices } from "@renderer/services/folders"
import type { CardItem, Folder, ItemType } from "@renderer/types/interfaces"
import { motion } from "framer-motion"
import { RefreshCcw } from "react-feather"
import FileDragLayer from "../../../components/folders/FileDragLayer"
import { LoadingSpinner } from "../../../components/ui/loading-spinner/loading-spinner"
import useFoldersQuery from "../../../services/queryGetFolders"
import FolderItem from "./FolderItem"
import "./folders.scss"

const itemTypes: ItemType[] = ["image", "document", "video", "audio", "folder"]

const UserFolders: FC = () => {
  const { userId } = useAuth()
  const [sectionContextMenu, setSectionContextMenu] = useState<{ x: number; y: number } | null>(null)
  const [contextMenuFolderId, setContextMenuFolderId] = useState<string | null>(null)
  const [errorMessage, setError] = useState<string | null>(null)
  const toast = useToastNotification()

  const { data: folders = [], error, isLoading, refetch } = useFoldersQuery(userId!)
  const [isRefetch, setRefecth] = useState(false)

  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false)
  const [newFolderData, setNewFolderData] = useState({
    title: "",
    type: "folder" as ItemType,
    color: "#3b82f6",
    parentId: null as string | null,
  })

  // Setup global drag and drop event listeners
  useEffect(() => {
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
    }

    const handleDrop = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      // This is handled by individual folder components
    }

    document.addEventListener("dragover", handleDragOver)
    document.addEventListener("drop", handleDrop)

    return () => {
      document.removeEventListener("dragover", handleDragOver)
      document.removeEventListener("drop", handleDrop)
    }
  }, [])

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

  const handleFolderContextMenu = (e: React.MouseEvent, folderId: string) => {
    e.preventDefault()
    e.stopPropagation()
    setContextMenuFolderId(folderId)
    setSectionContextMenu({ x: e.clientX, y: e.clientY })
  }

  const closeSectionContextMenu = () => {
    setSectionContextMenu(null)
  }

  const handleRefetch = async () => {
    setRefecth(true)
    await refetch()
    setRefecth(false)
    setTimeout(() => setRefecth(false), 500)
  }

  const openFolderModal = (parentId: string | null = null) => {
    setNewFolderData({
      title: "",
      type: "folder",
      color: "#" + Math.floor(Math.random() * 16777215).toString(16),
      parentId,
    })
    setIsFolderModalOpen(true)
    closeSectionContextMenu()
  }

  const handleCreateFolder = async () => {
    if (!newFolderData.title.trim()) return

    try {
      await foldersServices.createFolder(userId!, newFolderData.title, newFolderData.color, newFolderData.type)
      refetch()
      setIsFolderModalOpen(false)
    } catch (error) {
      setError((error as Error).message)
    }
  }

  const isFolder = (item: CardItem | Folder): item is Folder => {
    return (item as Folder).isFolder === true
  }

  const renderFolders = (foldersList: (Folder | CardItem)[], depth = 0) => {
    return foldersList.map((item) => {
      if (isFolder(item)) {
        return (
          <div
            key={item.id}
            className="folder-wrapper"
            style={{ marginLeft: `${depth * 20}px` }}
            onContextMenu={(e) => handleFolderContextMenu(e, item.id)}
          >
            <FolderItem
              folder={item}
              userId={userId!}
              handleDelete={handleDelete}
              onAddSubfolder={() => openFolderModal(item.id)}
            />
          </div>
        )
      }
      return null
    })
  }

  const handleDelete = async (id: string) => {
    try {
      await foldersServices.deleteFolder(id)
      await refetch()
      toast.success("Deletado!", "Pasta deletado com sucesso")
    } catch (error) {
      toast.error("Erro", "Não foi possível deletar o Pasta")
      console.log(error)
    }
  }

  const sectionMenuOptions = [
    {
      label: "Nova Pasta",
      icon: "folder-open",
      onClick: () => openFolderModal(),
    },
  ]

  if (error) {
    return (
      <div className="erro">
        <span className="erro__message">{error.message}</span>
      </div>
    )
  }

  return (
    <DndProviderWrapper>
      <section className="folders__container" onContextMenu={handleSectionContextMenu}>
        <div className="folders__header">
          <h3 className="folders__h3">Pastas</h3>
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

        {isLoading ? (
          <LoadingSpinner size="small" color="#6200ee" thickness={6} speed="fast" text="Processing..." />
        ) : error ? (
          <div className="erro">
            <span className="erro__message">{error}</span>
          </div>
        ) : (
          <div className="folders__container-items">
            {folders.length > 0 ? renderFolders(folders) : <p>Nenhuma pasta encontrada.</p>}
          </div>
        )}

        <NewsFolderMenu
          isOpen={isFolderModalOpen}
          onClose={() => setIsFolderModalOpen(false)}
          title={newFolderData.title}
          color={newFolderData.color}
          itemTypes={itemTypes}
          selectedType={newFolderData.type}
          onTitleChange={(e) => setNewFolderData({ ...newFolderData, title: e.target.value })}
          onColorChange={(e) => setNewFolderData({ ...newFolderData, color: e.target.value })}
          onTypeChange={(e) => setNewFolderData({ ...newFolderData, type: e.target.value as ItemType })}
          onSubmit={handleCreateFolder}
          errorMessage={errorMessage!}
        />

        {sectionContextMenu && (
          <MenuFolder
            position={sectionContextMenu}
            onClose={closeSectionContextMenu}
            subPasta={openFolderModal}
            options={contextMenuFolderId ? [] : sectionMenuOptions}
            folderId={contextMenuFolderId!}
            handleDelete={handleDelete}
          />
        )}

        <FileDragLayer />
      </section>
    </DndProviderWrapper>
  )
}

export default UserFolders

