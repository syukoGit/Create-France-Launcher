interface McInstance {
    name: string;
    path: string;
    version: string;
    javaPath: string;
    ram: number;
}

export const isMcInstance = (instance: any): instance is McInstance => {
    return (
        typeof instance === 'object' &&
        typeof instance?.name === 'string' &&
        typeof instance?.path === 'string' &&
        typeof instance?.version === 'string' &&
        typeof instance?.javaPath === 'string' &&
        typeof instance?.ram === 'number'
    );
};

export default McInstance;
