import './style.scss';
import SigninWithMicrosoft from 'renderer/components/SigninWithMicrosoft';
import MinecraftCreateFrance from '../../../../assets/create-france/minecraft-create-france.png';
import CreateFranceLogo from '../../../../assets/create-france/logo.png';

const Login = () => {
    return (
        <div className='login-page'>
            <header>
                <div />
                <img id='minecraft-create-france-title' src={MinecraftCreateFrance} alt='Minecraft Create France' />
                <img id='create-france-logo' src={CreateFranceLogo} alt='Logo Create France' />
            </header>
            <div className='login-page__content'>
                <div className='login-page__content__form'>
                    <h1 className='login-page__content__form__title'>Log in</h1>
                    <div>
                        <SigninWithMicrosoft />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
