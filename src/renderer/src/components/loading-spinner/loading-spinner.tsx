import { useState } from "react"
import styles from "./loading-spinner.module.scss"

export interface LoadingSpinnerProps {
  size?: "small" | "medium" | "large"
  color?: string
  thickness?: number
  speed?: "slow" | "normal" | "fast"
  text?: string
}

export function LoadingSpinner({ size = "medium", color, thickness = 4, speed = "normal", text }: LoadingSpinnerProps) {
  const [customColor, setCustomColor] = useState(color || "#0070f3")
  const [customThickness, setCustomThickness] = useState(thickness)
  const [customSize, setCustomSize] = useState(size)
  const [customSpeed, setCustomSpeed] = useState(speed)
  const [customText, setCustomText] = useState(text || "Loading...")
  const [isEditing, setIsEditing] = useState(false)

  const spinnerClasses = `${styles.spinner} ${styles[customSize]} ${styles[customSpeed]}`

  const spinnerStyle = {
    borderColor: `${customColor}20`,
    borderTopColor: customColor,
    borderWidth: `${customThickness}px`,
  }

  return (
    <div className={styles.container}>
      <div className={styles.spinnerWrapper}>
        <div className={spinnerClasses} style={spinnerStyle} />
        {customText && <p className={styles.text}>{customText}</p>}
      </div>
    </div>
  )
}

