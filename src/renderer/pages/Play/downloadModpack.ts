import { toast } from 'react-toastify';

const downloadModpack = async (): Promise<boolean> => {
    let result = true;

    window.electron.ipcRenderer.removeAllListeners('download-fabric-reply');
    window.electron.ipcRenderer.removeAllListeners('download-modpack-reply');
    window.electron.ipcRenderer.removeAllListeners('extract-modpack-reply');
    window.electron.ipcRenderer.removeAllListeners('install-modpack-reply');

    window.electron.ipcRenderer.sendMessage('install-modpack');

    await toast.promise(
        new Promise((resolve, reject) => {
            window.electron.ipcRenderer.on('download-modpack-reply', (_, state) => {
                if (state === 'success') {
                    resolve(null);
                } else if (state === 'error') {
                    reject();
                    result = false;
                }
            });
        }),
        {
            pending: 'Téléchargement du modpack...',
            success: 'Modpack téléchargé',
            error: 'Échec du téléchargement du modpack',
        }
    );

    await toast.promise(
        new Promise((resolve, reject) => {
            window.electron.ipcRenderer.on('extract-modpack-reply', (_, state) => {
                if (state === 'success') {
                    resolve(null);
                } else if (state === 'error') {
                    reject();
                    result = false;
                }
            });
        }),
        {
            pending: 'Extraction du modpack...',
            success: 'Modpack extrait',
            error: "Échec de l'extraction du modpack",
        }
    );

    await toast.promise(
        new Promise((resolve, reject) => {
            window.electron.ipcRenderer.on('download-fabric-reply', (_, state) => {
                if (state === 'success') {
                    resolve(null);
                } else if (state === 'error') {
                    reject();
                    result = false;
                }
            });
        }),
        {
            pending: 'Téléchargement et installation de fabric...',
            success: 'Fabric téléchargé et installé',
            error: "Échec du téléchargement et de l'installation de fabric",
        }
    );

    await toast.promise(
        new Promise((resolve, reject) => {
            window.electron.ipcRenderer.on('install-modpack-reply', (_, state) => {
                if (state === 'success') {
                    resolve(null);
                } else if (state === 'error') {
                    reject();
                    result = false;
                }
            });
        }),
        {
            pending: 'Installation du modpack...',
            success: 'Modpack installé',
            error: "Échec de l'installation du modpack",
        }
    );

    return result;
};

export default downloadModpack;
