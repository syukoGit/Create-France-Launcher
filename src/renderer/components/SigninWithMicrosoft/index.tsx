import './style.scss';

const SigninWithMicrosoft = () => {
    const handleClick = () => {
        window.electron.ipcRenderer.sendMessage('ms-account-login');
    };

    return <button className='signin-with-ms' onClick={handleClick}></button>;
};

export default SigninWithMicrosoft;
