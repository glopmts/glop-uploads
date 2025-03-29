import ItemViewer from "@renderer/components/folders/ItemViewer/ItemViewer"
import { LoadingSpinner } from "@renderer/components/loading-spinner/loading-spinner"
import { useAuth } from "@renderer/hooks/useAuth"
import { renderItemPreview } from "@renderer/pages/folder/render-items"
import UserItemsQuery from "@renderer/services/queryUploads"
import { CardItem } from "@renderer/types/interfaces"
import { useState, type FC } from "react"
import { RefreshCcw } from "react-feather"
import "./cards-upload.scss"

const CardsUpload: FC = () => {
  const { userId } = useAuth();
  const {
    data: items = [],
    isLoading,
    refetch,
    error
  } = UserItemsQuery(userId!);

  const [selectedItem, setSelectedItem] = useState<CardItem | null>(null);
  const [isRefetch, setRefecth] = useState(false);

  const closeViewer = () => {
    setSelectedItem(null);
  };

  const handleItemClick = (item: CardItem) => {
    setSelectedItem(item);
  };

  const handleRefetch = async () => {
    setRefecth(true)
    await refetch();
    setRefecth(false)
  };

  if (error) {
    return (
      <div className="erro">
        <span className="erro__message">{error.message}</span>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="loading-cards">
        <LoadingSpinner
          size="small"
          color="#6200ee"
          thickness={6}
          speed="fast"
          text="Processing..."
        />
      </div>
    );
  }

  return (
    <div className="files__container">
      <div className="files__title">
        <h3>Arquivos Salvos</h3>
        <div className="files__options">
          <button
            onClick={handleRefetch}
            className={`files__button-refetch ${isRefetch ? "files__button-refetch--spinning" : ""}`}
          >
            <div className="files__refetch-icons">
              <RefreshCcw size={17} />
            </div>
          </button>
        </div>
      </div>
      <div className="files__cards">
        {items.length > 0 ? (
          <ul className="itens-id__ul">
            {items.map((item) => (
              <li
                key={item.id}
                className="itens-id__card"
                tabIndex={0}
                role="button"
                onClick={() => handleItemClick(item)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleItemClick(item);
                  }
                }}
                aria-label={`Item ${item.title}`}
              >
                {renderItemPreview(item)}
              </li>
            ))}
          </ul>
        ) : (
          <div className="itens-id__not-found">
            <span className="itens-id__text-not">Nenhum item encontrado</span>
          </div>
        )}
      </div>
      {selectedItem && (
        <ItemViewer item={selectedItem} onClose={closeViewer} />
      )}
    </div>
  );
};

export default CardsUpload;