import { electronApp, is, optimizer } from "@electron-toolkit/utils";
import axios from "axios";
import {
  app,
  BrowserWindow,
  dialog,
  ipcMain,
  Menu,
  Notification,
  session,
  shell,
  Tray,
} from "electron";
import log from "electron-log";
import { autoUpdater } from "electron-updater";
import * as fs from "fs";
import * as https from "https";
import path, { join } from "path";
import { OptimizedDownloader } from "./optimized-downloader";

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let optimizedDownloader: OptimizedDownloader;

const iconPath = join(__dirname, "../../resources/icon.png");

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    show: false,
    autoHideMenuBar: true,
    icon: iconPath,
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      sandbox: false,
      webSecurity: true,
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  optimizedDownloader = new OptimizedDownloader();
  optimizedDownloader.setMainWindow(mainWindow);

  mainWindow.loadURL("http://localhost:5173/");

  mainWindow.webContents.once("did-finish-load", () => {
    if (!is.dev) {
      autoUpdater.checkForUpdates().catch((error) => {
        log.error("Erro ao verificar atualizações:", error);
      });

      setInterval(
        () => {
          autoUpdater.checkForUpdates().catch((error) => {
            log.error("Erro ao verificar atualizações:", error);
          });
        },
        4 * 60 * 60 * 1000
      );
    }
  });

  autoUpdater.on("update-available", ({ version, releaseNotes }) => {
    log.info("Update available:", version);

    dialog
      .showMessageBox({
        type: "info",
        title: "Atualização Disponível",
        message: `Uma nova versão (${version}) está disponível. Deseja baixar agora?`,
        detail: typeof releaseNotes === "string" ? releaseNotes : undefined,
        buttons: ["Baixar", "Mais tarde"],
        defaultId: 0,
        cancelId: 1,
      })
      .then((result) => {
        if (result.response === 0) {
          autoUpdater.downloadUpdate();
        }
      });
  });

  autoUpdater.on("error", (error) => {
    log.error("Erro no auto updater:", error);

    dialog.showMessageBox({
      type: "error",
      title: "Erro na Atualização",
      message: "Ocorreu um erro ao verificar ou baixar atualizações",
      detail: error.message,
    });
  });

  autoUpdater.on("download-progress", (progress) => {
    mainWindow?.webContents.send("update-progress", progress);
  });

  autoUpdater.on("update-downloaded", () => {
    dialog
      .showMessageBox({
        type: "info",
        title: "Atualização pronta",
        message: "A nova versão foi baixada. Deseja reiniciar agora?",
        buttons: ["Sim", "Mais tarde"],
      })
      .then((result) => {
        if (result.response === 0) {
          autoUpdater.quitAndInstall();
        }
      });
  });

  mainWindow.once("ready-to-show", () => {
    mainWindow?.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: "deny" };
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
  }
}

//janela de segundo plano Wind

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    }
  });

  app.whenReady().then(() => {
    createWindow();
    createTray();
  });

  app.on("window-all-closed", () => {
    if (mainWindow) {
      mainWindow.hide();
    }
  });

  app.on("activate", () => {
    if (mainWindow) {
      mainWindow.show();
    } else {
      createWindow();
    }
  });
}

function createTray() {
  tray = new Tray(iconPath);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Mostrar",
      toolTip: "Abrir app GlopUploads",
      click: () => {
        if (mainWindow) {
          mainWindow.show();
        } else {
          createWindow();
        }
      },
    },
    {
      label: "Sair",
      click: () => {
        app.quit();
      },
    },
  ]);

  tray.setToolTip("GlopUploads");
  tray.setContextMenu(contextMenu);

  tray.on("click", () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
      }
    } else {
      createWindow();
    }
  });
}

//ouvintes de eventos

ipcMain.handle("fetch-data", async () => {
  try {
    const response = await axios.get("http://localhost:5001/api");
    return response.data;
  } catch (error) {
    log.error("Erro na requisição:", error);
    return { error: "Falha ao buscar os dados" };
  }
});

ipcMain.on("send-notification", (_event, { title, body }) => {
  try {
    const notification = new Notification({
      title,
      body,
    });
    notification.show();
    console.log("Notificação enviada com sucesso");
  } catch (error) {
    console.error("Erro ao mostrar notificação:", error);
  }
});

