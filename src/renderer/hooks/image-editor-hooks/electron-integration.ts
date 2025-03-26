interface ElectronAPI {
  saveImage: (imageData: string) => Promise<{ success: boolean; filePath?: string; message?: string }>
}

export const isElectron = () => {
  return window && window.electron
}

export const getElectronAPI = (): ElectronAPI | null => {
  if (isElectron()) {
    return (window as any).electron as ElectronAPI
  }
  return null
}

export const saveImageWithElectron = async (imageData: string): Promise<boolean> => {
  const api = getElectronAPI()
  if (!api) return false

  try {
    const result = await api.saveImage(imageData)
    return result.success
  } catch (error) {
    console.error("Error saving with Electron:", error)
    return false
  }
}

