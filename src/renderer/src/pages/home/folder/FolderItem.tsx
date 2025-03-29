import { Button } from "@renderer/components/button/button";
import { Input } from "@renderer/components/input/input";
import LaodingButtons from "@renderer/components/loading-buttons/loading-buttons";
import { Modal } from "@renderer/components/modal/modal";
import { useToastNotification } from "@renderer/hooks/useToastNotification";
import { ServicesFiles } from "@renderer/services/files-uploads";
import { foldersServices } from "@renderer/services/folders";
import useFoldersQuery from "@renderer/services/queryGetFolders";
import type { Folder, ItemType } from "@renderer/types/interfaces";
import { useCallback, useEffect, useMemo, useRef, useState, type FC } from "react";
import { File, FileText, Folder as FolderIcon, Image, Music, Video } from "react-feather";
import { useNavigate } from "react-router-dom";
import MenuFolder from "../../../components/folders/menu-folrders/menu-folders";

interface FolderItemProps {
  folder: Folder;
  userId?: string;
  onAddSubfolder?: () => void;
  handleDelete: (id: string) => void;
}

const itemTypes: ItemType[] = ["file", "image", "video", "audio", "document"];

const getIconByType = (type: ItemType) => {
  const icons: Record<ItemType, JSX.Element> = {
    folder: <FolderIcon size={18} />,
    file: <File size={18} />,
    image: <Image size={18} />,
    video: <Video size={18} />,
    audio: <Music size={18} />,
    document: <FileText size={18} />,
  };
  return icons[type] || <File size={18} />;
};

// Função auxiliar para formatar data
const formatDate = (date: string | Date) => {
  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) {
    return "Data inválida";
  }
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(parsedDate);
};

