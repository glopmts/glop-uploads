import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  fetchData: () => ipcRenderer.invoke("fetch-data"),
});

contextBridge.exposeInMainWorld("electron", {
  // File system operations
  startDrag: (files: string[]) => {
    ipcRenderer.send("ondragstart", files);
  },

  // Listen for file drop events from the main process
  onFileDropped: (callback: (event: unknown, files: string[]) => void) => {
    ipcRenderer.on("file-dropped", callback);
    return () => {
      ipcRenderer.removeListener("file-dropped", callback);
    };
  },
});
