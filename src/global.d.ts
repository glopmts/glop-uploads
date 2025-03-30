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
      selectDownloadFolder: () => Promise<string | null>;
      startDownload: (url: string) => void;
      downloadFile: (url: string, filename: string) => void;
    };
  }
}
