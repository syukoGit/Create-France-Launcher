import './style.scss';
import SigninWithMicrosoft from 'renderer/components/SigninWithMicrosoft';
import MinecraftCreateFrance from '../../../../assets/create-france/minecraft-create-france.png';
import CreateFranceLogo from '../../../../assets/icon.svg';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useEffect } from 'react';

const Login = () => {
    const navigate = useNavigate();

    const loginSuccess = (username: string) => {
        toast.success(`Bonjour ${username} !`);
        navigate('/');
    };

    const loginFailed = () => {
        toast.error('Impossible de se connecter. Veuillez réessayer.');
    };

    return (
        <div className='login-page'>
            <header>
                <div />
                <img id='minecraft-create-france-title' src={MinecraftCreateFrance} alt='Minecraft Create France' />
                <img id='create-france-logo' src={CreateFranceLogo} alt='Logo Create France' />
            </header>
            <div className='login-page__content'>
                <div className='login-page__content__form'>
                    <h1 className='login-page__content__form__title'>Se connecter</h1>
                    <div>
                        <SigninWithMicrosoft loginSuccess={loginSuccess} loginFailed={loginFailed} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
