// ─── Mock Admin API ──────────────────────────────────────────────────────────
// Fully self-contained mock. No backend required.
// All bookings are persisted via AsyncStorage (services/bookingStore.ts)
// so user bookings → admin panel, and admin changes → user side, always in sync.
// Admin credentials: phone = 9999999999, password = admin123

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    loadAllBookings,
    addBookingToStore,
    updateBookingInStore,
    getBookingsByStatus,
    getBookingsForUser,
    StoredBooking,
} from './bookingStore';

// ─── Mock Credentials ────────────────────────────────────────────────────────
export const MOCK_ADMIN = {
    _id: 'admin_001',
    name: 'Admin User',
    phone: '9999999999',
    password: 'admin123',
    role: 'admin',
};
export const MOCK_TOKEN = 'mock_admin_jwt_token_returff';

// ─── Mock Venues (in-memory – admin can CRUD these) ──────────────────────────
let venues = [
    {
        _id: 'venue_001',
        name: 'Nine Star Turf',
        description: 'Premium football & cricket ground with floodlights.',
        location: { address: 'Sector 17, Kharghar, Navi Mumbai' },
        sports: [
            { name: 'Football', icon: 'soccer', surface: 'Astro Turf' },
            { name: 'Cricket', icon: 'cricket', surface: 'Matting' },
        ],
        amenities: ['Floodlights', 'Parking', 'Changing Rooms', 'Drinking Water'],
        images: [],
        pricePerHour: 800,
        rating: 4.5,
        reviewsCount: 120,
        isActive: true,
        operatingHours: { start: 6, end: 23 },
        createdAt: '2025-01-10T10:00:00.000Z',
    },
    {
        _id: 'venue_002',
        name: 'Green Valley Arena',
        description: 'Multi-sport indoor facility for badminton and basketball.',
        location: { address: 'Seawoods, Navi Mumbai' },
        sports: [
            { name: 'Badminton', icon: 'badminton', surface: 'Wooden' },
            { name: 'Basketball', icon: 'basketball', surface: 'Hardwood' },
        ],
        amenities: ['Air Conditioning', 'Parking', 'Cafeteria'],
        images: [],
        pricePerHour: 600,
        rating: 4.2,
        reviewsCount: 85,
        isActive: true,
        operatingHours: { start: 6, end: 22 },
        createdAt: '2025-02-01T10:00:00.000Z',
    },
    {
        _id: 'venue_003',
        name: 'Champions Cricket Ground',
        description: 'Full-size cricket turf with professional pitch.',
        location: { address: 'Panvel, Navi Mumbai' },
        sports: [{ name: 'Cricket', icon: 'cricket', surface: 'Grass' }],
        amenities: ['Floodlights', 'Pavilion', 'Scoreboard'],
        images: [],
        pricePerHour: 1200,
        rating: 4.8,
        reviewsCount: 200,
        isActive: false,
        operatingHours: { start: 7, end: 21 },
        createdAt: '2024-12-01T10:00:00.000Z',
    },
];

// ─── Mock Users (in-memory) ──────────────────────────────────────────────────
let users = [
    { _id: 'user_001', name: 'Rahul Sharma', phone: '9876543210', role: 'user', isBlocked: false, createdAt: '2025-01-15T10:00:00.000Z' },
    { _id: 'user_002', name: 'Priya Patel', phone: '9123456789', role: 'user', isBlocked: false, createdAt: '2025-01-20T10:00:00.000Z' },
    { _id: 'user_003', name: 'Arjun Mehta', phone: '9988776655', role: 'user', isBlocked: true, createdAt: '2025-02-01T10:00:00.000Z' },
    { _id: 'user_004', name: 'Sneha Gupta', phone: '9912345678', role: 'user', isBlocked: false, createdAt: '2025-02-05T10:00:00.000Z' },
    { _id: 'user_005', name: 'Admin User', phone: '9999999999', role: 'admin', isBlocked: false, createdAt: '2024-12-01T10:00:00.000Z' },
];

