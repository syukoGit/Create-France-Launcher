import { contextBridge, ipcRenderer } from 'electron';

type IpcRendererKeys = 'login' | 'logout' | 'refresh';
type StoreKeys = 'account-token' | 'account';

const electronHandler = {
    ipcRenderer: {
        sendMessage(channel: IpcRendererKeys, ...args: unknown[]) {
            ipcRenderer.send(channel, ...args);
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
