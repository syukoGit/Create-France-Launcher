import { useEffect } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { isMsAuthToken } from 'types/MsAuthToken';

const Auth = () => {
    const location = useLocation();
    const navigation = useNavigate();

    useEffect(() => {
        window.electron.ipcRenderer.once('ms-account-refresh-reply', (_, account) => {
            if (!account) {
                navigation('/login');
            }
        });
    }, []);

    const isAuthenticated = () => {
        const msToken = window.electron.store.get('account-token');

        if (!isMsAuthToken(msToken)) {
            console.log('account-token is not a MsAuthToken');
            return false;
        }

        window.electron.ipcRenderer.sendMessage('ms-account-refresh');

        return true;
    };

    return isAuthenticated() ? <Outlet /> : <Navigate to='/login' state={{ from: location }} replace />;
};

export default Auth;
