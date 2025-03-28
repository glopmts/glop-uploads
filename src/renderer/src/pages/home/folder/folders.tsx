import MenuFolder from "@renderer/components/folders/menu-folrders/menu-folders";
import NewsFolderMenu from "@renderer/components/folders/news-folder-menu/news-folder-menu";
import type { CardItem, Folder, ItemType } from "@renderer/types/interfaces";
import { useState, type FC } from "react";
import FolderItem from "./FolderItem";
import "./folders.scss";

const itemTypes: ItemType[] = ["image", "document", "video", "audio", "folder"];

const UserFolders: FC = () => {
  const [sectionContextMenu, setSectionContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [contextMenuFolderId, setContextMenuFolderId] = useState<string | null>(null);
  const [folders, setFolders] = useState<Folder[]>([]);

  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [newFolderData, setNewFolderData] = useState({
    title: "",
    type: "folder" as ItemType,
    color: "#3b82f6",
    parentId: null as string | null,
  });

  const handleSectionContextMenu = (e: React.MouseEvent) => {
    if (
      (e.target as HTMLElement).className === "folders__container-items" ||
      (e.target as HTMLElement).className === "folders__container"
    ) {
      e.preventDefault();
      setContextMenuFolderId(null);
      setSectionContextMenu({ x: e.clientX, y: e.clientY });
    }
  };

  const handleFolderContextMenu = (e: React.MouseEvent, folderId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenuFolderId(folderId);
    setSectionContextMenu({ x: e.clientX, y: e.clientY });
  };

  const closeSectionContextMenu = () => {
    setSectionContextMenu(null);
  };

  const openFolderModal = (parentId: string | null = null) => {
    setNewFolderData({
      title: "",
      type: "folder",
      color: "#" + Math.floor(Math.random() * 16777215).toString(16),
      parentId,
    });
    setIsFolderModalOpen(true);
    closeSectionContextMenu();
  };

  const handleCreateFolder = () => {
    if (!newFolderData.title.trim()) return;

    const newFolder: Folder = {
      id: `folder-${Date.now()}`,
      title: newFolderData.title,
      type: newFolderData.type,
      color: newFolderData.color,
      items: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isFolder: true,
    };

    if (newFolderData.parentId) {
      setFolders(prevFolders =>
        addSubfolder(prevFolders, newFolderData.parentId!, newFolder)
      );
    } else {
      setFolders(prev => [...prev, newFolder]);
    }

    setIsFolderModalOpen(false);
  };

  const addSubfolder = (folders: Folder[], parentId: string, newFolder: Folder): Folder[] => {
    return folders.map(folder => {
      if (folder.id === parentId) {
        return {
          ...folder,
          items: [...folder.items, newFolder],
        };
      }

      if (folder.isFolder) {
        return {
          ...folder,
          items: addSubfolder(folder.items.filter(isFolder), parentId, newFolder),
        };
      }

      return folder;
    });
  };

  const isFolder = (item: CardItem | Folder): item is Folder => {
    return (item as Folder).isFolder === true;
  };

  const renderFolders = (foldersList: (Folder | CardItem)[], depth = 0) => {
    return foldersList.map(item => {
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
              onAddSubfolder={() => openFolderModal(item.id)}
            />
          </div>
        );
      }
      return null;
    });
  };

  const sectionMenuOptions = [
    {
      label: "Nova Pasta",
      icon: "folder-open",
      onClick: () => openFolderModal(),
    },
  ];


  return (
    <section className="folders__container" onContextMenu={handleSectionContextMenu}>
      <h3 className="folders__h3">Pastas</h3>

      <div className="folders__container-items">
        {renderFolders(folders)}
      </div>

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
      />

      {sectionContextMenu && (
        <MenuFolder
          position={sectionContextMenu}
          onClose={closeSectionContextMenu}
          subPasta={openFolderModal}
          options={contextMenuFolderId ? [] : sectionMenuOptions}
          folderId={contextMenuFolderId!}
        />
      )}
    </section>
  );
};

export default UserFolders;