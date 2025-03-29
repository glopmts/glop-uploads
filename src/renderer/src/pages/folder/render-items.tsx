import { CardItem } from "@renderer/types/interfaces"

export const renderItemPreview = (item: CardItem) => {
  if (item.type === "folder") {
    return (
      <div className="item-preview-container folder">
        <div className="folder-preview">
          <i className="fa fa-folder" />
        </div>
        <div className="item-title">{item.title}</div>
      </div>
    )
  }
  switch (item.type) {
    case "image":
      return (
        <div className="item-preview-container">
          <img src={item.thumbnail || item.path} alt={item.title} className="item-preview" />
          <div className="item-title">{item.title}</div>
        </div>
      )
    case "video":
      return (
        <div className="item-preview-container">
          <div className="video-preview">
            <img
              src={item.thumbnail || "/placeholder-video.jpg"}
              alt={`Thumbnail for ${item.title}`}
              className="item-preview"
            />
            <div className="play-icon">▶</div>
          </div>
          <div className="item-title">{item.title}</div>
        </div>
      )
    case "document":
      return (
        <div className="item-preview-container">
          <div className="document-preview">
            <div className="document-icon">📄</div>
          </div>
          <div className="item-title">{item.title}</div>
        </div>
      )
    case "audio":
      return (
        <div className="item-preview-container">
          <div className="audio-preview">
            <div className="audio-icon">🎵</div>
          </div>
          <div className="item-title">{item.title}</div>
        </div>
      )
    default:
      return (
        <div className="item-preview-container">
          <div className="file-preview">
            <div className="file-icon">📄</div>
          </div>
          <div className="item-title">{item.title}</div>
        </div>
      )
  }
}
