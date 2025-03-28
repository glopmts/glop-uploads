import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  fetchData: () => ipcRenderer.invoke("fetch-data"),
});
