import { Button } from "@renderer/components/button/button";
import { Input } from "@renderer/components/input/input";
import { Modal } from "@renderer/components/modal/modal";
import { ItemType } from "@renderer/types/interfaces";
import { ChangeEvent, FC } from "react";
import "./news-folder-menu.scss";

type MenuProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  color: string;
  onTitleChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onColorChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
  onTypeChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  selectedType: ItemType;
  itemTypes: ItemType[];
};

const NewsFolderMenu: FC<MenuProps> = ({
  isOpen,
  onClose,
  title,
  color,
  itemTypes,
  selectedType,
  onTitleChange,
  onSubmit,
  onColorChange,
  onTypeChange,
}) => {
  return (
    <Modal
      title="Nova Pasta"
      onClose={onClose}
      visible={isOpen}
    >
      <div className="news-folder__itens-content">
        <div className="news-folder__itens">
          <label>Título da Pasta</label>
          <Input
            placeholder="Nome da pasta"
            type="text"
            value={title}
            onChange={onTitleChange}
          />
        </div>

        <div className="news-folder__itens">
          <label>Tipo de Pasta</label>
          <select
            className="news-upload__select"
            value={selectedType}
            onChange={onTypeChange}
          >
            {itemTypes.map((type) => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="news-folder__itens">
          <label>Cor da Pasta (opcional)</label>
          <div className="color-picker-container">
            <Input
              placeholder="Cor"
              className="news-folder__input-color"
              type="color"
              value={color}
              onChange={onColorChange}
            />
            <span className="color-preview" style={{ backgroundColor: color }} />
          </div>
        </div>
      </div>

      <div className="news-upload__modal-actions">
        <Button
          onClick={onClose}
          className="news-upload__cancel-button"
        >
          Cancelar
        </Button>
        <Button
          theme="primary"
          onClick={onSubmit}
        >
          Criar Pasta
        </Button>
      </div>
    </Modal>
  );
};

export default NewsFolderMenu;