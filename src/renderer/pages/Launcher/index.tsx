import { isGmllUser } from 'types/GmllUser';
import './style.scss';
import Play from '../Play';
import { toast } from 'react-toastify';
import { useEffect } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import Settings from '../Settings';
import { McInstanceContextProvider } from 'renderer/utils/contexts/McInstanceContext';

const Launcher = () => {
    const navigate = useNavigate();

    useEffect(() => {
        window.electron.ipcRenderer.on('navigate', () => {
            navigate('/');
        });

        window.electron.ipcRenderer.once('logout-reply', () => {
            toast.error('Au revoir !');
            navigate('/');
        });
    }, []);

    const account = window.electron.store.get('account');

    let headUrl = 'https://mc-heads.net/avatar/MHF_Steve/64';
    let username = 'Steve';

    if (isGmllUser(account)) {
        username = account.profile.name;
        headUrl = `https://mc-heads.net/avatar/${username}/64`;
    }

    const handleLogout = () => {
        window.electron.ipcRenderer.sendMessage('account-logout');
    };

    return (
        <div className='launcher'>
            <McInstanceContextProvider>
                <section className='launcher__sidebar'>
                    <img id='minecraft-player-head' src={headUrl} />
                    <p>{username}</p>
                    <hr className='horizontal-divider' />
                    <p className='font-14 clickable' onClick={handleLogout}>
                        Se déconnecter
                    </p>
                    <div className='launcher__sidebar__end'></div>
                    <button className='image-button launcher__sidebar__settings-btn' onClick={() => navigate('/settings')} />
                </section>
                <section className='launcher__main'>
                    <Routes>
                        <Route path='/' element={<Play />} />
                        <Route path='/settings' element={<Settings />} />
                    </Routes>
                </section>
            </McInstanceContextProvider>
        </div>
    );
};

export default Launcher;
