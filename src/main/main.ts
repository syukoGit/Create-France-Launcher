import path from 'path';
import { app, BrowserWindow, shell, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import { resolveHtmlPath } from './util';
import { config } from 'gmll';
import AppStore from './electronStore';
import { setIPCMainHandlers, setIPCMainListeners } from './listener';

class AppUpdater {
    constructor() {
        log.transports.file.level = 'info';
        autoUpdater.logger = log;
        autoUpdater.checkForUpdatesAndNotify();
    }
}

let mainWindow: BrowserWindow | null = null;

const store = new AppStore();

config.getEventListener().on('download.start', () => console.log('download start'));
config.getEventListener().on('download.setup', (cores) => console.log(`download setup: ${cores}`));
config.getEventListener().on('download.progress', (key, index, total, left) => console.log(`download progress: ${key} ${index}/${total} ${left}`));
config.getEventListener().on('download.fail', (key, type, err) => console.log(`download fail: ${key} ${type} ${err}`));
config.getEventListener().on('download.done', () => console.log('download done'));
config.getEventListener().on('parser.start', (e) => console.log('parser start', e));
config.getEventListener().on('parser.progress', (key, index, total, left) => console.log(`parser progress: ${key} ${index}/${total} ${left}`));
config.getEventListener().on('parser.fail', (key, type, err) => console.log(`parser fail: ${key} ${type} ${err}`));
config.getEventListener().on('parser.done', () => console.log('parser done'));

if (process.env.NODE_ENV === 'production') {
    const sourceMapSupport = require('source-map-support');
    sourceMapSupport.install();
}

const isDev = process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

const createWindow = async () => {
    const RESOURCES_PATH = app.isPackaged ? path.join(process.resourcesPath, 'assets') : path.join(__dirname, '../../assets');

    const getAssetPath = (...paths: string[]): string => {
        return path.join(RESOURCES_PATH, ...paths);
    };

    mainWindow = new BrowserWindow({
        show: false,
        width: 1250,
        height: 720,
        minHeight: 720,
        minWidth: 1250,
        autoHideMenuBar: !isDev,
        icon: getAssetPath('icon.png'),
        webPreferences: {
            nodeIntegration: false,
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

setIPCMainListeners(ipcMain, store);
setIPCMainHandlers(ipcMain, store);
