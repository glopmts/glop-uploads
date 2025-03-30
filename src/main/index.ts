import { electronApp, is, optimizer } from "@electron-toolkit/utils";
import axios from "axios";
import { app, BrowserWindow, dialog, ipcMain, shell } from "electron";
import log from "electron-log";
import { autoUpdater } from "electron-updater";
import { join } from "path";

let mainWindow: BrowserWindow | null = null;
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

ipcMain.handle("fetch-data", async () => {
  try {
    const response = await axios.get("http://localhost:5001/api");
    return response.data;
  } catch (error) {
    log.error("Erro na requisição:", error);
    return { error: "Falha ao buscar os dados" };
  }
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
  if (process.platform !== "darwin") {
    app.quit();
  }
});
