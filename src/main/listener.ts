import { BrowserWindow, IpcMain } from 'electron';
import { Auth, Minecraft } from 'msmc';
import AppStore from './electronStore';
import { isMsAuthToken } from '../types/MsAuthToken';
import { copy } from 'fs-extra';
import { Instance, init } from 'gmll';
import { Dir } from 'gmll/objects/files';
import { getModFile } from './curseForgeApi/curseforgeApiRequests';

export function setIPCMainListeners(ipcMain: IpcMain, store: AppStore) {
    // Login to Microsoft account
    // Used in src\renderer\pages\Login
    //
    // Event reply => (success: boolean, username: string)
    // Reply if login was successful and username
    ipcMain.on('ms-account-login', async (e) => {
        try {
            const auth = new Auth('select_account');
            const xbox = await auth.launch('electron');
            const mc = await xbox.getMinecraft();
            const account = mc.gmll();

            store.storeAccountInfo(xbox.msToken, account);

            e.reply('login-reply', true, account.profile.name);

            return;
        } catch (err) {
            store.removeAccountInfo();
            console.log(JSON.stringify(err));
        }

        e.reply('login-reply', false, '');
    });

    // Logout from Microsoft account
    // Used in src\renderer\pages\Launcher
    // Event reply => void
    ipcMain.on('account-logout', async (e) => {
        store.removeAccountInfo();
        e.reply('logout-reply');
    });

    // Refresh Microsoft account
    // Used in src\renderer\components\Auth.tsx
    // Event reply => (success: boolean)
    // Reply if refresh was successful
    ipcMain.on('ms-account-refresh', async (e) => {
        const msToken = store.loadAccountToken();

        if (!isMsAuthToken(msToken)) {
            store.removeAccountInfo();
            e.reply('refresh-reply', false);
            return;
        }

        try {
            const auth = new Auth();
            const xbox = await auth.refresh(msToken);
            const mc = await xbox.getMinecraft();
            const account = mc.gmll();

            store.storeAccountInfo(xbox.msToken, account);
            e.reply('refresh-reply', true);
        } catch (_) {
            store.removeAccountInfo();
            e.reply('refresh-reply', false);
        }
    });

    // Install modpack
    ipcMain.on('install-modpack', async (e, removeData) => {
        await init();

        if (typeof removeData !== 'boolean') {
            removeData = false;
        }

        if (Instance.getProfiles().has('create_france')) {
            if (removeData) {
                Instance.rm('create_france');
            } else {
                // TODO: Save data
            }
        }

        const minecraftDir = new Dir('.minecraft').mkdir();

        const modpackZip = minecraftDir.getFile('modpack.zip');

        // Download launcher zip
        try {
            e.reply('download-modpack-reply', 'start');

            await modpackZip.download(`https://api.pcloud.com/getpubzip?code=kZiqa3VZVWL2eQUS2VXBwu2YvgCNgubmKTIX`);

            e.reply('download-modpack-reply', 'success');
        } catch (err) {
            console.log('error: ' + JSON.stringify(err));
            e.reply('download-modpack-reply', 'error');
            Instance.rm('create_france');
            return;
        }

        let modpackExtractedFolder;
        let manifest;
        let mcVersion;

        // Extract modpack
        try {
            e.reply('extract-modpack-reply', 'start');

            const tempModpack = minecraftDir.getDir('modpack-extracted').mkdir();
            await modpackZip.unzip(tempModpack);
            modpackExtractedFolder = tempModpack.getDir('Createfrance');

            manifest = JSON.parse(modpackExtractedFolder.getFile('manifest.json').read());

            let modloaderVersion = manifest.minecraft.modLoaders[0].id.split('-');
            let modloader = modloaderVersion[0];
            let version = modloaderVersion[1];

            mcVersion = `${modloader}-loader-${version}-${manifest.minecraft.version}`;

            e.reply('extract-modpack-reply', 'success');
        } catch (err) {
            console.log('error: ' + JSON.stringify(err));
            e.reply('extract-modpack-reply', 'error');
            Instance.rm('create_france');
            return;
        }

        let instance;

        // Download fabric
        try {
            e.reply('download-fabric-reply', 'start');

            instance = new Instance({ version: mcVersion, name: 'create_france', ram: 16 });
            await instance.install();
            instance.save();

            e.reply('download-fabric-reply', 'success');
        } catch (err) {
            console.log('error: ' + JSON.stringify(err));
            e.reply('download-fabric-reply', 'error');
            Instance.rm('create_france');
            return;
        }

        // Install modpack
        try {
            e.reply('install-modpack-reply', 'start');

            const instanceFolder = instance.getDir();

            // Overrides folders
            const modpackOverridesFolder = modpackExtractedFolder.getDir('overrides');

            const overridesFolders = modpackOverridesFolder.ls();

            for (let i of overridesFolders) {
                const overridesFolderName = i.getName();
                const createdInstanceFolder = instanceFolder.getDir(overridesFolderName).mkdir();

                await copy(i.path.join('\\'), createdInstanceFolder.path.join('\\'));
            }

            // Download mods
            const instanceModsFolder = instanceFolder.getDir('mods').mkdir();

            const mods = manifest.files;
            const nbMods = mods.length;

            let i = 1;
            for (let mod of mods) {
                const modFile = await getModFile(mod.projectID, mod.fileID);

                if (modFile === null) {
                    console.log(`Error while downloading ${mod.projectID} | ${mod.fileID}`);
                    continue;
                }

                const name = modFile.data.fileName;

                console.log(`Downloading... ${name}| ${i}/${nbMods}`);
                let downloadUrl = `https://www.curseforge.com/api/v1/mods/${mod.projectID}/files/${mod.fileID}/download`;

                if (modFile.data.downloadUrl !== null) {
                    downloadUrl = modFile.data.downloadUrl;
                }

                await instanceModsFolder
                    .getFile(name)
                    .download(downloadUrl)
                    .catch((err) => {
                        console.log(`Error while downloading ${name} (${mod.projectID}-${mod.fileID})`);
                        console.log(err);
                    });

                i++;
            }

            e.reply('install-modpack-reply', 'success');
        } catch (err) {
            console.log('error: ' + JSON.stringify(err));
            e.reply('install-modpack-reply', 'error');
            Instance.rm('create_france');
            return;
        }

        e.reply('modpack-installation', JSON.stringify(instance));
    });

    // Play Minecraft
    // Used in src\renderer\pages\Play
    ipcMain.on('play-minecraft', async (e) => {
        const msToken = store.loadAccountToken();

        if (!isMsAuthToken(msToken)) {
            store.removeAccountInfo();
            e.reply('play-minecraft-reply', false);
            e.reply('navigate', '/login');
            return;
        }

        await init();

        let mc: Minecraft;

        try {
            const auth = new Auth();
            const xbox = await auth.refresh(msToken);
            mc = await xbox.getMinecraft();
        } catch (err) {
            console.log('error: ' + JSON.stringify(err));
            store.removeAccountInfo();
            e.reply('play-minecraft-reply', false);
            e.reply('navigate', '/login');
            return;
        }

        if (!Instance.getProfiles().has('create_france')) {
            e.reply('play-minecraft-reply', false, 'no-instance');
            return;
        }

        try {
            var int = Instance.get('create_france');
            await int.launch(mc.gmll());

            setTimeout(() => BrowserWindow.getFocusedWindow()?.minimize(), 6000);

            e.reply('play-minecraft-reply', true);
        } catch (err) {
            console.log('error: ' + JSON.stringify(err));
            e.reply('play-minecraft-reply', false);
        }
    });

    // Get Electron store value
    ipcMain.on('electron-store-get', async (event, key) => {
        event.returnValue = store.get(key);
    });

    // Set Electron store value
    ipcMain.on('electron-store-set', async (_, key, val) => {
        store.set(key, val);
    });

    // Delete Electron store value
    ipcMain.on('electron-strone-reset', async (_, key) => {
        store.delete(key);
    });
}
export function setIPCMainHandlers(ipcMain: IpcMain) {
    // Get Minecraft instance
    ipcMain.handle('get-minecraft-instance', async (_) => {
        await init();

        if (!Instance.getProfiles().has('create_france')) {
            return null;
        }

        return JSON.stringify(Instance.get('create_france'));
    });

    // Delete Minecraft instance
    ipcMain.handle('delete-minecraft-instance', async (_) => {
        await init();

        if (!Instance.getProfiles().has('create_france')) {
            return false;
        }

        try {
            Instance.rm('create_france');
        } catch (err) {
            console.log(err);

            return false;
        }

        return true;
    });

    // Save Minecraft instance
    ipcMain.handle('save-minecraft-instance', async (_, newRam, newJavaPath) => {
        await init();

        if (!Instance.getProfiles().has('create_france')) {
            console.log('Try to save instance but it does not exist');
            return false;
        }

        try {
            const instance = Instance.get('create_france');

            if (typeof newRam === 'number') {
                instance.ram = newRam;
            }

            if (typeof newJavaPath === 'string') {
                instance.javaPath = newJavaPath;
            }

            console.log(JSON.stringify(instance));

            instance.save();
        } catch (err) {
            console.log(err);

            return false;
        }

        return true;
    });

    // Test
    ipcMain.handle('test', async (_) => {});
}
