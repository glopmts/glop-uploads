import { electronAPI } from "@electron-toolkit/preload";
import { contextBridge, ipcRenderer } from "electron";

// Custom APIs for renderer
const api = {
  fetchData: (url: string, options: RequestInit) => 
    ipcRenderer.invoke('fetch-data', url, options)
};

contextBridge.exposeInMainWorld('electronAuth', {
  storeAuthData: (data: { user: any; token: string; refreshToken: string }) => {
    ipcRenderer.send('store-auth-data', data);
  },
  getAuthData: async (): Promise<{ user: any; token: string; refreshToken: string } | null> => {
    return ipcRenderer.invoke('get-auth-data');
  },
  clearAuthData: () => {
    ipcRenderer.send('clear-auth-data');
  },
});

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld("electron", electronAPI);
    contextBridge.exposeInMainWorld("api", api);
  } catch (error) {
    console.error(error);
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI;
  // @ts-ignore (define in dts)
  window.api = api;
}