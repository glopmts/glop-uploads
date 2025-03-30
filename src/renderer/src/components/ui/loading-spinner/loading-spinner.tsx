import styles from "./loading-spinner.module.scss";

export interface LoadingSpinnerProps {
  size?: "small" | "medium" | "large";
  color?: string;
  thickness?: number;
  speed?: "slow" | "normal" | "fast";
  text?: string;
}

export function LoadingSpinner({
  size = "medium",
  color = "#0070f3",
  thickness = 4,
  speed = "normal",
  text = "Loading...",
}: LoadingSpinnerProps) {
  const spinnerClasses = `${styles.spinner} ${styles[size]} ${styles[speed]}`;

  const spinnerStyle = {
    borderColor: `${color}20`,
    borderTopColor: color,
    borderWidth: `${thickness}px`,
  };

  return (
    <div className={styles.container}>
      <div className={styles.spinnerWrapper}>
        <div className={spinnerClasses} style={spinnerStyle} />
        {text && <p className={styles.text}>{text}</p>}
      </div>
    </div>
  );
}