import { type BrowserWindow, ipcMain } from "electron";
import log from "electron-log";
import * as fs from "fs";
import * as http from "http";
import * as https from "https";
import * as path from "path";
import { URL } from "url";

export class OptimizedDownloader {
  private activeDownloads: Map<
    string,
    {
      cancel: () => void;
      chunks: { start: number; end: number; completed: boolean }[];
      totalSize: number;
      downloadedSize: number;
      speed: number;
      lastUpdateTime: number;
      lastDownloadedSize: number;
    }
  >;
  private mainWindow: BrowserWindow | null = null;
  private readonly CHUNK_SIZE = 1024 * 1024 * 5; // 5MB por chunk
  private readonly MAX_CONCURRENT_CHUNKS = 3; // Número máximo de chunks simultâneos
  private readonly UPDATE_INTERVAL = 200; // Intervalo de atualização em ms

  constructor() {
    this.activeDownloads = new Map();
    this.setupListeners();
  }

  setMainWindow(window: BrowserWindow) {
    this.mainWindow = window;
  }

  private setupListeners() {
    ipcMain.on(
      "start-optimized-download",
      async (_event, { url, filename, folder }) => {
        try {
          await this.startDownload(url, filename, folder);
        } catch (error) {
          log.error("Erro ao iniciar download otimizado:", error);
          this.mainWindow?.webContents.send("download-error", {
            filename,
            error: error instanceof Error ? error.message : "Erro desconhecido",
          });
        }
      }
    );

    ipcMain.on("cancel-optimized-download", (_event, filename) => {
      this.cancelDownload(filename);
    });
  }

  private isValidUrl(urlString: string): boolean {
    try {
      new URL(urlString);
      return true;
    } catch {
      return false;
    }
  }

  private async startDownload(url: string, filename: string, folder: string) {
    // Validar URL antes de prosseguir
    if (!this.isValidUrl(url)) {
      throw new Error(`URL inválida: ${url}`);
    }

    // Obter o tamanho total do arquivo
    const totalSize = await this.getFileSize(url);
    if (totalSize <= 0) {
      throw new Error("Não foi possível determinar o tamanho do arquivo");
    }

    const filePath = path.join(folder, filename);

    // Criar arquivo vazio com o tamanho total
    await fs.promises.writeFile(filePath, Buffer.alloc(0));

    // Calcular chunks
    const chunks: { start: number; end: number; completed: boolean }[] = [];
    let start = 0;

    while (start < totalSize) {
      const end = Math.min(start + this.CHUNK_SIZE - 1, totalSize - 1);
      chunks.push({ start, end, completed: false });
      start = end + 1;
    }

    // Configurar o cancelamento
    const cancelFn = () => {
      this.cancelDownload(filename);
    };

    // Registrar o download
    this.activeDownloads.set(filename, {
      cancel: cancelFn,
      chunks,
      totalSize,
      downloadedSize: 0,
      speed: 0,
      lastUpdateTime: Date.now(),
      lastDownloadedSize: 0,
    });

    // Iniciar o download dos chunks
    this.downloadChunks(url, filePath, filename);
  }

  private async downloadChunks(
    url: string,
    filePath: string,
    filename: string
  ) {
    const downloadInfo = this.activeDownloads.get(filename);
    if (!downloadInfo) return;

    const { chunks } = downloadInfo;

    // Encontrar chunks não concluídos
    const pendingChunks = chunks.filter((chunk) => !chunk.completed);

    if (pendingChunks.length === 0) {
      // Download concluído
      this.activeDownloads.delete(filename);
      this.mainWindow?.webContents.send("optimized-download-progress", {
        filename,
        progress: 1,
        speed: 0,
        completed: true,
      });
      return;
    }

    // Selecionar os próximos chunks para download
    const chunksToDownload = pendingChunks.slice(0, this.MAX_CONCURRENT_CHUNKS);

    // Iniciar o download de cada chunk
    const promises = chunksToDownload.map((chunk) =>
      this.downloadChunk(url, filePath, chunk, filename)
    );

    // Aguardar a conclusão de pelo menos um chunk
    await Promise.race(promises);

    if (this.activeDownloads.has(filename)) {
      this.downloadChunks(url, filePath, filename);
    }
  }

