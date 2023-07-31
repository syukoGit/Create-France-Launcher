import path from 'path';
import { app, BrowserWindow, shell, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import { resolveHtmlPath } from './util';
import { Auth, Minecraft } from 'msmc';
import Store from 'electron-store';
import { isMsAuthToken } from '../types/MsAuthToken';
import { MSAuthToken } from 'msmc/types/auth/auth';
import { GmllUser } from 'msmc/types/assets';
import { Instance, init, config } from 'gmll';

class AppUpdater {
    constructor() {
        log.transports.file.level = 'info';
        autoUpdater.logger = log;
        autoUpdater.checkForUpdatesAndNotify();
    }
}

let mainWindow: BrowserWindow | null = null;

const store = new Store();

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
        width: 1024,
        height: 768,
        minHeight: 768,
        minWidth: 1024,
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

const storeAccountInfo = (token: MSAuthToken, account: GmllUser) => {
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

ipcMain.on('ms-account-login', async () => {
    try {
        const auth = new Auth('select_account');
        const xbox = await auth.launch('electron');
        const mc = await xbox.getMinecraft();
        const account = mc.gmll();

        storeAccountInfo(xbox.msToken, account);

        mainWindow?.loadURL(resolveHtmlPath('index.html'));
    } catch (_) {
        removeAccountInfo();
    }
});

ipcMain.on('account-logout', async () => {
    removeAccountInfo();
    mainWindow?.loadURL(resolveHtmlPath('index.html'));
});

ipcMain.on('ms-account-refresh', async (_) => {
    const msToken = loadAccountToken();

    if (!isMsAuthToken(msToken)) {
        removeAccountInfo();
        mainWindow?.loadURL(resolveHtmlPath('index.html'));
        return;
    }

    try {
        const auth = new Auth();
        const xbox = await auth.refresh(msToken);
        const mc = await xbox.getMinecraft();
        const account = mc.gmll();

        storeAccountInfo(xbox.msToken, account);
    } catch (_) {
        removeAccountInfo();
        mainWindow?.loadURL(resolveHtmlPath('index.html'));
    }
});

ipcMain.on('download-modpack', async () => {
    await init();

    try {
        var int = new Instance({ version: '1.19.2', name: 'create_france' });
        await int.import('https://www.dropbox.com/s/rgu4rwjgw42j4jz/Createfrance%201.19.2%20fabric-0.10.zip?dl=1', 'curseforge');
        int.save();
    } catch (e) {
        console.log('error: ' + JSON.stringify(e));
    }

    console.log('done');
});

ipcMain.on('play-minecraft', async () => {
    const msToken = loadAccountToken();

    if (!isMsAuthToken(msToken)) {
        removeAccountInfo();
        mainWindow?.loadURL(resolveHtmlPath('index.html'));
        return;
    }

    await init();

    let mc: Minecraft;

    try {
        const auth = new Auth();
        const xbox = await auth.refresh(msToken);
        mc = await xbox.getMinecraft();
    } catch (e) {
        console.log('error: ' + JSON.stringify(e));
        removeAccountInfo();
        mainWindow?.loadURL(resolveHtmlPath('index.html'));
        return;
    }

    const instances = Instance.getProfiles();

    instances.forEach((element) => {
        console.log(element.name + ' ' + element.version);
    });

    try {
        var int = Instance.get('create_france');
        int.launch(mc.gmll());
    } catch (e) {
        console.log('error: ' + JSON.stringify(e));
    }

    // var int = new Instance({ version: '1.19.2', name: 'Create France' });
    // await int.wrap(
    //     /**The URL link to the base folder of this modpacks final resting spot*/
    //     // 'file://C:/Users/Antonin/Downloads/test',
    //     'https://www.hanro50.net.za/test',
    //     'modpack',
    //     /**The name of your pack.*/
    //     'Create France'
    // );
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
