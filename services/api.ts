import AsyncStorage from '@react-native-async-storage/async-storage';
import { mockAdminApi, createUserBooking, getUserBookingList } from './adminMockApi';

// ─── Configuration ────────────────────────────────────────────────────────────
// Physical device on same WiFi as this machine (IP: 10.216.216.122)
// Android emulator: http://10.0.2.2:5000/api
// iOS simulator:    http://localhost:5000/api
const BASE_URL = 'http://10.216.216.122:5000/api';

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

    const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    const data = await response.json();
    return data;
};

// ─── Auth API ─────────────────────────────────────────────────────────────────
export const authApi = {
    register: (body: { name: string; phone: string; password: string }) =>
        apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(body) }, false),

    login: (body: { phone: string; password: string }) =>
        apiFetch('/auth/login', { method: 'POST', body: JSON.stringify(body) }, false),

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

// ─── Admin API — MOCK MODE (no backend required) ─────────────────────────────
// Swap this line to `adminApi = { ...real fetch calls... }` when connecting backend
export const adminApi = mockAdminApi;



// ─── User-facing mock data ────────────────────────────────────────────────────
// Matches the `Turf` interface in types/index.ts: id, name, description,
// location (string), pricePerHour, images, amenities, rating, reviews
const MOCK_TURF_LIST = [
    {
        id: 'venue_001',
        name: 'Nine Star Turf',
        description: 'Premium football & cricket ground with floodlights and ample parking.',
        location: 'Sector 17, Kharghar, Navi Mumbai',
        pricePerHour: 800,
        images: [],
        amenities: ['Floodlights', 'Parking', 'Changing Rooms', 'Drinking Water'],
        rating: 4.5,
        reviews: 120,
        sports: [{ name: 'Football' }, { name: 'Cricket' }],
        isActive: true,
    },
    {
        id: 'venue_002',
        name: 'Green Valley Arena',
        description: 'Indoor multi-sport facility with AC courts for badminton and basketball.',
        location: 'Seawoods, Navi Mumbai',
        pricePerHour: 600,
        images: [],
        amenities: ['Air Conditioning', 'Parking', 'Cafeteria', 'Pro Shop'],
        rating: 4.2,
        reviews: 85,
        sports: [{ name: 'Badminton' }, { name: 'Basketball' }],
        isActive: true,
    },
    {
        id: 'venue_003',
        name: 'Champions Cricket Ground',
        description: 'Full-size professional cricket ground with natural grass pitch and pavilion.',
        location: 'Panvel, Navi Mumbai',
        pricePerHour: 1200,
        images: [],
        amenities: ['Floodlights', 'Pavilion', 'Scoreboard', 'Parking'],
        rating: 4.8,
        reviews: 200,
        sports: [{ name: 'Cricket' }],
        isActive: true,
    },
    {
        id: 'venue_004',
        name: 'PowerPlay Sports Hub',
        description: 'State of the art synthetic turf with FIFA-certified surface.',
        location: 'Vashi, Navi Mumbai',
        pricePerHour: 900,
        images: [],
        amenities: ['FIFA Turf', 'Floodlights', 'Cafeteria', 'First Aid'],
        rating: 4.6,
        reviews: 150,
        sports: [{ name: 'Football' }, { name: 'Hockey' }],
        isActive: true,
    },
    {
        id: 'venue_005',
        name: 'Ace Badminton Centre',
        description: 'Olympic-grade badminton courts with professional lighting and equipment.',
        location: 'Nerul, Navi Mumbai',
        pricePerHour: 450,
        images: [],
        amenities: ['Olympic Courts', 'Equipment Rental', 'Coach Available', 'Locker Room'],
        rating: 4.3,
        reviews: 92,
        sports: [{ name: 'Badminton' }],
        isActive: true,
    },
];

const MOCK_SLOTS: Record<string, any[]> = {};

const formatHour = (h: number) => {
    const p = h >= 12 ? 'PM' : 'AM';
    const display = h > 12 ? h - 12 : h === 0 ? 12 : h;
    return `${display}:00 ${p}`;
};

const buildSlots = (venueId: string, date: string, price: number) => {
    const key = `${venueId}_${date}`;
    if (!MOCK_SLOTS[key]) {
        MOCK_SLOTS[key] = Array.from({ length: 17 }, (_, i) => ({
            id: `${key}_${i + 6}`,
            startTime: formatHour(i + 6),
            endTime: formatHour(i + 7),
            date,
            isAvailable: ![8, 9, 14, 17].includes(i + 6),
            price,
        }));
    }
    return MOCK_SLOTS[key];
};

// ─── Legacy compatibility shims (now fully mock — no backend) ─────────────────
export const getVenues = async () => ({
    success: true,
    data: MOCK_TURF_LIST,
});

export const getTurfDetails = async (id: string) => {
    const venue = MOCK_TURF_LIST.find((v) => v.id === id);
    return venue
        ? { success: true, data: venue }
        : { success: false, error: 'Venue not found' };
};

export const getAvailableSlots = async (venueId: string, date: string) => {
    const venue = MOCK_TURF_LIST.find((v) => v.id === venueId);
    const price = venue?.pricePerHour || 500;
    return { success: true, data: buildSlots(venueId, date, price) };
};

// createBooking — writes into the shared admin mock store
export const createBooking = createUserBooking;

// getUserBookings — reads from the same shared store (so admin status changes appear here)
export const getUserBookings = getUserBookingList;

export const updateUserProfile = async (data: any) => ({
    success: true,
    data,
});

