const Launcher = () => {
    const handleLogout = () => {
        window.electron.ipcRenderer.sendMessage('logout');
    };

    return (
        <div>
            <h1>Launcher</h1>
            <button onClick={handleLogout}>Logout</button>
        </div>
    );
};

export default Launcher;
