import './style.scss';
import { useEffect, useState } from 'react';
import { Download } from 'react-bootstrap-icons';
import downloadModpack from 'renderer/utils/downloadModpack';
import Loader from '../Loader';

type InstallModPackProps = {
    afterDownload: () => void;
};

const InstallModPack = ({ afterDownload }: InstallModPackProps) => {
    const [downloadProgress, setDownloadProgress] = useState(false);

    useEffect(() => {
        window.electron.ipcRenderer.invoke('is-modpack-installed').then((result) => {
            if (typeof result === 'boolean') {
                if (result) {
                    afterDownload();
                }
            }
        });
    }, []);

    const installModpack = async () => {
        setDownloadProgress(true);
        var result = await downloadModpack();

        if (result) {
            afterDownload();
        }

        setDownloadProgress(false);
    };

    return (
        <section className='install-modpack'>
            {downloadProgress ? (
                <>
                    <p>Téléchargement en cours...</p>
                    <Loader />
                </>
            ) : (
                <>
                    <p>Le modpack n'est pas encore installé !</p>
                    <button className='primary install-modpack__download-btn' onClick={installModpack}>
                        <Download className='icon icon--20px' />
                        <p>Installer le modpack</p>
                    </button>
                </>
            )}
        </section>
    );
};

export default InstallModPack;
