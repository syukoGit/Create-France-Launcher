import Store from 'electron-store';
import { GmllUser } from 'msmc/types/assets';
import { MSAuthToken } from 'msmc/types/auth/auth';
import { isMsAuthToken } from '../types/MsAuthToken';

class AppStore extends Store {
    storeAccountInfo(token: MSAuthToken, account: GmllUser) {
        this.set('account-token', token);
        this.set('account', account);
    }

    loadAccountToken(): MSAuthToken | undefined {
        const msToken = this.get('account-token');

        if (!isMsAuthToken(msToken)) {
            return undefined;
        }

        return msToken;
    }

    removeAccountInfo() {
        this.delete('account-token');
        this.delete('account');
    }
}

export default AppStore;
