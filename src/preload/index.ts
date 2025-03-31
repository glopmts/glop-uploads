import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  fetchData: () => ipcRenderer.invoke("fetch-data"),

  selectDownloadFolder: () => ipcRenderer.invoke("select-download-folder"),

  downloadFile: (url: string, filename: string, id: string) =>
    ipcRenderer.invoke("download-file", url, filename, id),

  downloadChunked: (
    url: string,
    filename: string,
    id: string,
    chunkSize = 5242880
  ) => ipcRenderer.invoke("download-chunked", url, filename, id, chunkSize),

  onDownloadProgress: (
    callback: (data: { id: string; progress: number }) => void
  ) => {
    ipcRenderer.on("download-progress", (_, data) => callback(data));
    return () => ipcRenderer.removeAllListeners("download-progress");
  },

  startOptimizedDownload: (url: string, filename: string, folder: string) => {
    try {
      new URL(url);
      return ipcRenderer.send("start-optimized-download", {
        url,
        filename,
        folder,
      });
    } catch {
      throw new Error(`URL inválida: ${url}`);
    }
  },

  onOptimizedDownloadProgress: (
    callback: (data: {
      filename: string;
      progress: number;
      speed: number;
    }) => void
  ) => {
    const listener = (
      _event: Electron.IpcRendererEvent,
      data: { filename: string; progress: number; speed: number }
    ) => callback(data);
    ipcRenderer.on("optimized-download-progress", listener);
    return () => {
      ipcRenderer.removeListener("optimized-download-progress", listener);
    };
  },

  cancelDownload: (id: string) => ipcRenderer.send("cancel-download", id),

  sendNotification: (title: string, body: string) =>
    ipcRenderer.send("send-notification", { title, body }),
});

contextBridge.exposeInMainWorld("electron", {
  startDrag: (files: string[]) => {
    ipcRenderer.send("ondragstart", files);
  },
  onFileDropped: (callback: (event: unknown, files: string[]) => void) => {
    ipcRenderer.on("file-dropped", callback);
    return () => {
      ipcRenderer.removeListener("file-dropped", callback);
    };
  },
});
