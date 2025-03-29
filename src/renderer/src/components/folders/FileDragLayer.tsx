import { FileIcon } from "@primer/octicons-react"
import type React from "react"
import { useDragLayer } from "react-dnd"

const FileDragLayer: React.FC = () => {
  const { isDragging, item, currentOffset } = useDragLayer((monitor) => ({
    item: monitor.getItem(),
    currentOffset: monitor.getSourceClientOffset(),
    isDragging: monitor.isDragging(),
  }))

  if (!isDragging || !currentOffset) {
    return null
  }

  const { x, y } = currentOffset
  const fileCount = item?.files?.length || 0

  return (
    <div
      className="file-drag-layer"
      style={{
        transform: `translate(${x}px, ${y}px)`,
      }}
    >
      <div className="file-drag-preview">
        <FileIcon size={24} />
        {fileCount > 1 && <span className="file-count">{fileCount}</span>}
      </div>
    </div>
  )
}

export default FileDragLayer

