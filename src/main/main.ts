import path from 'path';
import { app, BrowserWindow, shell, ipcMain, dialog } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
import { Auth } from 'msmc';
import { isIUser } from '../types/IUser';
import Store from 'electron-store';
import { isMsAuthToken } from '../types/MsAuthToken';
import { MSAuthToken } from 'msmc/types/auth/auth';
import { IUser } from 'minecraft-launcher-core';

class AppUpdater {
    constructor() {
        log.transports.file.level = 'info';
        autoUpdater.logger = log;
        autoUpdater.checkForUpdatesAndNotify();
    }
}

let mainWindow: BrowserWindow | null = null;

const store = new Store();

if (process.env.NODE_ENV === 'production') {
    const sourceMapSupport = require('source-map-support');
    sourceMapSupport.install();
}

// const isDebug = process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

// if (isDebug) {
//     require('electron-debug')();
// }

// const installExtensions = async () => {
//     const installer = require('electron-devtools-installer');
//     const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
//     const extensions = ['REACT_DEVELOPER_TOOLS'];

//     return installer
//         .default(
//             extensions.map((name) => installer[name]),
//             forceDownload
//         )
//         .catch(console.log);
// };

const createWindow = async () => {
    const RESOURCES_PATH = app.isPackaged ? path.join(process.resourcesPath, 'assets') : path.join(__dirname, '../../assets');

    const getAssetPath = (...paths: string[]): string => {
        return path.join(RESOURCES_PATH, ...paths);
    };

    mainWindow = new BrowserWindow({
        show: false,
        width: 1024,
        height: 728,
        icon: getAssetPath('icon.png'),
        webPreferences: {
            nodeIntegration: true,
            preload: app.isPackaged ? path.join(__dirname, 'preload.js') : path.join(__dirname, '../../.erb/dll/preload.js'),
        },
    });

    mainWindow.loadURL(resolveHtmlPath('index.html'));

    mainWindow.on('ready-to-show', () => {
        if (!mainWindow) {
            throw new Error('"mainWindow" is not defined');
        }
        if (process.env.START_MINIMIZED) {
            mainWindow.minimize();
        } else {
            mainWindow.show();
        }
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    const menuBuilder = new MenuBuilder(mainWindow);
    menuBuilder.buildMenu();

    // Open urls in the user's browser
    mainWindow.webContents.setWindowOpenHandler((edata) => {
        shell.openExternal(edata.url);
        return { action: 'deny' };
    });

    // Remove this if your app does not use auto updates
    new AppUpdater();
};

app.on('window-all-closed', () => {
    // Respect the OSX convention of having the application in memory even
    // after all windows have been closed
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.whenReady()
    .then(() => {
        createWindow();
        app.on('activate', () => {
            // On macOS it's common to re-create a window in the app when the
            // dock icon is clicked and there are no other windows open.
            if (mainWindow === null) createWindow();
        });
    })
    .catch(console.log);

const storeAccountInfo = (token: MSAuthToken, account: IUser) => {
    store.set('account-token', token);
    store.set('account', account);
};

const loadAccountToken = (): MSAuthToken | undefined => {
    const msToken = store.get('account-token');

    if (!isMsAuthToken(msToken)) {
        return undefined;
    }

    return msToken;
};

const removeAccountInfo = () => {
    store.delete('account-token');
    store.delete('account');
};

ipcMain.on('login', async () => {
    const auth = new Auth('select_account');
    const xbox = await auth.launch('electron');
    const mc = await xbox.getMinecraft();
    const account = mc.mclc();

    if (!isIUser(account)) {
        removeAccountInfo();
        return;
    }

    storeAccountInfo(xbox.msToken, account);

    mainWindow?.loadURL(resolveHtmlPath('index.html'));
});

ipcMain.on('logout', async () => {
    removeAccountInfo();
    mainWindow?.loadURL(resolveHtmlPath('index.html'));
});

ipcMain.on('refresh', async (_) => {
    const msToken = loadAccountToken();

    if (!isMsAuthToken(msToken)) {
        removeAccountInfo();
        mainWindow?.loadURL(resolveHtmlPath('index.html'));
        return;
    }

    const auth = new Auth();
    const xbox = await auth.refresh(msToken);
    const mc = await xbox.getMinecraft();
    const account = mc.mclc();

    if (!isIUser(account)) {
        removeAccountInfo();
        mainWindow?.loadURL(resolveHtmlPath('index.html'));
        return;
    }

    storeAccountInfo(xbox.msToken, account);
});

ipcMain.on('electron-store-get', async (event, key) => {
    event.returnValue = store.get(key);
});

ipcMain.on('electron-store-set', async (_, key, val) => {
    store.set(key, val);
});

ipcMain.on('electron-strone-reset', async (_, key) => {
    store.delete(key);
});
