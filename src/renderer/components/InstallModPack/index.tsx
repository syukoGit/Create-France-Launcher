import './style.scss';
import { useContext } from 'react';
import { Download } from 'react-bootstrap-icons';
import Loader from '../Loader';
import McInstanceContext from 'renderer/utils/contexts/McInstanceContext';

const InstallModPack = () => {
    const { installingModPack, installModPack, modPackInstalled } = useContext(McInstanceContext);

    return (
        <section className='install-modpack'>
            {installingModPack ? (
                <>
                    <p>Téléchargement en cours...</p>
                    <Loader />
                </>
            ) : modPackInstalled() ? (
                <>
                    <p>Modpack déjà installé</p>
                    <button className='primary install-modpack__download-btn' onClick={installModPack}>
                        <Download className='icon icon--20px' />
                        <p>Reinstaller le modpack</p>
                    </button>
                </>
            ) : (
                <>
                    <p>Le modpack n'est pas encore installé !</p>
                    <button className='primary install-modpack__download-btn' onClick={installModPack}>
                        <Download className='icon icon--20px' />
                        <p>Installer le modpack</p>
                    </button>
                </>
            )}
        </section>
    );
};

export default InstallModPack;
