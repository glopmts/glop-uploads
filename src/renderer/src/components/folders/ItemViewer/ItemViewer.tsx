import { DownloadIcon } from "@primer/octicons-react";
import { useDownloadStore } from "@renderer/hooks/download-store";
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
  const [coppy, setCoppy] = useState(false);

  const {
    downloads,
    addDownload,
    updateDownload,
    removeDownload,
    getDownloadsForItem
  } = useDownloadStore();

  const itemDownloads = item ? getDownloadsForItem(item.id) : [];
  const currentDownload = itemDownloads.length > 0 ? itemDownloads[0] : null;

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [item]);

  useEffect(() => {
    const unsubscribe = window.electronAPI.onDownloadProgress(({ id, progress }) => {
      updateDownload(id, { progress });

      if (progress >= 1) {
        updateDownload(id, { status: 'completed' });
      }
    });

    const unsubscribeOptimized = window.electronAPI.onOptimizedDownloadProgress(
      (filename, progress, speed, completed, canceled) => {
        console.log("Download em progresso:", { filename, progress, speed, completed, canceled });

        if (completed) {
          toast.success(`Download concluído: ${filename}`);
        }
        if (canceled) {
          toast.warning(`Download cancelado: ${filename}`);
        }
      }
    );

    return () => {
      unsubscribe();
      unsubscribeOptimized();
    };
  }, [downloads, toast, updateDownload]);

  if (!item) return null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  const handleDownload = async () => {
    if (!item?.path) return;

    const downloadId = Math.random().toString(36).substring(7);

    // Adicionar ao store global
    addDownload({
      id: downloadId,
      progress: 0,
      filename: item.title || "downloaded_file",
      itemId: item.id,
      status: 'downloading'
    });

    try {
      await window.electronAPI.downloadFile(item.path, item.title || "downloaded_file", downloadId);
    } catch {
      removeDownload(downloadId);
      toast.error("Erro ao iniciar o download");
    }
  };

  const handleCancelDownload = (id: string) => {
    window.electronAPI.cancelDownload(id);
    updateDownload(id, { status: 'canceled', progress: 0 });
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleDownload2 = async () => {
    if (!item?.path) {
      toast.error("O caminho do arquivo não está definido.");
      return;
    }

    if (!isValidUrl(item.path)) {
      toast.error(`URL inválida: ${item.path}`);
      console.error(`URL inválida tentando iniciar download: ${item.path}`);
      return;
    }

    try {
      const folder = await window.electronAPI.selectDownloadFolder();
      if (!folder) return;

      const downloadId = Math.random().toString(36).substring(7);

      // Adicionar ao store global
      addDownload({
        id: downloadId,
        progress: 0,
        filename: item.title || "downloaded_file",
        itemId: item.id,
        status: 'downloading'
      });

      await window.electronAPI.startOptimizedDownload(
        item.path,
        item.title || "downloaded_file",
        folder
      );

      toast.success("Download alternativo iniciado");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      toast.error(`Erro ao iniciar o download alternativo: ${errorMessage}`);
      console.error("Erro no download alternativo:", error);
    }
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
            {currentDownload && currentDownload.status === 'downloading' ? (
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
                    {currentDownload.speed && ` - ${(currentDownload.speed / 1024 / 1024).toFixed(1)} MB/s`}
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
