import { ipcRenderer } from 'electron';
import { useEffect, useState } from 'react';

export function UpdateChecker() {
  const [updateProgress, setUpdateProgress] = useState<number | null>(null);
  const [updateInfo, setUpdateInfo] = useState<{ version: string, notes: string } | null>(null);

  useEffect(() => {
    // Verificar atualizações quando o componente montar
    checkForUpdates();

    // Ouvir eventos de progresso
    ipcRenderer.on('update-progress', (_, progress) => {
      setUpdateProgress(progress.percent);
    });

    return () => {
      ipcRenderer.removeAllListeners('update-progress');
    };
  }, []);

  const checkForUpdates = async () => {
    try {
      const result = await ipcRenderer.invoke('check-for-updates');
      if (result.success) {
        setUpdateInfo({
          version: result.version,
          notes: result.releaseNotes
        });
      }
    } catch (error) {
      console.error('Erro ao verificar atualizações:', error);
    }
  };

  return (
    <div>
      {updateProgress !== null && (
        <div>
          <p>Baixando atualização: {Math.round(updateProgress)}%</p>
          <progress value={updateProgress} max="100" />
        </div>
      )}

      {updateInfo && !updateProgress && (
        <div>
          <p>Nova versão disponível: {updateInfo.version}</p>
          <button onClick={checkForUpdates}>Instalar Agora</button>
        </div>
      )}
    </div>
  );
}