/**
 * authStore.ts
 * Persistent user registry using AsyncStorage.
 * Stores all registered users with hashed passwords.
 * Swap these functions with real API calls when backend is ready.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const USERS_KEY = '@users_store';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface StoredUser {
    _id: string;
    name: string;
    phone: string;       // 10-digit, unique primary key
    email: string;       // for forgot password
    passwordHash: string;
    createdAt: string;
}

// ─── Simple hash (not cryptographic — fine for local mock) ────────────────────
// In production this would be bcrypt on the server; phone never exposed.
const hashPassword = (password: string, salt: string): string => {
    // XOR-based simple hash — deterministic, not reversible from UI
    let result = '';
    for (let i = 0; i < password.length; i++) {
        result += String.fromCharCode(
            password.charCodeAt(i) ^ salt.charCodeAt(i % salt.length)
        );
    }
    return btoa(result + '|' + salt);
};

const makeHash = (password: string, phone: string) => hashPassword(password, phone + '_returf_salt');

// ─── Load / Save helpers ──────────────────────────────────────────────────────
const loadUsers = async (): Promise<StoredUser[]> => {
    try {
        const raw = await AsyncStorage.getItem(USERS_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
};

const saveUsers = async (users: StoredUser[]): Promise<void> => {
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
};

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Register a new user.
 * Returns { success: true, user } or { success: false, message }
 */
export const registerUser = async (data: {
    name: string;
    phone: string;
    email: string;
    password: string;
}): Promise<{ success: boolean; user?: StoredUser; message?: string }> => {
    const users = await loadUsers();

    // Check duplicate phone
    if (users.find((u) => u.phone === data.phone)) {
        return { success: false, message: 'An account with this phone number already exists.' };
    }

    // Check duplicate email
    if (users.find((u) => u.email.toLowerCase() === data.email.toLowerCase())) {
        return { success: false, message: 'An account with this email already exists.' };
    }

    const newUser: StoredUser = {
        _id: `user_${Date.now()}`,
        name: data.name.trim(),
        phone: data.phone,
        email: data.email.trim().toLowerCase(),
        passwordHash: makeHash(data.password, data.phone),
        createdAt: new Date().toISOString(),
    };

    await saveUsers([...users, newUser]);
    return { success: true, user: newUser };
};

/**
 * Verify phone + password.
 * Returns { success: true, user } or { success: false, message }
 */
export const loginUser = async (
    phone: string,
    password: string
): Promise<{ success: boolean; user?: StoredUser; message?: string }> => {
    const users = await loadUsers();
    const user = users.find((u) => u.phone === phone);

    if (!user) {
        return { success: false, message: 'No account found with this phone number.' };
    }

    const hash = makeHash(password, phone);
    if (hash !== user.passwordHash) {
        return { success: false, message: 'Incorrect password. Please try again.' };
    }

    return { success: true, user };
};

/**
 * Find user by email (for forgot-password flow).
 */
export const getUserByEmail = async (
    email: string
): Promise<StoredUser | null> => {
    const users = await loadUsers();
    return users.find((u) => u.email === email.trim().toLowerCase()) ?? null;
};

/**
 * Update user's password (after reset).
 */
export const updateUserPassword = async (
    email: string,
    newPassword: string
): Promise<{ success: boolean; message?: string }> => {
    const users = await loadUsers();
    const idx = users.findIndex((u) => u.email === email.trim().toLowerCase());
    if (idx === -1) return { success: false, message: 'User not found.' };

    users[idx] = {
        ...users[idx],
        passwordHash: makeHash(newPassword, users[idx].phone),
    };

    await saveUsers(users);
    return { success: true };
};