  private async downloadChunk(
    url: string,
    filePath: string,
    chunk: { start: number; end: number; completed: boolean },
    filename: string
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const downloadInfo = this.activeDownloads.get(filename);
      if (!downloadInfo) {
        reject(new Error("Download cancelado"));
        return;
      }

      const parsedUrl = new URL(url);
      const options = {
        hostname: parsedUrl.hostname,
        path: parsedUrl.pathname + parsedUrl.search,
        method: "GET",
        headers: {
          Range: `bytes=${chunk.start}-${chunk.end}`,
          Connection: "keep-alive",
        },
      };

      const protocol = parsedUrl.protocol === "https:" ? https : http;

      const req = protocol.request(options, (res) => {
        if (res.statusCode !== 206) {
          reject(new Error(`Resposta inesperada: ${res.statusCode}`));
          return;
        }

        const fileStream = fs.createWriteStream(filePath, {
          flags: "r+",
          start: chunk.start,
        });

        res.on("data", (data) => {
          if (!this.activeDownloads.has(filename)) {
            req.destroy();
            fileStream.close();
            reject(new Error("Download cancelado"));
            return;
          }

          const downloadInfo = this.activeDownloads.get(filename)!;
          downloadInfo.downloadedSize += data.length;

          // Atualizar velocidade e progresso periodicamente
          const now = Date.now();
          if (now - downloadInfo.lastUpdateTime > this.UPDATE_INTERVAL) {
            const timeDiff = (now - downloadInfo.lastUpdateTime) / 1000; // em segundos
            const byteDiff =
              downloadInfo.downloadedSize - downloadInfo.lastDownloadedSize;
            downloadInfo.speed = byteDiff / timeDiff; // bytes por segundo
            downloadInfo.lastUpdateTime = now;
            downloadInfo.lastDownloadedSize = downloadInfo.downloadedSize;

            const progress =
              downloadInfo.downloadedSize / downloadInfo.totalSize;

            this.mainWindow?.webContents.send("optimized-download-progress", {
              filename,
              progress,
              speed: downloadInfo.speed,
              completed: false,
            });
          }
        });

        res.on("end", () => {
          fileStream.close(() => {
            if (this.activeDownloads.has(filename)) {
              chunk.completed = true;
              resolve();
            } else {
              reject(new Error("Download cancelado"));
            }
          });
        });

        res.on("error", (err) => {
          fileStream.close();
          reject(err);
        });

        fileStream.on("error", (err) => {
          req.destroy();
          reject(err);
        });

        res.pipe(fileStream);
      });

      req.on("error", (err) => {
        reject(err);
      });

      req.end();
    });
  }

  private async getFileSize(url: string): Promise<number> {
    if (!this.isValidUrl(url)) {
      throw new Error(`URL inválida: ${url}`);
    }

    return new Promise((resolve, reject) => {
      const parsedUrl = new URL(url);
      const options = {
        hostname: parsedUrl.hostname,
        path: parsedUrl.pathname + parsedUrl.search,
        method: "HEAD",
      };

      const protocol = parsedUrl.protocol === "https:" ? https : http;

      const req = protocol.request(options, (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`Resposta inesperada: ${res.statusCode}`));
          return;
        }

        const contentLength = res.headers["content-length"];
        if (!contentLength) {
          reject(new Error("Não foi possível determinar o tamanho do arquivo"));
          return;
        }

        resolve(Number.parseInt(contentLength, 10));
      });

      req.on("error", (err) => {
        reject(err);
      });

      req.end();
    });
  }

  private cancelDownload(filename: string) {
    const downloadInfo = this.activeDownloads.get(filename);
    if (downloadInfo) {
      this.activeDownloads.delete(filename);
      this.mainWindow?.webContents.send("optimized-download-progress", {
        filename,
        progress: 0,
        speed: 0,
        canceled: true,
      });
    }
  }
}
