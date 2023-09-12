import { Instance, init } from 'gmll';
import { Dir } from 'gmll/objects/files';

export const deleteInstance = async (instanceName: string) => {
    await init();

    const minecraftDir = new Dir('.minecraft');

    if (!Instance.getProfiles().has(instanceName)) {
        return;
    }
};
