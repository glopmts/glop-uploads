/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { FoldIcon } from "@primer/octicons-react";
import { Backdrop } from "@renderer/components/backdrop/backdrop";
import { Button } from "@renderer/components/button/button";
import { Input } from "@renderer/components/input/input";
import { Modal } from "@renderer/components/modal/modal";
import { ItemType } from "@renderer/types/interfaces";
import { FC, useState } from "react";
import "./news-folder.scss";

const NewsFolder: FC = () => {
  const [isTrueModal, setTrueModal] = useState(false);
  const [title, setTitle] = useState('');
  const [color, setColor] = useState('');
  const [selectedType, setSelectedType] = useState<ItemType>("file")

  const itemTypes: ItemType[] = ["file", "image", "video", "audio", "document"]

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedType(e.target.value as ItemType)
  }

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value)
  }

  const onChangeColor = (e: React.ChangeEvent<HTMLInputElement>) => {
    setColor(e.target.value)
  }

  const handleSubmit = () => {

  }

  return (
    <section className="news-folder__container">
      <div className="news-folder__button-active">
        <Button onClick={() => setTrueModal(true)}>
          <FoldIcon size={18} />
          Nova Pasta
        </Button>
      </div>
      {isTrueModal && (
        <Backdrop>
          <Modal title="Novo upload" onClose={() => setTrueModal(false)} visible={isTrueModal}>
            <div className="news-folder__itens-content">
              <div className="news-folder__itens">
                <label>Titulo Pasta</label>
                <Input placeholder="titulo pasta" type="text" value={title} onChange={onChange} />
              </div>
              <label>Selecione um type</label>
              <select className="news-upload__select" value={selectedType} onChange={handleTypeChange}>
                {itemTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
              <div className="news-folder__itens">
                <label>Cor Pasata (opcional)</label>
                <Input placeholder="Cor" className="news-folder__input-color" type="color" value={color} onChange={onChangeColor} style={{
                  background: color
                }} />
              </div>
            </div>
            <div className="news-upload__modal-actions">
              <Button onClick={() => setTrueModal(false)} className="news-upload__cancel-button">
                Cancelar
              </Button>
              <Button theme="primary" onClick={handleSubmit}>Confirmar</Button>
            </div>
          </Modal>
        </Backdrop>
      )}
    </section>
  );
}

export default NewsFolder;