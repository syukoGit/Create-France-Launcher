import { useNavigate } from 'react-router-dom';
import './style.scss';
import { CaretLeftFill, TvFill } from 'react-bootstrap-icons';
import { Instance } from 'gmll';
import Loader from 'renderer/components/Loader';
import { useEffect, useState } from 'react';
import { get } from 'http';

const Settings = () => {
    const [resolution, setResolution] = useState({ width: 720, height: 480 });
    const [mcInstance, setMcInstance] = useState<Instance | null | undefined>(undefined);
    const navigate = useNavigate();

    const getMinecraftInstance = async () => {
        const instance = await window.electron.ipcRenderer.invoke('get-minecraft-instance');

        setMcInstance(JSON.parse(instance));
    };

    const getResolution = () => {
        const resolution = window.electron.store.get('launch-resolution');
        console.log(resolution);

        if (
            resolution === undefined ||
            typeof resolution.width !== 'number' ||
            typeof resolution.height === 'number' ||
            Number.isNaN(resolution.width) ||
            Number.isNaN(resolution.height)
        ) {
            window.electron.store.set('launch-resolution', { width: 720, height: 480 });
            setResolution({ width: 720, height: 480 });
            return;
        } else {
            setResolution(resolution);
        }
    };

    useEffect(() => {
        getResolution();
        getMinecraftInstance();
    }, []);

    const saveResolution = () => {
        window.electron.store.set('launch-resolution', resolution);
    };

    return (
        <div className='settings'>
            <header>
                <button id='back-to-home-btn' className='image-button' onClick={() => navigate('/')}>
                    <CaretLeftFill />
                </button>
                <h1>Settings</h1>
                <div className='spacer' />
            </header>
            {mcInstance === undefined && <Loader />}
            {mcInstance === null && <p>Le modpack n'est pas encore installé !</p>}
            {mcInstance && (
                <section className='settings__resolution'>
                    <p>Résolution</p>
                    <TvFill className='settings__resolution__icon' />
                    <input
                        type='number'
                        max='3840'
                        min='260'
                        defaultValue='720'
                        value={resolution.width}
                        onChange={(e) => setResolution({ ...resolution, width: e.target.valueAsNumber })}
                    />
                    <span>x</span>
                    <input
                        type='number'
                        max='2160'
                        min='426'
                        defaultValue='480'
                        value={resolution.height}
                        onChange={(e) => setResolution({ ...resolution, height: e.target.valueAsNumber })}
                    />
                </section>
            )}
        </div>
    );
};

export default Settings;
