import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  fetchData: () => ipcRenderer.invoke("fetch-data"),

  selectDownloadFolder: () => ipcRenderer.invoke("select-download-folder"),

  downloadFile: (url: string, filename: string) =>
    ipcRenderer.invoke("download-file", url, filename),

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