const FolderItem: FC<FolderItemProps> = ({ folder, handleDelete, userId }) => {
  const navigate = useNavigate();
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [isEditMenu, setEditMenu] = useState(false);
  const [isLoader, setEditLoader] = useState(false);
  const [title, setTitle] = useState(folder.title || "");
  const [color, setColor] = useState(folder.color || "#27272a");
  const [selectedType, setSelectedType] = useState<ItemType>(folder.type || "file");
  const toast = useToastNotification();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { refetch } = useFoldersQuery(userId!);
  const [isDragOver, setIsDragOver] = useState(false);
  const folderRef = useRef<HTMLDivElement>(null);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  }, []);

  const closeContextMenu = useCallback(() => setContextMenu(null), []);

  const handleMenuToggle = useCallback(() => setEditMenu((prev) => !prev), []);

  const handleTypeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedType(e.target.value as ItemType);
  }, []);

  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  }, []);

  const handleColorChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setColor(e.target.value);
  }, []);

  const handleSubmit = useCallback(async () => {
    setEditLoader(true);
    try {
      await foldersServices.updateFolder(folder.id, title, color, selectedType);
      toast.success("Pasta atualizada com sucesso!");
      setEditMenu(false);
      await refetch();
    } catch (error) {
      console.log(error);
      toast.error("Error ao tentar atualizar pasta!");
      setEditLoader(false);
    } finally {
      setEditLoader(false);
    }
  }, [color, folder.id, refetch, selectedType, title, toast]);

  const getFileType = (file: File) => {
    const type = file.type.split("/")[0];
    if (type === "image") return "image";
    if (type === "video") return "video";
    if (type === "audio") return "audio";
    return "document";
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleFileDrop = async (files: File[]) => {
    if (!files.length || !userId) return;

    try {
      setIsUploading(true);

      for (const file of files) {
        await ServicesFiles.uploadFile(
          userId,
          file.name,
          getFileType(file),
          folder.id,
          file,
          (progress) => setUploadProgress(progress)
        );
      }

      toast.success("Upload concluído", "Arquivos enviados com sucesso para a pasta");
      refetch();
    } catch (error) {
      toast.error("Erro no upload", "Não foi possível enviar os arquivos");
      console.error(error);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Set up native drag and drop event handlers
  useEffect(() => {
    const folderElement = folderRef.current;
    if (!folderElement) return;

    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(true);
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!isDragOver) setIsDragOver(true);
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // Only set to false if we're leaving the folder element itself
      // and not just moving between its children
      if (e.currentTarget === folderElement && !folderElement.contains(e.relatedTarget as Node)) {
        setIsDragOver(false);
      }
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
        const filesArray = Array.from(e.dataTransfer.files);
        handleFileDrop(filesArray);
      }
    };

    folderElement.addEventListener("dragenter", handleDragEnter);
    folderElement.addEventListener("dragover", handleDragOver);
    folderElement.addEventListener("dragleave", handleDragLeave);
    folderElement.addEventListener("drop", handleDrop);

    return () => {
      folderElement.removeEventListener("dragenter", handleDragEnter);
      folderElement.removeEventListener("dragover", handleDragOver);
      folderElement.removeEventListener("dragleave", handleDragLeave);
      folderElement.removeEventListener("drop", handleDrop);
    };
  }, [isDragOver, handleFileDrop]);

  const handleNavigate = useCallback(() => {
    navigate({ pathname: "/folder", search: `?id=${folder.id}&name=${folder.title}&type=${folder.type}` });
  }, [navigate, folder.id, folder.title, folder.type]);

  const folderStyle = useMemo(() => ({ backgroundColor: folder.color || "#27272a" }), [folder.color]);

  return (
    <>
      <div
        className="folder-item"
        role="button"
        tabIndex={0}
        onContextMenu={handleContextMenu}
        onClick={handleNavigate}
        aria-label={`Abrir pasta ${folder.title}`}
        ref={folderRef}
      >
        <div
          className={`folder-item__container ${isDragOver ? 'folder-item__container--drag-over' : ''}`}
          style={folderStyle}
        >
          <div className="folder-item__tab"></div>
          <div className="folder-item__content">
            <span className="folder-item__title">{folder.title}</span>
            <span className="folder-item__info">
              {folder.items && folder.items.length} {folder.items && folder.items.length === 1 ? "item" : "itens"} •{" "}
              {formatDate(folder.updatedAt)}
            </span>
          </div>
          <div className="folder-item__icon">{getIconByType(folder.type)}</div>
          {isUploading && (
            <div className="folder-item__upload-progress">
              <div className="folder-item__upload-bar" style={{ width: `${uploadProgress}%` }}></div>
              <span className="folder-item__upload-text">{uploadProgress}%</span>
            </div>
          )}
        </div>
      </div>

      {contextMenu && (
        <MenuFolder
          position={contextMenu}
          editeMenu={handleMenuToggle}
          onClose={closeContextMenu}
          folderId={folder.id}
          subPasta={() => { }}
          folderTitle={folder.title}
          handleDelete={() => handleDelete(folder.id)}
        />
      )}

      {isEditMenu && (
        <Modal onClose={handleMenuToggle} title="Editar Pasta" visible={isEditMenu}>
          <div className="news-folder__itens-content">
            <div className="news-folder__itens">
              <label>Título da Pasta</label>
              <Input placeholder="Título da pasta" type="text" value={title} onChange={handleTitleChange} />
            </div>
            <label>Selecione um tipo</label>
            <select className="news-upload__select" value={selectedType} onChange={handleTypeChange}>
              {itemTypes.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
            <div className="news-folder__itens">
              <label>Cor da Pasta (opcional)</label>
              <Input
                className="news-folder__input-color"
                type="color"
                value={color}
                onChange={handleColorChange}
                style={{ background: color }}
              />
            </div>
          </div>
          <div className="news-upload__modal-actions">
            <Button onClick={handleMenuToggle} className="news-upload__cancel-button">
              Cancelar
            </Button>
            <Button theme="primary" disabled={isLoader} onClick={handleSubmit}>
              {isLoader ? <LaodingButtons /> : "Atualizar"}
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
};

export default FolderItem;
