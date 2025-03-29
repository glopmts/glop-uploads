import type React from "react"

import type { CardItem } from "@renderer/types/interfaces"
import { type FC, useEffect, useRef, useState } from "react"
import { Download, X } from "react-feather"
import { Button } from "../../button/button"
import "./ItemViewer.scss"

interface ItemViewerProps {
  item: CardItem | null
  onClose: () => void
}

const ItemViewer: FC<ItemViewerProps> = ({ item, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [item])

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.focus()
    }
  }, [])

  if (!item) return null

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose()
    }
  }

  const handleDownload = () => {
    if (item.path) {
      // Create a temporary anchor element to trigger download
      const link = document.createElement("a")
      link.href = item.path
      link.download = item.title || "download"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const renderContent = () => {
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
        )
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
        )
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
        )
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
        )
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
        )
    }
  }

  return (
    <div className="item-viewer-overlay" onClick={onClose} onKeyDown={handleKeyDown} tabIndex={0} ref={containerRef}>
      <div className="item-viewer-container" onClick={(e) => e.stopPropagation()}>
        <div className="viewer-header">
          <h3>{item.title}</h3>
          <button className="close-button" onClick={onClose} aria-label="Fechar">
            <X size={24} />
          </button>
        </div>
        {renderContent()}
        <div className="viewer-footer">
          <div className="item-details">
            <span>Tipo: {item.type}</span>
            <span>Tamanho: {item.size}</span>
            <span>Data Upload: {item.createdAt ? (
              new Date(item.createdAt).toLocaleDateString()
            ) : (
              "Data Invalida"
            )}</span>
          </div>
          <div className="download-button">
            <Button theme="outline" onClick={handleDownload}>
              <Download size={20} />
              <span className="sr-only">Download</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ItemViewer

