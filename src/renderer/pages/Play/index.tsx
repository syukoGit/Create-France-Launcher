import { isGmllUser } from 'types/GmllUser';
import MinecraftCreateFrance from '../../../../assets/create-france/minecraft-create-france.png';
import './style.scss';
import playMinecraft from './playMinecraft';

const Play = () => {
    const account = window.electron.store.get('account');

    let headUrl = 'https://mc-heads.net/avatar/MHF_Steve/64';
    let username = 'undefined';

    if (isGmllUser(account)) {
        username = account.profile.name;
        headUrl = `https://mc-heads.net/avatar/${username}/64`;
    }

    const handlePlay = () => {
        playMinecraft();
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
