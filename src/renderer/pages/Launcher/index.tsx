import { isGmllUser } from 'types/GmllUser';
import './style.scss';
import Play from '../Play';

const Launcher = () => {
    const account = window.electron.store.get('account');

    let headUrl = 'https://mc-heads.net/avatar/MHF_Steve/64';
    let username = 'undefined';

    if (isGmllUser(account)) {
        username = account.profile.name;
        headUrl = `https://mc-heads.net/avatar/${username}/64`;
    }

    return (
        <div className='launcher'>
            <section className='launcher__sidebar'>
                <img id='minecraft-player-head' src={headUrl} />
                <p>{username}</p>
            </section>
            <section className='launcher__main'>
                <Play />
            </section>
        </div>
    );
};

export default Launcher;
