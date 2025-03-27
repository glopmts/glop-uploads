/* eslint-disable @typescript-eslint/explicit-function-return-type */
import type React from "react"

import { UploadIcon } from "@primer/octicons-react"
import { Button } from "@renderer/components/button/button"
import { Input } from "@renderer/components/input/input"
import { Modal } from "@renderer/components/modal/modal"
import type { ItemType } from "@renderer/types/interfaces"
import { type FC, useState } from "react"
import "./news-upload.scss"

const NewsUploadFiles: FC = () => {
  const [isTrue, setTrue] = useState(false)
  const [selectedType, setSelectedType] = useState<ItemType>("file")
  const [title, setTitle] = useState("");
  const [isUpload, setIsUpload] = useState(false);

  const itemTypes: ItemType[] = ["file", "image", "video", "audio", "document"]

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedType(e.target.value as ItemType)
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value)
  }

  const handleSubmit = () => {
    setIsUpload(true);
    console.log({ title, type: selectedType })
    setTrue(false)
  }

  return (
    <div className="news-upload__container">
      <div className="news-upload__button-active">
        <Button onClick={() => setTrue(true)}>
          <UploadIcon size={18} />
          Novo upload
        </Button>
      </div>
      {isTrue && (
        <Modal title="Novo upload" onClose={() => setTrue(false)} visible={isTrue}>
          <div className="news-upload__modal-container">
            <div className="news-upload__modal-itens">
              <label>Titulo</label>
              <Input placeholder="titulo" type="text" value={title} onChange={handleTitleChange} />
            </div>
            <div className="news-upload__modal-itens">
              <label>Selecione um type</label>
              <select className="news-upload__select" value={selectedType} onChange={handleTypeChange}>
                {itemTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div className="news-upload__modal-actions">
              <Button onClick={() => setTrue(false)} className="news-upload__cancel-button">
                Cancelar
              </Button>
              <Button theme="primary" onClick={handleSubmit}>Confirmar</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default NewsUploadFiles

