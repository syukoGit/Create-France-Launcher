import { createContext } from 'react';
import { useEffect, useState } from 'react';
import McInstance, { isMcInstance } from 'types/McInstance';
import downloadModpack from '../downloadModpack';
import { toast } from 'react-toastify';

interface McInstanceContext {
    mcInstance: McInstance | null;
    installingModPack: boolean;
    modPackInstalled: () => boolean;
    installModPack: () => Promise<void>;
    saveMcInstance: (mcInstance: McInstance) => Promise<boolean>;
}

const McInstanceContext = createContext<McInstanceContext>({
    mcInstance: null,
    installingModPack: false,
    modPackInstalled: () => false,
    installModPack: async () => {},
    saveMcInstance: async (_: McInstance) => false,
});

interface Props {
    children: React.ReactNode;
}

export const McInstanceContextProvider = ({ children }: Props) => {
    const [mcInstance, setMcInstance] = useState<McInstance | null>(null);
    const [installingModPack, setInstallingModPack] = useState(false);

    useEffect(() => {
        window.electron.ipcRenderer.on('modpack-installation', (_, instanceStr) => {
            let instance = null;
            if (typeof instanceStr === 'string') {
                instance = JSON.parse(instanceStr);
            }

            if (isMcInstance(instance)) {
                setMcInstance(instance);
            } else {
                setMcInstance(null);
            }
        });

        window.electron.ipcRenderer.invoke('get-minecraft-instance').then((instanceStr) => {
            let instance = null;
            if (typeof instanceStr === 'string') {
                instance = JSON.parse(instanceStr);
            }

            if (isMcInstance(instance)) {
                setMcInstance(instance);
            } else {
                setMcInstance(null);
            }
        });
    }, []);

    const modPackInstalled = () => {
        return mcInstance !== null && mcInstance !== undefined;
    };

    const installModPack = async () => {
        if (installingModPack) {
            toast.error('Un téléchargement est déjà en cours !');
            return;
        }

        setInstallingModPack(true);

        await downloadModpack()
            .catch(() => {
                console.log('Error while installing modpack');
            })
            .finally(() => {
                setInstallingModPack(false);
            });
    };

    const saveMcInstance = async (mcInstance: McInstance) => {
        console.log('saving mcInstance...');
        const result = await window.electron.ipcRenderer.invoke('save-minecraft-instance', mcInstance.ram, mcInstance.javaPath).then((res) => {
            if (typeof res === 'boolean') {
                return res;
            } else {
                return false;
            }
        });

        window.electron.ipcRenderer.invoke('get-minecraft-instance').then((instanceStr) => {
            let instance = null;

            if (typeof instanceStr === 'string') {
                instance = JSON.parse(instanceStr);
            }

            if (isMcInstance(instance)) {
                setMcInstance(instance);
            } else {
                setMcInstance(null);
            }
        });

        return result;
    };

    return (
        <McInstanceContext.Provider value={{ mcInstance, installingModPack, modPackInstalled, installModPack, saveMcInstance }}>
            {children}
        </McInstanceContext.Provider>
    );
};

export default McInstanceContext;
