import { FoldIcon } from "@primer/octicons-react";
import { Modal } from "@renderer/components/modal/modal";
import { useAuth } from "@renderer/hooks/useAuth";
import useFoldersQuery from "@renderer/services/queryGetFolders";
import { ItemType } from "@renderer/types/interfaces";
import { FC, useState } from "react";
import { Button } from "../../../components/ui/button/button";
import { Input } from "../../../components/ui/input/input";
import LaodingButtons from "../../../components/ui/loading-buttons/loading-buttons";
import { foldersServices } from "../../../services/folders";
import "./news-folder.scss";

const NewsFolder: FC = () => {
  const { userId } = useAuth();
  const [isTrueModal, setTrueModal] = useState(false);
  const [title, setTitle] = useState('');
  const [color, setColor] = useState('');
  const [selectedType, setSelectedType] = useState<ItemType>("file")
  const [error, setError] = useState<string | null>(null)
  const [loader, setLoader] = useState(false);

  const { refetch } = useFoldersQuery(userId!)

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

  const handleSubmit = async () => {
    if (!title.trim() || !userId) {
      setError("Necessario nome pasta ou Authenticação!")
      return;
    }

    setLoader(true)

    try {
      await foldersServices.createFolder(userId!, title, color, selectedType)
      setTrueModal(false);
      await refetch();
      setTitle("");
      setColor("");
    } catch (error) {
      setError((error as Error).message);
      setLoader(false)
    } finally {
      setLoader(false)
    }
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
        <Modal title="Novo Pasta" onClose={() => setTrueModal(false)} visible={isTrueModal}>
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
          <div className="">
            <span>{error}</span>
          </div>
          <div className="news-upload__modal-actions">
            <Button onClick={() => setTrueModal(false)} className="news-upload__cancel-button">
              Cancelar
            </Button>
            <Button theme="primary" disabled={loader} onClick={handleSubmit}>
              {loader ? (
                <LaodingButtons />
              ) : (
                "Confirmar"
              )}
            </Button>
          </div>
        </Modal>
      )}
    </section>
  );
}

export default NewsFolder;