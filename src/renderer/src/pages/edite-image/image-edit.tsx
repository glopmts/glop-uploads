import { ArrowLeftIcon } from "@primer/octicons-react"
import { type FC } from "react"
import { Link } from "react-router-dom"
import CustomStylesImages from "../../../hooks/image-editor-hooks/customizer-image-styles"
import "./image-editor.scss"


const EnhancedImageEditor: FC = () => {
  const {
    adjustmentOptions,
    canvasRef,
    filters,
    handleAdjustmentChange,
    handleFileChange,
    handleSelectClick,
    isProcessing,
    resetFilters,
    saveImage,
    imagePreview,
    getFilterString,
    selectedFilter,
    setSelectedFilter,
    adjustments,
    fileInputRef
  } = CustomStylesImages()

  return (
    <section className="image-editor">
      <div className="image-editor__link-header">
        <Link to="/" className="image-editor__link">
          <ArrowLeftIcon className="image-editor__icon" size={20} />
        </Link>
        <h2 className="image-editor__title">Image Editor</h2>
      </div>

      <div className="image-editor__container">
        {imagePreview ? (
          <div className="image-editor__workspace">
            <div className="image-editor__preview-container">
              <img
                src={imagePreview || "/placeholder.svg"}
                className="image-editor__preview"
                style={{ filter: getFilterString() }}
                alt="Preview"
              />
            </div>

            <div className="image-editor__controls">
              <div className="image-editor__filters">
                <h3>Filters</h3>
                <div className="image-editor__filter-options">
                  {filters.map((filter) => (
                    <button
                      key={filter.value}
                      className={`image-editor__filter-btn ${selectedFilter === filter.value ? "active" : ""}`}
                      onClick={() => setSelectedFilter(filter.value)}
                    >
                      {filter.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="image-editor__adjustments">
                <h3>Adjustments</h3>
                {adjustmentOptions.map((option) => (
                  <div className="image-editor__slider-group" key={option.property}>
                    <label>
                      {option.name}: {adjustments[option.property]}
                      {option.unit}
                    </label>
                    <input
                      type="range"
                      min={option.min}
                      max={option.max}
                      value={adjustments[option.property]}
                      onChange={(e) => handleAdjustmentChange(option.property, Number.parseInt(e.target.value))}
                      className="image-editor__slider"
                    />
                  </div>
                ))}
              </div>

              <div className="image-editor__actions">
                <button className="image-editor__btn image-editor__btn--secondary" onClick={resetFilters}>
                  Reset Filters
                </button>
                <button
                  className="image-editor__btn image-editor__btn--primary"
                  onClick={saveImage}
                  disabled={isProcessing}
                >
                  {isProcessing ? "Processing..." : "Save Image"}
                </button>
                <button className="image-editor__btn image-editor__btn--secondary" onClick={handleSelectClick}>
                  Change Image
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="image-editor__select-file" onClick={handleSelectClick}>
            <span className="image-editor__message">Select an Image</span>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="image-editor__file-input"
            />
          </div>
        )}
      </div>

      <canvas ref={canvasRef} style={{ display: "none" }} />
    </section>
  )
}

export default EnhancedImageEditor


