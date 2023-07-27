import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { isIUser } from 'types/IUser';
import { isMsAuthToken } from 'types/MsAuthToken';

const Auth = () => {
    const location = useLocation();

    const isAuthenticated = () => {
        const msToken = window.electron.store.get('account-token');

        if (!isMsAuthToken(msToken)) {
            console.log('account-token is not a MsAuthToken');
            return false;
        }

        if (msToken.expires_in < Date.now()) {
            console.log('account-token has expired');
            window.electron.ipcRenderer.sendMessage('refresh');
            return false;
        }

        window.electron.ipcRenderer.sendMessage('refresh');
        console.log('account-token is valid');

        return true;
    };

    return isAuthenticated() ? <Outlet /> : <Navigate to='/login' state={{ from: location }} replace />;
};

export default Auth;
