import { IUser } from 'minecraft-launcher-core';

export const isIUser = (account: any): account is IUser => {
    return (
        typeof account === 'object' &&
        typeof account.access_token === 'string' &&
        typeof account.client_token === 'string' &&
        typeof account.uuid === 'string' &&
        typeof account.name === 'string'
    );
};
