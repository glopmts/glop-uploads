import { CardItem } from "@renderer/types/interfaces";

type InterfacesProps = {
  isLoading: boolean;
  item: CardItem;
  videoRef: React.RefObject<HTMLVideoElement>;
  setIsLoading: (isLoading: boolean) => void;
}

export const renderContent = ({
  isLoading,
  item,
  videoRef,
  setIsLoading
}: InterfacesProps) => {
  switch (item.type) {
    case "image":
      return (
        <div className="viewer-content image-viewer">
          {isLoading && <div className="loading-spinner"></div>}
          <img
            src={item.path || "/placeholder.svg"}
            alt={item.title}
            onLoad={() => setIsLoading(false)}
            style={{ display: isLoading ? "none" : "block" }}
          />
        </div>
      );
    case "video":
      return (
        <div className="viewer-content video-viewer">
          {isLoading && <div className="loading-spinner"></div>}
          <video
            ref={videoRef}
            controls
            autoPlay
            onLoadedData={() => setIsLoading(false)}
            style={{ display: isLoading ? "none" : "block" }}
          >
            <source src={item.path} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      );
    case "document":
      return (
        <div className="viewer-content document-viewer">
          {isLoading && <div className="loading-spinner"></div>}
          <iframe
            src={item.path}
            title={item.title || "Document"}
            onLoad={() => setIsLoading(false)}
            style={{ display: isLoading ? "none" : "block" }}
          />
        </div>
      );
    case "audio":
      return (
        <div className="viewer-content audio-viewer">
          <div className="audio-container">
            <div className="audio-title">{item.title}</div>
            <audio controls autoPlay>
              <source src={item.path} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
          </div>
        </div>
      );
    default:
      return (
        <div className="viewer-content unknown-type">
          <div className="unknown-message">
            <div className="file-icon">📄</div>
            <p>Não foi possível visualizar este arquivo.</p>
            <p className="file-details">
              Tipo: {item.type || "Desconhecido"}
              <br />
              Tamanho: {item.size}
            </p>
          </div>
        </div>
      );
  }
};