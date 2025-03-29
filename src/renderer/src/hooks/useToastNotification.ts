import { useToast } from "../context/toast-context";

export function useToastNotification() {
  const { showToast } = useToast();

  const success = (title: string, message?: string, duration?: number) => {
    showToast({
      title,
      message,
      type: "success",
      duration,
    });
  };

  const error = (title: string, message?: string, duration?: number) => {
    showToast({
      title,
      message,
      type: "error",
      duration,
    });
  };

  const warning = (title: string, message?: string, duration?: number) => {
    showToast({
      title,
      message,
      type: "warning",
      duration,
    });
  };

  return {
    success,
    error,
    warning,
  };
}
