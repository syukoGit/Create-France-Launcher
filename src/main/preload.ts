import { IpcRenderer, IpcRendererEvent, contextBridge, ipcRenderer } from 'electron';

type StoreKeys = 'account-token' | 'account' | 'launch-resolution';

type IpcMainChannels = 'ms-account-login' | 'account-logout' | 'ms-account-refresh' | 'play-minecraft' | 'install-modpack' | 'is-modpack-installed';

type IpcRendererChannels = 'navigate' | 'play-minecraft-reply' | IpcRendererChannelsAccount | IpcRendererChannelsModpack;

type IpcRendererChannelsAccount = 'logout-reply' | 'login-reply' | 'ms-account-refresh-reply';
type IpcRendererChannelsModpack =
    | 'download-fabric-reply'
    | 'download-modpack-reply'
    | 'install-modpack-reply'
    | 'extract-modpack-reply'
    | 'is-modpack-installed-reply';

type IpcRendererChannelsInvoke = 'get-minecraft-instance';

const electronHandler = {
    ipcRenderer: {
        sendMessage(channel: IpcMainChannels, ...args: unknown[]) {
            ipcRenderer.send(channel, ...args);
        },
        invoke(channel: IpcRendererChannelsInvoke, ...args: unknown[]): Promise<any> {
            return ipcRenderer.invoke(channel, ...args);
        },
        on(channel: IpcRendererChannels, listener: (event: IpcRendererEvent, ...args: unknown[]) => void) {
            ipcRenderer.on(channel, listener);
        },
        once(channel: IpcRendererChannels, listener: (event: IpcRendererEvent, ...args: unknown[]) => void) {
            ipcRenderer.once(channel, listener);
        },
        removeAllListeners(channel: IpcRendererChannels) {
            ipcRenderer.removeAllListeners(channel);
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
