import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("api", {
  fetchData: (url: string) => ipcRenderer.invoke("fetch-data", url),
});