ipcMain.handle("check-for-updates", async () => {
  try {
    const result = await autoUpdater.checkForUpdates();
    return {
      success: true,
      version: result?.updateInfo.version,
    };
  } catch (error) {
    log.error("Erro ao verificar atualizações:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
});

//downloads files (option 1)
const activeDownloads = new Map<string, { cancel: () => void }>();

const downloadFile = async (url: string, filename: string, id: string) => {
  try {
    const destPath = path.join(app.getPath("downloads"), filename);
    const writer = fs.createWriteStream(destPath);

    // Configurações otimizadas para o Axios
    const response = await axios({
      url,
      method: "GET",
      responseType: "stream",
      cancelToken: new axios.CancelToken((c) => {
        activeDownloads.set(id, { cancel: c });
      }),
      timeout: 30000,
      httpsAgent: new https.Agent({
        keepAlive: true,
        maxSockets: 6,
        rejectUnauthorized: false,
      }),
      headers: {
        Connection: "keep-alive",
        "Accept-Encoding": "gzip, deflate, br",
      },
      maxContentLength: Number.POSITIVE_INFINITY,
      maxBodyLength: Number.POSITIVE_INFINITY,
    });

    const totalLength =
      Number.parseInt(response.headers["content-length"]) || 0;
    let downloaded = 0;
    let lastProgressUpdate = 0;
    const updateInterval = 100;

    response.data.on("data", (chunk: Buffer) => {
      downloaded += chunk.length;
      const now = Date.now();
      if (
        now - lastProgressUpdate > updateInterval ||
        downloaded === totalLength
      ) {
        const progress = totalLength > 0 ? downloaded / totalLength : 0;
        mainWindow?.webContents.send("download-progress", { id, progress });
        lastProgressUpdate = now;
      }
    });

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on("finish", () => {
        activeDownloads.delete(id);
        mainWindow?.webContents.send("download-progress", { id, progress: 1 });
        resolve(destPath);
      });

      writer.on("error", (err) => {
        activeDownloads.delete(id);
        reject(err);
      });
    });
  } catch (error) {
    activeDownloads.delete(id);
    throw error;
  }
};

ipcMain.on("start-download", async (_event, { url, folder }) => {
  const win = BrowserWindow.getAllWindows()[0];
  if (!win) return;

  session.defaultSession.allowNTLMCredentialsForDomains("*");

  session.defaultSession.downloadURL(url);

  session.defaultSession.once("will-download", (_event, item) => {
    const fileName = item.getFilename();
    const savePath = join(folder, fileName);

    item.setSavePath(savePath);

    item.on("updated", (_, state) => {
      if (state === "progressing") {
        if (item.isPaused()) {
          console.log("Download pausado");
        } else {
          console.log(`Progresso: ${item.getReceivedBytes()} bytes baixados`);
        }
      }
    });

    item.once("done", (_, state) => {
      if (state === "completed") {
        console.log(`Download concluído em: ${savePath}`);
      } else {
        console.log("Download falhou");
      }
    });
  });
});

ipcMain.handle("download-file", (_event, url, filename, id) => {
  return downloadFile(url, filename, id);
});

ipcMain.on("cancel-download", (_event, id) => {
  if (activeDownloads.has(id)) {
    activeDownloads.get(id)?.cancel();
    activeDownloads.delete(id);
    mainWindow?.webContents.send("download-progress", { id, progress: 0 });
  }
});

ipcMain.handle("select-download-folder", async () => {
  const result = await dialog.showOpenDialog({
    properties: ["openDirectory"],
  });

  return result.canceled ? null : result.filePaths[0];
});

// Evento global de erro
process.on("uncaughtException", (error) => {
  log.error("Erro não tratado:", error);
});

process.on("unhandledRejection", (reason, promise) => {
  log.warn("Promessa rejeitada sem tratamento:", promise, "Razão:", reason);
});

// Inicialização do app
app.whenReady().then(() => {
  electronApp.setAppUserModelId("com.electron");

  app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  ipcMain.on("ping", () => log.info("pong"));

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
