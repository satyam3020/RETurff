import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Configuration ────────────────────────────────────────────────────────────
// Physical device on same WiFi: use your machine's current IPv4
// Android emulator:             http://10.0.2.2:5000/api
// iOS simulator:                http://localhost:5000/api
const BASE_URL = 'http://10.185.49.150:5000/api';

// ─── Token Helpers ────────────────────────────────────────────────────────────
export const saveAuthData = async (token: string, user: any) => {
    await AsyncStorage.setItem('@auth_token', token);
    await AsyncStorage.setItem('@auth_user', JSON.stringify(user));
};

export const getAuthToken = async (): Promise<string | null> => {
    return AsyncStorage.getItem('@auth_token');
};

export const getAuthUser = async (): Promise<any | null> => {
    const str = await AsyncStorage.getItem('@auth_user');
    return str ? JSON.parse(str) : null;
};

export const clearAuthData = async () => {
    await AsyncStorage.multiRemove(['@auth_token', '@auth_user']);
};

// ─── Base Fetch Utility ───────────────────────────────────────────────────────
const apiFetch = async (
    endpoint: string,
    options: RequestInit = {},
    authenticated = true
): Promise<any> => {
    const headers: HeadersInit = { 'Content-Type': 'application/json', ...(options.headers || {}) };

    if (authenticated) {
        const token = await getAuthToken();
        if (token) (headers as any)['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            ...options,
            headers,
        });
        const data = await response.json();
        return data;
    } catch (err: any) {
        // Network error — backend unreachable
        console.error(`[API] ${endpoint} failed:`, err?.message);
        return { success: false, message: 'Network error. Make sure backend is running and phone is on same WiFi.' };
    }
};

// ─── Auth API ─────────────────────────────────────────────────────────────────
export const authApi = {
    register: (body: { name: string; phone: string; email: string; password: string }) =>
        apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(body) }, false),

    login: (body: { phone: string; password: string }) =>
        apiFetch('/auth/login', { method: 'POST', body: JSON.stringify(body) }, false),

    forgotPassword: (email: string) =>
        apiFetch('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }, false),

    resetPassword: (body: { email: string; otp: string; newPassword: string }) =>
        apiFetch('/auth/reset-password', { method: 'POST', body: JSON.stringify(body) }, false),

    getMe: () => apiFetch('/auth/me'),
};

// ─── User API ─────────────────────────────────────────────────────────────────
export const userApi = {
    getProfile: () => apiFetch('/user/profile'),

    updateProfile: (body: { name?: string; preferences?: any }) =>
        apiFetch('/user/profile', { method: 'PUT', body: JSON.stringify(body) }),

    getVenues: () => apiFetch('/user/venues'),

    getAvailableSlots: (venueId: string, date: string) =>
        apiFetch(`/user/venues/${venueId}/slots?date=${date}`),

    getMyBookings: () => apiFetch('/user/bookings'),

    createBooking: (body: {
        venueId: string;
        slotId: string;
        date: string;
        startTime: string;
        endTime: string;
        sport?: string;
        surface?: string;
        totalAmount: number;
    }) => apiFetch('/user/bookings', { method: 'POST', body: JSON.stringify(body) }),

    getNotifications: () => apiFetch('/user/notifications'),

    markNotificationRead: (id: string) =>
        apiFetch(`/user/notifications/${id}/read`, { method: 'PATCH' }),
};