// ─── Mock Notifications (in-memory) ─────────────────────────────────────────
let notifications = [
    {
        _id: 'notif_001',
        title: 'Weekend Special Offer! 🎉',
        message: 'Book any turf this weekend and get 20% off on your next booking.',
        type: 'promo',
        isGlobal: true,
        readBy: [],
        createdBy: { name: 'Admin User' },
        createdAt: '2026-02-21T10:00:00.000Z',
    },
    {
        _id: 'notif_002',
        title: 'New Venue Added ✅',
        message: 'Champions Cricket Ground is now available for booking in Panvel.',
        type: 'info',
        isGlobal: true,
        readBy: ['user_001', 'user_002'],
        createdBy: { name: 'Admin User' },
        createdAt: '2026-02-20T09:00:00.000Z',
    },
    {
        _id: 'notif_003',
        title: 'Maintenance Alert ⚠️',
        message: 'Nine Star Turf will be unavailable on 25th Feb for maintenance.',
        type: 'warning',
        isGlobal: true,
        readBy: [],
        createdBy: { name: 'Admin User' },
        createdAt: '2026-02-19T11:00:00.000Z',
    },
];

// ─── Slot Cache (in-memory) ──────────────────────────────────────────────────
let slotCache: Record<string, any[]> = {};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

