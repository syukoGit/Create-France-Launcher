import { isGmllUser } from 'types/GmllUser';
import MinecraftCreateFrance from '../../../../assets/create-france/minecraft-create-france.png';
import './style.scss';
import launchMinecraft from './playMinecraft';
import { useContext } from 'react';
import McInstanceContext from 'renderer/utils/contexts/McInstanceContext';
import { toast } from 'react-toastify';

const Play = () => {
    const { installingModPack, modPackInstalled, installModPack } = useContext(McInstanceContext);

    const account = window.electron.store.get('account');

    let headUrl = 'https://mc-heads.net/avatar/MHF_Steve/64';
    let username = 'undefined';

    if (isGmllUser(account)) {
        username = account.profile.name;
        headUrl = `https://mc-heads.net/avatar/${username}/64`;
    }

    const handlePlay = async () => {
        if (installingModPack) {
            toast.error("Le modpack est en cours d'installation. Veuillez patienter.");
            return;
        }

        if (!modPackInstalled()) {
            await installModPack();
        }

        launchMinecraft();
    };

    return (
        <div className='play-page'>
            <header>
                <img id='minecraft-create-france-title' src={MinecraftCreateFrance} alt='Minecraft Create France' />
            </header>
            <div className='play-page__content'>
                <button className='primary' onClick={handlePlay}>
                    Jouer
                </button>
            </div>
        </div>
    );
};

export default Play;
