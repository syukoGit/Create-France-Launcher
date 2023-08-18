import { Id, toast } from 'react-toastify';
import downloadModpack from './downloadModpack';

const playMinecraft = () => {
    window.electron.ipcRenderer.removeAllListeners('play-minecraft-reply');
    window.electron.ipcRenderer.removeAllListeners('is-modpack-installed-reply');

    // Check if modpack is installed
    window.electron.ipcRenderer.once('is-modpack-installed-reply', async (_, installed) => {
        if (installed === 'false') {
            if (!(await downloadModpack())) {
                return;
            }
        }

        launchMinecraft();
    });

    window.electron.ipcRenderer.sendMessage('is-modpack-installed');
};

const launchMinecraft = () => {
    window.electron.ipcRenderer.removeAllListeners('play-minecraft-reply');

    const notifId = toast.loading('Lancement de Create France...');
    setListeners(notifId);

    window.electron.ipcRenderer.sendMessage('play-minecraft');
};

const setListeners = (notifId: Id) => {
    window.electron.ipcRenderer.once('play-minecraft-reply', (_, success) => {
        if (success) {
            toast.update(notifId, {
                type: 'success',
                isLoading: false,
                pauseOnFocusLoss: false,
                autoClose: 5000,
            });
        } else {
            toast.update(notifId, {
                type: 'error',
                isLoading: false,
                autoClose: 5000,
            });
        }
    });
};

export default playMinecraft;
