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

        window.electron.ipcRenderer.sendMessage('refresh');

        return true;
    };

    return isAuthenticated() ? <Outlet /> : <Navigate to='/login' state={{ from: location }} replace />;
};

export default Auth;
