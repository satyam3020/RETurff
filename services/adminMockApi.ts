// ─── Mock Auth Only ──────────────────────────────────────────────────────────
// Auth layer (login/signup) still uses mock credentials.
// All other admin/user data is now served by the real backend (services/api.ts).

import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Mock Admin Credentials ───────────────────────────────────────────────────
export const MOCK_ADMIN = {
    _id: 'admin_001',
    name: 'Admin User',
    phone: '9999999999',
    password: 'admin123',
    role: 'admin',
};
export const MOCK_TOKEN = 'mock_admin_jwt_token_returff';

// ─── Mock Admin Login (used by login.tsx — auth layer kept as-is) ─────────────
export const mockAdminLogin = async (phone: string, password: string) => {
    await new Promise((r) => setTimeout(r, 500));
    if (phone === MOCK_ADMIN.phone && password === MOCK_ADMIN.password) {
        return { success: true, token: MOCK_TOKEN, user: MOCK_ADMIN };
    }
    return { success: false, message: 'Invalid phone or password.' };
};

// ─── Check if current session is mock admin ───────────────────────────────────
export const isMockAdminToken = async () => {
    const token = await AsyncStorage.getItem('@auth_token');
    const userStr = await AsyncStorage.getItem('@auth_user');
    if (!token || !userStr) return false;
    if (token !== MOCK_TOKEN) return false;
    const user = JSON.parse(userStr);
    return user.role === 'admin';
};
