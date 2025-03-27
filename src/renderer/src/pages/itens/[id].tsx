import { CardItem, Folder } from "@renderer/types/interfaces";
import { FC, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import "./itens.scss";

const FolderId: FC = () => {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const [itens, setItens] = useState<CardItem[]>([])

  useEffect(() => {
    try {
      const pastas: Folder[] = [
        {
          id: "pasta1",
          title: "Images",
          color: "#dc2626",
          createdAt: new Date(),
          updatedAt: new Date(),
          items: [
            {
              id: "pages",
              title: "Exemples",
              type: "image",
              path: "https://i.ytimg.com/vi_webp/yuzHpNfTzt4/maxresdefault.webp",
              size: "20mb",
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
          type: "image",
        },
        {
          id: "pasta2",
          title: "Documents",
          color: "#2563eb",
          createdAt: new Date(),
          updatedAt: new Date(),
          items: [
            {
              id: "doc1",
              title: "Report",
              type: "document",
              path: "",
              size: "5mb",
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
          type: "document",
        },
        {
          id: "pasta3",
          title: "Videos",
          color: "#16a34a",
          createdAt: new Date(),
          updatedAt: new Date(),
          items: [
            {
              id: "vid1",
              title: "Tutorial",
              type: "video",
              path: "",
              size: "150mb",
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              id: "vid2",
              title: "Video clash of clans",
              type: "video",
              path: "",
              size: "250mb",
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
          type: "video",
        },
        {
          id: "pasta4",
          title: "Audio",
          color: "#9333ea",
          createdAt: new Date(),
          updatedAt: new Date(),
          items: [
            {
              id: "aud1",
              title: "Podcast",
              type: "audio",
              path: "",
              size: "45mb",
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
          type: "audio",
        },
        {
          id: "pasta5",
          title: "Audio",
          color: "",
          createdAt: new Date(),
          updatedAt: new Date(),
          items: [
            {
              id: "aud1",
              title: "Podcast",
              type: "audio",
              path: "",
              size: "45mb",
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
          type: "audio",
        },
      ];

      // Filtra a pasta pelo ID
      const pastaSelecionada = pastas.find((pasta) => pasta.id === id);

      // Define os itens da pasta selecionada no estado
      if (pastaSelecionada) {
        setItens(pastaSelecionada.items);
      } else {
        setItens([]); // Caso o ID não corresponda a nenhuma pasta
      }
    } catch (error) {
      console.log(error);
    }
  }, [id]);


  const renderItemPreview = (item: CardItem) => {
    switch (item.type) {
      case "image":
        return (
          <img
            src={item.thumbnail || item.path}
            alt={item.title}
            className="item-preview"
          />
        );
      case "video":
        return (
          <div className="video-preview">
            <img
              src={item.thumbnail}
              alt={`Thumbnail for ${item.title}`}
              className="item-preview"
            />
            <div className="play-icon">▶</div>
          </div>
        );
      case "file":
        return (
          <div className="file-preview">
            <div className="file-icon">📄</div>
            <span>{item.title}</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <section className="itens-id__container">
      <div className="itens-id__infor-details">
        <ul className="itens-id__ul">
          {itens.map((c) => (
            <li key={c.id} className="itens-id__card">
              {renderItemPreview(c)}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default FolderId;