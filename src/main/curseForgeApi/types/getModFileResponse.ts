interface getModFileResponse {
    data: {
        id: number;
        modId: number;
        fileName: string;
        downloadUrl: string | null;
    };
}

export const isGetModFileResponse = (instance: any): instance is getModFileResponse => {
    return (
        typeof instance === 'object' &&
        typeof instance?.data === 'object' &&
        typeof instance?.data?.id === 'number' &&
        typeof instance?.data?.modId === 'number' &&
        typeof instance?.data?.fileName === 'string' &&
        (typeof instance?.data?.downloadUrl === 'string' || instance?.data?.downloadUrl === null)
    );
};

export default getModFileResponse;
