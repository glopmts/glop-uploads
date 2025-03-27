import { ElectronAPI } from '@electron-toolkit/preload';

declare global {
  interface Window {
    electron: ElectronAPI;
    api: {
      fetchData: (url: string, options?: RequestInit) => Promise<{
        data?: any;
        error?: string;
      }>;
    };
  }
}