import { MSAuthToken } from 'msmc/types/auth/auth';

export const isMsAuthToken = (token: any): token is MSAuthToken => {
    return (
        typeof token === 'object' &&
        typeof token.access_token === 'string' &&
        typeof token.expires_in === 'number' &&
        typeof token.foci === 'string' &&
        typeof token.refresh_token === 'string' &&
        typeof token.scope === 'string' &&
        typeof token.token_type === 'string' &&
        typeof token.user_id === 'string'
    );
};
