import { contextBridge, ipcRenderer } from 'electron';

type IpcMainChannels = 'ms-account-login' | 'account-logout' | 'ms-account-refresh' | 'play-minecraft' | 'download-modpack';
type StoreKeys = 'account-token' | 'account';

const electronHandler = {
    ipcRenderer: {
        sendMessage(channel: IpcMainChannels, ...args: unknown[]) {
            ipcRenderer.sendSync(channel, ...args);
        },
    },

    store: {
        get(key: StoreKeys) {
            return ipcRenderer.sendSync('electron-store-get', key);
        },
        set(key: StoreKeys, ...val: any[]) {
            ipcRenderer.send('electron-store-set', key, val);
        },
        delete(key: StoreKeys) {
            ipcRenderer.send('electron-store-delete', key);
        },
    },
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;
