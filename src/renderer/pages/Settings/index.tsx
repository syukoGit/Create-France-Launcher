import { useNavigate } from 'react-router-dom';
import './style.scss';
import { CaretLeftFill, FileEarmarkArrowDownFill, TvFill } from 'react-bootstrap-icons';
import { useContext, useEffect, useState } from 'react';
import InstallModPack from 'renderer/components/InstallModPack';
import McInstanceContext from 'renderer/utils/contexts/McInstanceContext';
import McInstance from 'types/McInstance';
import { toast } from 'react-toastify';
import Loader from 'renderer/components/Loader';

interface Settings {
    resolution: {
        width: number;
        height: number;
    };
}

const isSettings = (obj: any): obj is Settings => {
    return (
        typeof obj === 'object' &&
        obj !== null &&
        typeof obj.resolution === 'object' &&
        obj.resolution !== null &&
        typeof obj.resolution.width === 'number' &&
        typeof obj.resolution.height === 'number'
    );
};

const Settings = () => {
    const { mcInstance, modPackInstalled, saveMcInstance } = useContext(McInstanceContext);
    const navigate = useNavigate();

    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState<Settings>({
        resolution: {
            width: 720,
            height: 480,
        },
    });

    const [minecraftSettings, setMinecraftSettings] = useState(
        mcInstance ?? {
            ram: 2,
            javaPath: 'default',
        }
    );

    useEffect(() => {
        getSettings();
    }, []);

    if (minecraftSettings.javaPath == 'default') {
        setMinecraftSettings({ ...minecraftSettings, javaPath: '' });
    }

    const getSettings = () => {
        let retrievedSettings = window.electron.store.get('settings');

        if (!isSettings(retrievedSettings)) {
            window.electron.store.delete('settings');
            return;
        }

        setSettings(retrievedSettings);
    };

    const save = async () => {
        if (saving) return;

        setSaving(true);
        console.log('saving...:' + JSON.stringify(settings));
        window.electron.store.set('settings', settings);
        const result = await saveMcInstance(minecraftSettings as McInstance);

        if (result) {
            toast.success('Paramètres sauvegardés !');
        } else {
            toast.error('Erreur lors de la sauvegarde des paramètres');
        }

        setSaving(false);
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
            {!modPackInstalled() ? (
                <InstallModPack />
            ) : (
                <>
                    <div className='settings__content'>
                        <section className='settings__resolution'>
                            <h2>Résolution</h2>
                            <TvFill className='settings__resolution__icon' />
                            <input
                                type='number'
                                max='3840'
                                min='260'
                                value={settings.resolution.width}
                                onChange={(e) => setSettings({ ...settings, resolution: { ...settings.resolution, width: e.target.valueAsNumber } })}
                            />
                            <span>x</span>
                            <input
                                type='number'
                                max='2160'
                                min='426'
                                value={settings.resolution.height}
                                onChange={(e) => setSettings({ ...settings, resolution: { ...settings.resolution, height: e.target.valueAsNumber } })}
                            />
                        </section>
                        <section className='settings__minecraft'>
                            <h2>Minecraft</h2>
                            <div className='settings__minecraft__ram'>
                                <p>RAM: {minecraftSettings.ram} Go</p>
                                <input
                                    type='range'
                                    min={2}
                                    max={32}
                                    value={minecraftSettings.ram}
                                    step={1}
                                    onChange={(e) => setMinecraftSettings({ ...minecraftSettings, ram: e.target.valueAsNumber })}
                                />
                            </div>
                            <div className='settings__minecraft__java'>
                                <p>Chemin vers Java:</p>
                                <input
                                    type='text'
                                    value={minecraftSettings.javaPath}
                                    placeholder='default'
                                    onChange={(e) => setMinecraftSettings({ ...minecraftSettings, javaPath: e.target.value })}
                                />
                            </div>
                        </section>
                        <section className='settings__modpack'>
                            <h2>Modack</h2>
                            <InstallModPack />
                        </section>
                    </div>
                    <footer>
                        {saving ? (
                            <Loader />
                        ) : (
                            <button className='primary lg' onClick={save}>
                                Sauvegarder
                            </button>
                        )}
                    </footer>
                </>
            )}
        </div>
    );
};

export default Settings;
