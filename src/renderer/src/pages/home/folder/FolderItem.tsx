import { Button } from "@renderer/components/button/button";
import { Input } from "@renderer/components/input/input";
import { Modal } from "@renderer/components/modal/modal";
import type { Folder, ItemType } from "@renderer/types/interfaces";
import { useCallback, useMemo, useState, type FC } from "react";
import { File, FileText, Folder as FolderIcon, Image, Music, Video } from "react-feather";
import { useNavigate } from "react-router-dom";
import MenuFolder from "../../../components/folders/menu-folrders/menu-folders";

interface FolderItemProps {
  folder: Folder;
  onAddSubfolder?: () => void
}

const itemTypes: ItemType[] = ["file", "image", "video", "audio", "document"];

// Função auxiliar para renderizar ícone
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
    return "Data inválida"; // Retorne algo adequado em caso de erro de data
  }
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(parsedDate);
};


const FolderItem: FC<FolderItemProps> = ({ folder }) => {
  const navigate = useNavigate();
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [isEditMenu, setEditMenu] = useState(false);
  const [title, setTitle] = useState(folder.title || "");
  const [color, setColor] = useState(folder.color || "#27272a");
  const [selectedType, setSelectedType] = useState<ItemType>(folder.type || "file");

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  }, []);

  const closeContextMenu = useCallback(() => setContextMenu(null), []);

  const handleMenuToggle = useCallback(() => setEditMenu(prev => !prev), []);

  const handleTypeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedType(e.target.value as ItemType);
  }, []);

  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  }, []);

  const handleColorChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setColor(e.target.value);
  }, []);

  const handleSubmit = useCallback(() => {
    // Adicionar lógica de atualização da pasta
  }, []);

  const handleNavigate = useCallback(() => {
    navigate({ pathname: "/folder", search: `?id=${folder.id}&name=${folder.title}` });
  }, [navigate, folder.id, folder.title]);

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
      >
        <div className="folder-item__container" style={folderStyle}>
          <div className="folder-item__tab"></div>
          <div className="folder-item__content">
            <span className="folder-item__title">{folder.title}</span>
            <span className="folder-item__info">
              {folder.items && folder.items.length} {folder.items && folder.items.length === 1 ? "item" : "itens"} • {formatDate(folder.updatedAt)}
            </span>
          </div>
          <div className="folder-item__icon">{getIconByType(folder.type)}</div>
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
            <Button theme="primary" onClick={handleSubmit}>
              Atualizar
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
};

export default FolderItem;
