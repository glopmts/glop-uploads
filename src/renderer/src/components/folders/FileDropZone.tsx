import type React from "react"
import { useCallback } from "react"
import { useDrop } from "react-dnd"
import { NativeTypes } from "react-dnd-html5-backend"

interface FileDropZoneProps {
  onFileDrop: (files: File[]) => void
  children: React.ReactNode
  className?: string
}

const FileDropZone: React.FC<FileDropZoneProps> = ({ onFileDrop, children, className = "" }) => {
  const handleFileDrop = useCallback(
    (item: { files: FileList }) => {
      if (item.files) {
        const filesArray = Array.from(item.files)
        onFileDrop(filesArray)
      }
    },
    [onFileDrop],
  )

  const [{ isOver }, drop] = useDrop({
    accept: [NativeTypes.FILE],
    drop: handleFileDrop,
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  })

  return (
    <div ref={drop} className={`file-drop-zone ${className} ${isOver ? "file-drop-zone--active" : ""}`}>
      {children}
    </div>
  )
}

export default FileDropZone

