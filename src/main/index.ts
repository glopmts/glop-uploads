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

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;

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

  mainWindow.loadURL("http://localhost:3000");

  mainWindow.webContents.once("did-finish-load", () => {
    autoUpdater.checkForUpdatesAndNotify();
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

  app.setUserTasks([
    {
      program: process.execPath,
      arguments: "--new-upload",
      iconPath: process.execPath,
      iconIndex: 0,
      title: "Novo upload",
      description: "Criar um novo upload",
    },
  ]);

  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
  }
}

//janela de segundo plano Wind
function createTray() {
  tray = new Tray(iconPath);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Mostrar",
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

  tray.setToolTip("Meu App Electron");
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

autoUpdater.on("update-available", () => {
  dialog.showMessageBox({
    type: "info",
    title: "Atualização disponível",
    message: "Uma nova versão está disponível. Baixando...",
  });
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

//ouvintes de eventos

ipcMain.handle("fetch-data", async () => {
  try {
    const response = await axios.get(
      "https://backend-uploads-tbfc.vercel.app/api"
    );
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

//downloads files
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
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    const totalLength = parseInt(response.headers["content-length"]) || 0;
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

const downloadChunked = async (
  url: string,
  filename: string,
  id: string,
  chunkSize = 5242880
) => {
  try {
    const destPath = path.join(app.getPath("downloads"), filename);
    const writer = fs.createWriteStream(destPath);

    const headResponse = await axios.head(url);
    const totalLength = parseInt(headResponse.headers["content-length"]) || 0;

    if (totalLength === 0) {
      throw new Error("Não foi possível determinar o tamanho do arquivo");
    }

    const chunks = Math.ceil(totalLength / chunkSize);
    let downloaded = 0;

    for (let i = 0; i < chunks; i++) {
      if (activeDownloads.has(id)) {
        const start = i * chunkSize;
        const end = Math.min((i + 1) * chunkSize - 1, totalLength - 1);

        const response = await axios({
          url,
          method: "GET",
          responseType: "stream",
          headers: {
            Range: `bytes=${start}-${end}`,
            Connection: "keep-alive",
          },
          cancelToken: new axios.CancelToken((c) => {
            activeDownloads.set(id, { cancel: c });
          }),
        });

        await new Promise((resolve, reject) => {
          response.data.on("data", (chunk: Buffer) => {
            downloaded += chunk.length;
            const progress = downloaded / totalLength;
            mainWindow?.webContents.send("download-progress", { id, progress });
          });

          response.data.pipe(writer, { end: false });

          response.data.on("end", resolve);
          response.data.on("error", reject);
        });
      } else {
        throw new Error("Download cancelado");
      }
    }

    writer.end();
    activeDownloads.delete(id);
    mainWindow?.webContents.send("download-progress", { id, progress: 1 });
    return destPath;
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

ipcMain.handle("download-chunked", (_event, url, filename, id, chunkSize) => {
  return downloadChunked(url, filename, id, chunkSize);
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

// Sair do app quando todas as janelas forem fechadas (exceto no macOS)
app.on("window-all-closed", () => {
  if (mainWindow) {
    mainWindow.hide(); // Apenas oculta a janela
  }
});

app.whenReady().then(() => {
  createTray();
});
