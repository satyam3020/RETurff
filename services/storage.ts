import AsyncStorage from '@react-native-async-storage/async-storage';

// Keys are prefixed to avoid collisions
const KEYS = {
    USER_PROFILE: '@user_profile', // Legacy — kept for backward compat
};

/**
 * Legacy: Save user profile to AsyncStorage
 * @deprecated Prefer userApi.updateProfile() which saves to MongoDB
 */
export const saveUserProfile = async (profile: {
    name: string;
    mobile: string;
    [key: string]: any;
}) => {
    try {
        await AsyncStorage.setItem(KEYS.USER_PROFILE, JSON.stringify(profile));
    } catch (error) {
        console.error('saveUserProfile error:', error);
    }
};

/**
 * Legacy: Retrieve user profile from AsyncStorage
 * @deprecated Prefer userApi.getProfile() which reads from MongoDB
 */
export const getUserProfile = async (): Promise<{ name: string; mobile: string;[key: string]: any } | null> => {
    try {
        const data = await AsyncStorage.getItem(KEYS.USER_PROFILE);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('getUserProfile error:', error);
        return null;
    }
};

/**
 * Legacy: Clear user profile (call after logout)
 */
export const clearUserProfile = async () => {
    try {
        await AsyncStorage.removeItem(KEYS.USER_PROFILE);
    } catch (error) {
        console.error('clearUserProfile error:', error);
    }
};

// NOTE: Booking storage functions have been removed.
// All booking data is now managed by the backend via userApi.createBooking()
// and userApi.getMyBookings(). The BookingContext reads from the API.
