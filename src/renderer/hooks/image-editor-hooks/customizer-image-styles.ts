/* eslint-disable @typescript-eslint/explicit-function-return-type */

import { ChangeEvent, useRef, useState } from "react"
import { isElectron, saveImageWithElectron } from "./electron-integration"

interface FilterOption {
  name: string
  value: string
}

interface AdjustmentOption {
  name: string
  min: number
  max: number
  default: number
  unit: string
  property: string
}


export default function CustomStylesImages () {
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [selectedFilter, setSelectedFilter] = useState<string>("none")
  const [adjustments, setAdjustments] = useState<Record<string, number>>({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0,
    hueRotate: 0,
  })
  const [isProcessing, setIsProcessing] = useState<boolean>(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const filters: FilterOption[] = [
    { name: "Normal", value: "none" },
    { name: "Grayscale", value: "grayscale(100%)" },
    { name: "Sepia", value: "sepia(100%)" },
    { name: "Invert", value: "invert(100%)" },
  ]

  const adjustmentOptions: AdjustmentOption[] = [
    { name: "Brightness", min: 0, max: 200, default: 100, unit: "%", property: "brightness" },
    { name: "Contrast", min: 0, max: 200, default: 100, unit: "%", property: "contrast" },
    { name: "Saturation", min: 0, max: 200, default: 100, unit: "%", property: "saturation" },
    { name: "Blur", min: 0, max: 10, default: 0, unit: "px", property: "blur" },
    { name: "Hue Rotate", min: 0, max: 360, default: 0, unit: "deg", property: "hueRotate" },
  ]

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0]
      setImageFile(file)

      // Create a preview URL for the selected image
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target) {
          setImagePreview(e.target.result as string)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSelectClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleAdjustmentChange = (property: string, value: number) => {
    setAdjustments((prev) => ({
      ...prev,
      [property]: value,
    }))
  }

  const resetFilters = () => {
    setSelectedFilter("none")
    setAdjustments({
      brightness: 100,
      contrast: 100,
      saturation: 100,
      blur: 0,
      hueRotate: 0,
    })
  }

  const getFilterString = () => {
    const { brightness, contrast, saturation, blur, hueRotate } = adjustments
    let filterString = selectedFilter !== "none" ? `${selectedFilter} ` : ""

    filterString += `brightness(${brightness}%) `
    filterString += `contrast(${contrast}%) `
    filterString += `saturate(${saturation}%) `

    if (blur > 0) filterString += `blur(${blur}px) `
    if (hueRotate > 0) filterString += `hue-rotate(${hueRotate}deg)`

    return filterString
  }

  const saveImage = async () => {
    if (!imagePreview) return
    setIsProcessing(true)

    try {
      // Create a canvas to apply filters
      const canvas = document.createElement("canvas")
      const img = new Image()

      img.onload = async () => {
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext("2d")

        if (ctx) {
          // Apply filters using CSS filter
          ctx.filter = getFilterString()
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

          // Get the data URL
          const dataUrl = canvas.toDataURL("image/jpeg", 0.9)

          // Save using Electron if available, otherwise fallback to browser download
          if (isElectron()) {
            const success = await saveImageWithElectron(dataUrl)
            if (!success) {
              // Fallback to browser download if Electron save fails
              downloadImage(dataUrl)
            }
          } else {
            downloadImage(dataUrl)
          }

          setIsProcessing(false)
        }
      }

      img.src = imagePreview
    } catch (error) {
      console.error("Error saving image:", error)
      setIsProcessing(false)
    }
  }

  const downloadImage = (dataUrl: string) => {
    const link = document.createElement("a")
    link.download = `edited-${imageFile?.name || "image.jpg"}`
    link.href = dataUrl
    link.click()
  }
  
  return {
    downloadImage,
    saveImage,
    resetFilters,
    handleAdjustmentChange,
    handleSelectClick,
    isProcessing,
    handleFileChange,
    adjustmentOptions,
    filters,
    canvasRef,
    imagePreview,
    getFilterString,
    selectedFilter,
    setSelectedFilter,
    adjustments,
    fileInputRef
  }
}