const formatHour = (hour: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const h = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${h}:00 ${period}`;
};

const generateMockSlots = (venueId: string, date: string, price: number) => {
    const slots = [];
    const bookedHours = [8, 9, 14, 17];
    for (let hour = 6; hour < 23; hour++) {
        slots.push({
            _id: `slot_${venueId}_${date}_${hour}`,
            venueId,
            date,
            startTime: formatHour(hour),
            endTime: formatHour(hour + 1),
            price,
            isAvailable: !bookedHours.includes(hour),
            isBlocked: hour === 12,
        });
    }
    return slots;
};

// ─── Mock Auth ───────────────────────────────────────────────────────────────
export const mockAdminLogin = async (phone: string, password: string) => {
    await delay(800);
    if (phone === MOCK_ADMIN.phone && password === MOCK_ADMIN.password) {
        return { success: true, token: MOCK_TOKEN, user: MOCK_ADMIN };
    }
    return { success: false, message: 'Invalid phone or password.' };
};

export const isMockAdminToken = async () => {
    const token = await AsyncStorage.getItem('@auth_token');
    const userStr = await AsyncStorage.getItem('@auth_user');
    if (!token || !userStr) return false;
    if (token !== MOCK_TOKEN) return false;
    const user = JSON.parse(userStr);
    return user.role === 'admin';
};

// ─── Mock Admin API ───────────────────────────────────────────────────────────
export const mockAdminApi = {
    // ── Dashboard ──────────────────────────────────────────────────────────────
    getDashboard: async () => {
        await delay();
        const bookings = await loadAllBookings();
        const todayStr = new Date().toISOString().split('T')[0];
        const todayBookings = bookings.filter((b) => b.date === todayStr);
        const revenue = bookings
            .filter((b) => b.paymentStatus === 'paid')
            .reduce((sum, b) => sum + b.totalAmount, 0);
        return {
            success: true,
            data: {
                stats: {
                    totalUsers: users.filter((u) => u.role === 'user').length,
                    totalVenues: venues.filter((v) => v.isActive).length,
                    totalBookings: bookings.length,
                    todayBookings: todayBookings.length,
                    pendingBookings: bookings.filter((b) => b.status === 'pending').length,
                    totalRevenue: revenue,
                },
                recentBookings: bookings.slice(0, 5),
            },
        };
    },

    // ── Venues ────────────────────────────────────────────────────────────────
    getVenues: async () => { await delay(); return { success: true, data: venues }; },
    getVenueById: async (id: string) => {
        await delay();
        const v = venues.find((v) => v._id === id);
        return v ? { success: true, data: v } : { success: false, message: 'Not found' };
    },
    createVenue: async (body: any) => {
        await delay();
        const newVenue = { ...body, _id: `venue_${Date.now()}`, rating: 0, reviewsCount: 0, isActive: true, createdAt: new Date().toISOString() };
        venues = [newVenue, ...venues];
        return { success: true, data: newVenue };
    },
    updateVenue: async (id: string, body: any) => {
        await delay();
        venues = venues.map((v) => v._id === id ? { ...v, ...body } : v);
        return { success: true, data: venues.find((v) => v._id === id) };
    },
    deleteVenue: async (id: string) => {
        await delay();
        venues = venues.filter((v) => v._id !== id);
        return { success: true, message: 'Venue deleted' };
    },
    toggleVenueActive: async (id: string) => {
        await delay();
        venues = venues.map((v) => v._id === id ? { ...v, isActive: !v.isActive } : v);
        return { success: true, data: venues.find((v) => v._id === id) };
    },

    // ── Slots ─────────────────────────────────────────────────────────────────
    getSlots: async (venueId?: string, date?: string) => {
        await delay();
        if (!venueId || !date) return { success: true, data: [] };
        const key = `${venueId}_${date}`;
        const venue = venues.find((v) => v._id === venueId);
        if (!slotCache[key]) slotCache[key] = generateMockSlots(venueId, date, venue?.pricePerHour || 500);
        return { success: true, data: slotCache[key] };
    },
    bulkGenerateSlots: async (body: { venueId: string; date: string; price: number }) => {
        await delay(600);
        const key = `${body.venueId}_${body.date}`;
        slotCache[key] = generateMockSlots(body.venueId, body.date, body.price);
        return { success: true, message: `Generated ${slotCache[key].length} slots for ${body.date}`, data: slotCache[key] };
    },
    createSlot: async (body: any) => {
        await delay();
        const slot = { ...body, _id: `slot_${Date.now()}` };
        const key = `${body.venueId}_${body.date}`;
        slotCache[key] = [...(slotCache[key] || []), slot];
        return { success: true, data: slot };
    },
    updateSlot: async (id: string, body: any) => {
        await delay();
        for (const key of Object.keys(slotCache)) {
            slotCache[key] = slotCache[key].map((s) => s._id === id ? { ...s, ...body } : s);
        }
        return { success: true, data: { _id: id, ...body } };
    },
    toggleSlotBlock: async (id: string) => {
        await delay();
        let updated: any = null;
        for (const key of Object.keys(slotCache)) {
            slotCache[key] = slotCache[key].map((s) => {
                if (s._id === id) { updated = { ...s, isBlocked: !s.isBlocked, isAvailable: s.isBlocked }; return updated; }
                return s;
            });
        }
        return { success: true, data: updated };
    },
    deleteSlot: async (id: string) => {
        await delay();
        for (const key of Object.keys(slotCache)) slotCache[key] = slotCache[key].filter((s) => s._id !== id);
        return { success: true, message: 'Slot deleted' };
    },

    // ── Bookings — now fully persistent ──────────────────────────────────────
    getBookings: async (status?: string) => {
        await delay();
        const data = await getBookingsByStatus(status || 'all');
        return { success: true, data };
    },
    getBookingById: async (id: string) => {
        await delay();
        const all = await loadAllBookings();
        const b = all.find((b) => b._id === id);
        return b ? { success: true, data: b } : { success: false, message: 'Not found' };
    },
    updateBookingStatus: async (
        id: string,
        body: { status?: string; paymentStatus?: string; adminNote?: string }
    ) => {
        await delay();
        const updated = await updateBookingInStore(id, body as Partial<StoredBooking>);
        return updated
            ? { success: true, data: updated }
            : { success: false, message: 'Booking not found' };
    },

    // ── Users ─────────────────────────────────────────────────────────────────
    getUsers: async () => { await delay(); return { success: true, data: users }; },
    getUserById: async (id: string) => {
        await delay();
        const u = users.find((u) => u._id === id);
        return u ? { success: true, data: u } : { success: false, message: 'Not found' };
    },
    getUserBookings: async (id: string) => {
        await delay();
        const data = await getBookingsForUser(id);
        return { success: true, data };
    },
    toggleBlockUser: async (id: string) => {
        await delay();
        users = users.map((u) => u._id === id ? { ...u, isBlocked: !u.isBlocked } : u);
        return { success: true, data: users.find((u) => u._id === id) };
    },
    promoteToAdmin: async (id: string) => {
        await delay();
        users = users.map((u) => u._id === id ? { ...u, role: 'admin' } : u);
        return { success: true, data: users.find((u) => u._id === id) };
    },

    // ── Notifications ─────────────────────────────────────────────────────────
    getNotifications: async () => { await delay(); return { success: true, data: notifications }; },
    createNotification: async (body: any) => {
        await delay();
        const n = { ...body, _id: `notif_${Date.now()}`, readBy: [], createdBy: { name: 'Admin User' }, createdAt: new Date().toISOString() };
        notifications = [n, ...notifications];
        return { success: true, data: n };
    },
    deleteNotification: async (id: string) => {
        await delay();
        notifications = notifications.filter((n) => n._id !== id);
        return { success: true, message: 'Notification deleted' };
    },
};

// ─── Shared User-Facing Booking Functions ────────────────────────────────────
// createUserBooking: writes to the SAME AsyncStorage store the admin reads.
// getUserBookingList: reads from the SAME store, filtered by userId.

export const createUserBooking = async (body: {
    venueId: string;
    venueName: string;
    venueLocation?: string;
    date: string;
    startTime: string;
    endTime: string;
    sport?: string;
    totalAmount: number;
    userName?: string;
    userPhone?: string;
    userId?: string;
}) => {
    await delay(500);

    // Pull real user info from AsyncStorage if not explicitly provided
    let resolvedUserName = body.userName || 'Guest';
    let resolvedUserPhone = body.userPhone || '';
    let resolvedUserId = body.userId || `user_${Date.now()}`;

    try {
        const userStr = await AsyncStorage.getItem('@auth_user');
        if (userStr) {
            const authUser = JSON.parse(userStr);
            if (!body.userName && authUser.name) resolvedUserName = authUser.name;
            if (!body.userPhone && authUser.phone) resolvedUserPhone = authUser.phone;
            if (!body.userId && authUser._id) resolvedUserId = authUser._id;
        }
    } catch (_) {
        // Silently ignore — use fallback values above
    }

    const newBooking: StoredBooking = {
        _id: `booking_${Date.now()}`,
        venueName: body.venueName,
        venueLocation: body.venueLocation || '',
        venueId: { _id: body.venueId, name: body.venueName },
        userId: { _id: resolvedUserId, name: resolvedUserName, phone: resolvedUserPhone },
        date: body.date,
        startTime: body.startTime,
        endTime: body.endTime,
        sport: body.sport || 'General',
        status: 'pending',
        paymentStatus: 'unpaid',
        totalAmount: body.totalAmount,
        userName: resolvedUserName,
        userPhone: resolvedUserPhone,
        createdAt: new Date().toISOString(),
    };

    // Persist to AsyncStorage — admin panel will see this immediately on next load
    await addBookingToStore(newBooking);

    // Also mark the slot as unavailable in slot cache (in-memory, per session)
    const slotKey = `${body.venueId}_${body.date}`;
    if (slotCache[slotKey]) {
        slotCache[slotKey] = slotCache[slotKey].map((s) =>
            s.startTime === body.startTime ? { ...s, isAvailable: false } : s
        );
    }

    return { success: true, data: newBooking };
};

export const getUserBookingList = async (userId?: string) => {
    await delay(300);
    if (userId) {
        const data = await getBookingsForUser(userId);
        return { success: true, data };
    }
    // No userId (demo / not logged in) — return all bookings
    const data = await loadAllBookings();
    return { success: true, data };
};