// ─── Admin API — Real Backend ─────────────────────────────────────────────────
export const adminApi = {
    // Dashboard
    getDashboard: () => apiFetch('/admin/dashboard'),

    // Venues
    getVenues: () => apiFetch('/admin/venues'),
    getVenueById: (id: string) => apiFetch(`/admin/venues/${id}`),
    createVenue: (body: any) =>
        apiFetch('/admin/venues', { method: 'POST', body: JSON.stringify(body) }),
    updateVenue: (id: string, body: any) =>
        apiFetch(`/admin/venues/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    deleteVenue: (id: string) =>
        apiFetch(`/admin/venues/${id}`, { method: 'DELETE' }),
    toggleVenueActive: (id: string) =>
        apiFetch(`/admin/venues/${id}/toggle`, { method: 'PATCH' }),

    // Slots
    getSlots: (venueId?: string, date?: string) => {
        const params = new URLSearchParams();
        if (venueId) params.append('venueId', venueId);
        if (date) params.append('date', date);
        return apiFetch(`/admin/slots?${params.toString()}`);
    },
    bulkGenerateSlots: (body: { venueId: string; date: string; price: number; sport?: string; surface?: string }) =>
        apiFetch('/admin/slots/bulk-generate', { method: 'POST', body: JSON.stringify(body) }),
    createSlot: (body: any) =>
        apiFetch('/admin/slots', { method: 'POST', body: JSON.stringify(body) }),
    updateSlot: (id: string, body: any) =>
        apiFetch(`/admin/slots/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    toggleSlotBlock: (id: string) =>
        apiFetch(`/admin/slots/${id}/block`, { method: 'PATCH' }),
    deleteSlot: (id: string) =>
        apiFetch(`/admin/slots/${id}`, { method: 'DELETE' }),

    // Bookings
    getBookings: (status?: string) => {
        const params = status && status !== 'all' ? `?status=${status}` : '';
        return apiFetch(`/admin/bookings${params}`);
    },
    getBookingById: (id: string) => apiFetch(`/admin/bookings/${id}`),
    updateBookingStatus: (id: string, body: { status?: string; paymentStatus?: string; adminNote?: string }) =>
        apiFetch(`/admin/bookings/${id}`, { method: 'PUT', body: JSON.stringify(body) }),

    // Users
    getUsers: () => apiFetch('/admin/users'),
    getUserById: (id: string) => apiFetch(`/admin/users/${id}`),
    getUserBookings: (id: string) => apiFetch(`/admin/users/${id}/bookings`),
    toggleBlockUser: (id: string) =>
        apiFetch(`/admin/users/${id}/block`, { method: 'PATCH' }),
    promoteToAdmin: (id: string) =>
        apiFetch(`/admin/users/${id}/promote`, { method: 'PATCH' }),

    // Notifications
    getNotifications: () => apiFetch('/admin/notifications'),
    createNotification: (body: any) =>
        apiFetch('/admin/notifications', { method: 'POST', body: JSON.stringify(body) }),
    deleteNotification: (id: string) =>
        apiFetch(`/admin/notifications/${id}`, { method: 'DELETE' }),
};

// ─── User-Facing API Helpers ──────────────────────────────────────────────────
// These call the real backend and are used by user-side screens and BookingContext.

/** Get all active venues (normalizes _id → id for frontend compatibility) */
export const getVenues = async () => {
    const res = await userApi.getVenues();
    if (res.success && Array.isArray(res.data)) {
        res.data = res.data.map((v: any) => ({
            ...v,
            id: v._id || v.id,                     // ensure venue.id works in VenueListingCard
            location: v.location?.address || v.location || '',
            rating: v.rating ?? 4.5,
            reviews: v.totalReviews ?? 0,
        }));
    }
    return res;
};

/** Get a single venue by ID */
export const getTurfDetails = async (id: string) => {
    const res = await userApi.getVenues();
    if (!res.success) return { success: false, error: 'Could not load venues' };
    const venue = (res.data as any[]).find((v: any) => v._id === id || v.id === id);
    return venue
        ? { success: true, data: venue }
        : { success: false, error: 'Venue not found' };
};

/** Get available slots for a venue on a date */
export const getAvailableSlots = async (venueId: string, date: string) => {
    return userApi.getAvailableSlots(venueId, date);
};

/** Create a booking (called from BookingContext or summary screen) */
export const createBooking = async (body: {
    venueId: string;
    slotId: string;
    venueName?: string;
    venueLocation?: string;
    date: string;
    startTime: string;
    endTime: string;
    sport?: string;
    surface?: string;
    totalAmount: number;
}) => {
    return userApi.createBooking(body);
};

/** Get current user's bookings */
export const getUserBookings = async (_userId?: string) => {
    return userApi.getMyBookings();
};

export const updateUserProfile = async (data: any) => {
    return userApi.updateProfile(data);
};
