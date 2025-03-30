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

  ipcMain.handle("download-file", async (_event, url, filename) => {
    await downloadFile(url, filename);
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

//downloads files

const downloadFile = async (url: string, filename: string) => {
  try {
    const destPath = path.join(app.getPath("downloads"), filename);

    const writer = fs.createWriteStream(destPath);

    const response = await axios({
      url,
      method: "GET",
      responseType: "stream",
    });

    const totalLength = response.headers["content-length"];

    if (totalLength) {
      let downloaded = 0;

      response.data.on("data", (chunk: Buffer) => {
        downloaded += chunk.length;
        const progress = downloaded / totalLength;

        if (mainWindow) {
          mainWindow.setProgressBar(progress);
        }

        // console.log(`Progresso: ${(progress * 100).toFixed(2)}%`);
      });

      response.data.pipe(writer);
      writer.on("finish", () => {
        console.log("Download concluído!");

        if (mainWindow) {
          mainWindow.setProgressBar(0);
        }

        if (mainWindow) {
          mainWindow.webContents.send("send-notification", {
            title: "Download concluído!",
            body: "Seu download foi concluído com sucesso!",
          });
        }
      });

      writer.on("error", (err) => {
        console.error("Erro no download:", err);
        if (mainWindow) {
          mainWindow.setProgressBar(0);
        }
      });
    }
  } catch (error) {
    console.error("Erro ao iniciar o download:", error);
    if (mainWindow) {
      mainWindow.setProgressBar(0);
    }
  }
};

ipcMain.handle("select-download-folder", async () => {
  const result = await dialog.showOpenDialog({
    properties: ["openDirectory"],
  });

  return result.canceled ? null : result.filePaths[0];
});

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
