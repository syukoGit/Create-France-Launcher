import { useState } from 'react';
import './style.scss';
import Loader from '../Loader';

interface Props {
    loginSuccess: (username: string) => void;
    loginFailed: () => void;
}

const SigninWithMicrosoft = ({ loginSuccess, loginFailed }: Props) => {
    const [authenticationInProgress, setAuthenticationInProgress] = useState(false);

    const handleClick = () => {
        if (authenticationInProgress) {
            return;
        }

        setAuthenticationInProgress(true);
        window.electron.ipcRenderer
            .invoke('ms-account-login')
            .then((username) => {
                if (username === undefined || username === null) {
                    loginFailed();
                } else {
                    loginSuccess(username);
                }
            })
            .catch(() => {
                loginFailed();
            })
            .finally(() => setAuthenticationInProgress(false));
    };

    return authenticationInProgress ? <Loader /> : <button className='signin-with-ms' onClick={handleClick}></button>;
};

export default SigninWithMicrosoft;
