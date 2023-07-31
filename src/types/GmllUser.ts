import { GmllUser } from 'msmc/types/assets';

export const isGmllUser = (user: any): user is GmllUser => {
    return typeof user === 'object' && typeof user.profile === 'object' && typeof user.profile.name === 'string' && typeof user.profile.id === 'string';
};
