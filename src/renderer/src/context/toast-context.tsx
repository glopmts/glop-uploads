/* eslint-disable @typescript-eslint/no-explicit-any */

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { Toast, type ToastProps } from "../components/toast/toast"

type ToastOptions = Omit<ToastProps, "visible" | "onClose">

interface ToastContextType {
  showToast: (options: ToastOptions) => void
  hideToast: () => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toastProps, setToastProps] = useState<ToastProps>({
    visible: false,
    title: "",
    type: "success",
    onClose: () => setToastProps((prev) => ({ ...prev, visible: false })),
  })

  const showToast = (options: ToastOptions) => {
    setToastProps({
      ...options,
      visible: true,
      onClose: () => setToastProps((prev) => ({ ...prev, visible: false })),
    })
  }

  const hideToast = () => {
    setToastProps((prev) => ({ ...prev, visible: false }))
  }

  // Listen for toast events from Electron main process
  useEffect(() => {
    const handleElectronToast = (event: CustomEvent<ToastOptions>) => {
      showToast(event.detail)
    }

    window.addEventListener("electron-toast" as any, handleElectronToast as EventListener)

    return () => {
      window.removeEventListener("electron-toast" as any, handleElectronToast as EventListener)
    }
  }, [])

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <Toast {...toastProps} />
    </ToastContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}

