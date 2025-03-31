import { ElectronAPI } from "@electron-toolkit/preload";

declare global {
  interface Window {
    electron: ElectronAPI;
    api: {
      fetchData: (
        url: string,
        options?: RequestInit
      ) => Promise<{
        data?: string;
        error?: string;
      }>;
    };
    electronAPI: {
      downloadChunked(
        path: string,
        arg1: string,
        downloadId: string,
        arg3: number
      ): unknown;

      fetchData: () => Promise<{ data: string; error?: string }>;

      selectDownloadFolder: () => Promise<string | null>;

      downloadFile: (
        url: string,
        filename: string,
        id: string
      ) => Promise<void>;

      cancelDownload: (id: string) => void;

      onDownloadProgress: (
        callback: (data: { id: string; progress: number }) => void
      ) => () => void;

      sendNotification: (title: string, body: string) => void;

      startOptimizedDownload: (
        url: string,
        filename?: string,
        folder: string
      ) => Promise<void>;

      onOptimizedDownloadProgress: (
        callback: (
          filename: string,
          progress: number,
          speed: number,
          completed: boolean,
          canceled: string
        ) => void
      ) => () => void;
    };
  }
}
