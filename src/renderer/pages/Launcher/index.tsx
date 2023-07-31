import { isGmllUser } from 'types/GmllUser';
import MinecraftCreateFrance from '../../../../assets/create-france/minecraft-create-france.png';
import './style.scss';

const Launcher = () => {
    const account = window.electron.store.get('account');

    let headUrl = 'https://mc-heads.net/avatar/MHF_Steve/64';
    let username = 'undefined';

    if (isGmllUser(account)) {
        username = account.profile.name;
        headUrl = `https://mc-heads.net/avatar/${username}/64`;
    }

    const handleLogout = () => {
        window.electron.ipcRenderer.sendMessage('account-logout');
    };

    const handleDownload = () => {
        window.electron.ipcRenderer.sendMessage('download-modpack');
    };

    const handlePlay = () => {
        window.electron.ipcRenderer.sendMessage('play-minecraft');
    };

    return (
        <div className='launcher-page'>
            <section className='launcher-page__sidebar'>
                <img id='minecraft-player-head' src={headUrl} alt='Minecraft player head' />
                <p>{username}</p>
            </section>
            <section className='launcher-page__main'>
                <header>
                    <img id='minecraft-create-france-title' src={MinecraftCreateFrance} alt='Minecraft Create France' />
                </header>
                <button onClick={handleLogout}>Logout</button>
                <button onClick={handleDownload}>Télécharger</button>
                <button onClick={handlePlay}>Jouer</button>
            </section>
        </div>
    );
};

export default Launcher;
