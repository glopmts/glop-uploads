import { create } from "zustand";

export interface DownloadItem {
  id: string;
  progress: number;
  filename: string;
  itemId: string;
  status: "downloading" | "completed" | "error" | "canceled";
  speed?: number;
}

interface DownloadStore {
  downloads: DownloadItem[];
  addDownload: (download: DownloadItem) => void;
  updateDownload: (id: string, data: Partial<DownloadItem>) => void;
  removeDownload: (id: string) => void;
  getDownloadsForItem: (itemId: string) => DownloadItem[];
}

export const useDownloadStore = create<DownloadStore>((set, get) => ({
  downloads: [],

  addDownload: (download) => {
    set((state) => ({
      downloads: [...state.downloads, download],
    }));
  },

  updateDownload: (id, data) => {
    set((state) => ({
      downloads: state.downloads.map((download) =>
        download.id === id ? { ...download, ...data } : download
      ),
    }));
  },

  removeDownload: (id) => {
    set((state) => ({
      downloads: state.downloads.filter((download) => download.id !== id),
    }));
  },

  getDownloadsForItem: (itemId) => {
    return get().downloads.filter((download) => download.itemId === itemId);
  },
}));
