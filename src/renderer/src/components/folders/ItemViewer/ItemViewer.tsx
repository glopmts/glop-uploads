import { DownloadIcon } from "@primer/octicons-react";
import { useToastNotification } from "@renderer/hooks/useToastNotification";
import { type FC, useEffect, useRef, useState } from "react";
import { Copy, Download, StopCircle, X } from "react-feather";
import { CardItem } from "../../../types/interfaces";
import { Button } from "../../ui/button/button";
import "./ItemViewer.scss";
import { renderContent } from "./renderContent";

interface ItemViewerProps {
  item: CardItem | null;
  onClose: () => void;
}

const ItemViewer: FC<ItemViewerProps> = ({ item, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const toast = useToastNotification();
  const [downloads, setDownloads] = useState<{ id: string; progress: number }[]>([]);
  const [coppy, setCoppy] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [item]);

  useEffect(() => {
    const unsubscribe = window.electronAPI.onDownloadProgress(({ id, progress }) => {
      setDownloads((prev) =>
        prev.map((d) => (d.id === id ? { ...d, progress } : d))
      );
    });

    return () => unsubscribe();
  }, []);

  if (!item) return null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  const handleDownload = async () => {
    if (!item?.path) return;

    const downloadId = Math.random().toString(36).substring(7);

    setDownloads((prev) => [...prev, { id: downloadId, progress: 0 }]);

    try {
      await window.electronAPI.downloadFile(item.path, item.title || "downloaded_file", downloadId);
    } catch {
      setDownloads((prev) => prev.filter((d) => d.id !== downloadId));
      toast.error("Erro ao iniciar o download");
    }
  };

  const handleCancelDownload = (id: string) => {
    window.electronAPI.cancelDownload(id);
    setDownloads((prev) => prev.filter((d) => d.id !== id));
  };

  const handleDownload2 = () => {
    // Implementação alternativa de download
  };

  const handleCopy = () => {
    if (!item?.path) return;

    navigator.clipboard.writeText(item.path)
      .then(() => {
        setCoppy(true);
        toast.success("URL copiada com sucesso!");
        setTimeout(() => setCoppy(false), 2000);
      })
      .catch(() => {
        toast.error("Erro ao copiar a URL");
      });
  };

  const currentDownload = downloads.length > 0 ? downloads[downloads.length - 1] : null;

  return (
    <div
      className="item-viewer-overlay"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      ref={containerRef}
    >
      <div className="item-viewer-container" onClick={(e) => e.stopPropagation()}>
        <div className="viewer-header">
          <h3>{item.title}</h3>
          <button className="close-button" onClick={onClose} aria-label="Fechar">
            <X size={24} />
          </button>
        </div>
        {renderContent({ videoRef, isLoading, setIsLoading, item })}
        <div className="viewer-footer">
          <div className="item-details">
            <span>Tipo: {item.type}</span>
            <span>Tamanho: {item.size}</span>
            <span>
              Data Upload:{" "}
              {item.createdAt
                ? new Date(item.createdAt).toLocaleDateString()
                : "Data Invalida"}
            </span>
          </div>
          <div className="download-button">
            {currentDownload ? (
              <>
                <div className="download-progress">
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${currentDownload.progress * 100}%` }}
                    ></div>
                  </div>
                  <span className="progress-text">
                    {Math.round(currentDownload.progress * 100)}%
                  </span>
                </div>
                <Button
                  theme="danger"
                  onClick={() => handleCancelDownload(currentDownload.id)}
                >
                  <StopCircle size={20} />
                  <span>Cancelar</span>
                </Button>
              </>
            ) : (
              <>
                <Button theme="outline" onClick={handleDownload}>
                  <Download size={20} />
                  <span>Download</span>
                </Button>
                <Button theme="outline" onClick={handleDownload2}>
                  <DownloadIcon size={20} />
                  <span>Download Alternativo</span>
                </Button>
                <Button theme="outline" onClick={handleCopy}>
                  {coppy ? (
                    <>
                      <Copy size={20} className="download-button__iscopy" />
                      <span>Url copiada</span>
                    </>
                  ) : (
                    <>
                      <Copy size={20} />
                      <span>Copy Url</span>
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemViewer;