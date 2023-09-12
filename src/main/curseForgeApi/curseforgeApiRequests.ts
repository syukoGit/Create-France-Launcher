import axios from 'axios';
import getModFileResponse, { isGetModFileResponse } from './types/getModFileResponse';

const baseUrl = 'https://api.curseforge.com';

const apiKey = '$2a$10$8sGXLAOKwN..n6s/QeILR.R4p1xrzeARHMUKyir4Ua8vAdTc6WVN6';

export async function getModFile(projectId: number, fileId: number): Promise<getModFileResponse | null> {
    const url = `${baseUrl}/v1/mods/${projectId}/files/${fileId}`;

    let config = {
        method: 'GET',
        url: url,
        headers: {
            'x-api-key': apiKey,
        },
    };

    let result: getModFileResponse | null = null;

    await axios
        .request(config)
        .then((res) => {
            if (isGetModFileResponse(res.data)) {
                result = res.data;
            } else {
                throw new Error('Invalid response');
            }
        })
        .catch((err) => {
            console.log('Curseforge get mod file error: ' + err);
            result = null;
        });

    return result;
}
