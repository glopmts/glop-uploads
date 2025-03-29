import { FileIcon, FileMediaIcon, ImageIcon, UploadIcon, VideoIcon, XIcon } from "@primer/octicons-react"
import { Button } from "@renderer/components/button/button"
import { Input } from "@renderer/components/input/input"
import LoadingButtons from "@renderer/components/loading-buttons/loading-buttons"
import { Modal } from "@renderer/components/modal/modal"
import { useAuth } from "@renderer/hooks/useAuth"
import { ServicesFiles } from "@renderer/services/files-uploads"
import type { ItemType } from "@renderer/types/interfaces"
import type React from "react"
import { type FC, useCallback, useRef, useState } from "react"
import "./news-upload.scss"

const NewsUploadFiles: FC = () => {
  const { userId } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedType, setSelectedType] = useState<ItemType>("file")
  const [title, setTitle] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const itemTypes: ItemType[] = ["file", "image", "video", "audio", "document"]

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedType(e.target.value as ItemType)
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles(filesArray);
    }
  }

  const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files);
      setSelectedFiles(filesArray);
    }
  }, []);

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  }

  const openFileSelector = () => {
    fileInputRef.current?.click();
  }

  const resetForm = () => {
    setTitle("");
    setSelectedFiles([]);
    setSelectedType("file");
    setUploadProgress(0);
  }

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  }

  const handleSubmit = async () => {
    if (!userId || !title || selectedFiles.length === 0) {
      // Show error message
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      if (selectedFiles.length === 1) {
        const formData = new FormData();
        formData.append('userId', userId);
        formData.append('title', title);
        formData.append('type', selectedType);
        formData.append('file', selectedFiles[0]);

        await ServicesFiles.uploadFile(userId, title, selectedType, selectedFiles[0], (progress) => {
          setUploadProgress(progress);
        });
      } else {
        const formData = new FormData();
        formData.append('userId', userId);
        selectedFiles.forEach(file => {
          formData.append('files', file);
        });

        await ServicesFiles.uploadFiles(userId, selectedFiles, (progress) => {
          setUploadProgress(progress);
        });
      }

      closeModal();
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setIsUploading(false);
    }
  }


  const getFileIcon = (file: File) => {
    const fileType = file.type.split('/')[0];
    switch (fileType) {
      case 'image':
        return <ImageIcon size={16} />;
      case 'video':
        return <VideoIcon size={16} />;
      case 'audio':
        return <FileMediaIcon size={16} />;
      default:
        return <FileIcon size={16} />;
    }
  }

  // const getFilePreview = (file: File) => {
  //   if (file.type.startsWith('image/')) {
  //     return URL.createObjectURL(file);
  //   }
  //   return null;
  // }

  return (
    <div className="news-upload__container">
      <div className="news-upload__button-active">
        <Button onClick={() => setIsModalOpen(true)}>
          <UploadIcon size={18} />
          Novo upload
        </Button>
      </div>

      {isModalOpen && (
        <Modal title="Novo upload" onClose={closeModal} visible={isModalOpen}>
          <div className="news-upload__modal-container">
            <div className="news-upload__modal-itens">
              <label>Titulo</label>
              <Input
                placeholder="Título do arquivo"
                type="text"
                value={title}
                onChange={handleTitleChange}
              />
            </div>

            <div className="news-upload__modal-itens">
              <label>Selecione um type</label>
              <select
                className="news-upload__select"
                value={selectedType}
                onChange={handleTypeChange}
              >
                {itemTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="news-upload__modal-itens">
              <label>Clique ou arraste um item</label>
              <div
                className={`news-upload__dropzone ${dragActive ? 'news-upload__dropzone--active' : ''}`}
                onClick={openFileSelector}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  className="news-upload__file-input"
                  onChange={handleFileChange}
                  multiple
                  hidden
                />
                <div className="news-upload__dropzone-content">
                  <UploadIcon size={24} />
                  <p>Clique para selecionar ou arraste arquivos aqui</p>
                  <span>Máximo 10 arquivos</span>
                </div>
              </div>
            </div>

            {selectedFiles.length > 0 && (
              <div className="news-upload__selected-files">
                <label>Arquivos selecionados ({selectedFiles.length})</label>
                <div className="news-upload__files-list">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="news-upload__file-item">
                      <div className="news-upload__file-info">
                        {getFileIcon(file)}
                        <span className="news-upload__file-name">{file.name}</span>
                        <span className="news-upload__file-size">
                          {(file.size / 1024).toFixed(1)} KB
                        </span>
                      </div>
                      <button
                        className="news-upload__remove-file"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(index);
                        }}
                      >
                        <XIcon size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {isUploading && uploadProgress > 0 && (
              <div className="news-upload__progress">
                <div
                  className="news-upload__progress-bar"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
                <span>{uploadProgress}%</span>
              </div>
            )}

            <div className="news-upload__modal-actions">
              <Button
                onClick={closeModal}
                className="news-upload__cancel-button"
              >
                Cancelar
              </Button>
              <Button
                theme="primary"
                disabled={isUploading || selectedFiles.length === 0 || !title}
                onClick={handleSubmit}
              >
                {isUploading ? (
                  <LoadingButtons />
                ) : (
                  "Fazer upload"
                )}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default NewsUploadFiles
