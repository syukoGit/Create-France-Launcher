import { Id, toast } from 'react-toastify';

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

export default launchMinecraft;
