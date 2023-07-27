const Login = () => {
    const handleClick = () => {
        window.electron.ipcRenderer.sendMessage('login');
    };

    return (
        <div>
            <h1>Login</h1>
            <button onClick={handleClick}>Login</button>
        </div>
    );
};

export default Login;
