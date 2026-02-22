// ─── Mock Admin API ──────────────────────────────────────────────────────────
// Fully self-contained mock data. No backend required.
// Admin credentials: phone = 9999999999, password = admin123

import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Mock Credentials ────────────────────────────────────────────────────────
export const MOCK_ADMIN = {
    _id: 'admin_001',
    name: 'Admin User',
    phone: '9999999999',
    password: 'admin123',
    role: 'admin',
};
export const MOCK_TOKEN = 'mock_admin_jwt_token_returff';

// ─── Mock Data ───────────────────────────────────────────────────────────────

const MOCK_VENUES = [
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
        sports: [
            { name: 'Cricket', icon: 'cricket', surface: 'Grass' },
        ],
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

const MOCK_USERS = [
    { _id: 'user_001', name: 'Rahul Sharma', phone: '9876543210', role: 'user', isBlocked: false, createdAt: '2025-01-15T10:00:00.000Z' },
    { _id: 'user_002', name: 'Priya Patel', phone: '9123456789', role: 'user', isBlocked: false, createdAt: '2025-01-20T10:00:00.000Z' },
    { _id: 'user_003', name: 'Arjun Mehta', phone: '9988776655', role: 'user', isBlocked: true, createdAt: '2025-02-01T10:00:00.000Z' },
    { _id: 'user_004', name: 'Sneha Gupta', phone: '9912345678', role: 'user', isBlocked: false, createdAt: '2025-02-05T10:00:00.000Z' },
    { _id: 'user_005', name: 'Admin User', phone: '9999999999', role: 'admin', isBlocked: false, createdAt: '2024-12-01T10:00:00.000Z' },
];

const MOCK_BOOKINGS = [
    {
        _id: 'booking_001',
        venueName: 'Nine Star Turf',
        venueLocation: 'Sector 17, Kharghar',
        userId: { _id: 'user_001', name: 'Rahul Sharma', phone: '9876543210' },
        venueId: { _id: 'venue_001', name: 'Nine Star Turf' },
        date: '2026-02-22',
        startTime: '6:00 AM',
        endTime: '7:00 AM',
        sport: 'Football',
        status: 'pending',
        paymentStatus: 'unpaid',
        totalAmount: 800,
        userName: 'Rahul Sharma',
        userPhone: '9876543210',
        createdAt: '2026-02-22T04:30:00.000Z',
    },
    {
        _id: 'booking_002',
        venueName: 'Green Valley Arena',
        venueLocation: 'Seawoods, Navi Mumbai',
        userId: { _id: 'user_002', name: 'Priya Patel', phone: '9123456789' },
        venueId: { _id: 'venue_002', name: 'Green Valley Arena' },
        date: '2026-02-22',
        startTime: '8:00 AM',
        endTime: '9:00 AM',
        sport: 'Badminton',
        status: 'approved',
        paymentStatus: 'paid',
        totalAmount: 600,
        userName: 'Priya Patel',
        userPhone: '9123456789',
        createdAt: '2026-02-21T18:00:00.000Z',
    },
    {
        _id: 'booking_003',
        venueName: 'Nine Star Turf',
        venueLocation: 'Sector 17, Kharghar',
        userId: { _id: 'user_004', name: 'Sneha Gupta', phone: '9912345678' },
        venueId: { _id: 'venue_001', name: 'Nine Star Turf' },
        date: '2026-02-20',
        startTime: '5:00 PM',
        endTime: '6:00 PM',
        sport: 'Cricket',
        status: 'completed',
        paymentStatus: 'paid',
        totalAmount: 800,
        userName: 'Sneha Gupta',
        userPhone: '9912345678',
        createdAt: '2026-02-20T08:00:00.000Z',
    },
    {
        _id: 'booking_004',
        venueName: 'Green Valley Arena',
        venueLocation: 'Seawoods, Navi Mumbai',
        userId: { _id: 'user_003', name: 'Arjun Mehta', phone: '9988776655' },
        venueId: { _id: 'venue_002', name: 'Green Valley Arena' },
        date: '2026-02-19',
        startTime: '10:00 AM',
        endTime: '11:00 AM',
        sport: 'Basketball',
        status: 'cancelled',
        paymentStatus: 'refunded',
        totalAmount: 600,
        userName: 'Arjun Mehta',
        userPhone: '9988776655',
        createdAt: '2026-02-18T14:00:00.000Z',
    },
    {
        _id: 'booking_005',
        venueName: 'Nine Star Turf',
        venueLocation: 'Sector 17, Kharghar',
        userId: { _id: 'user_001', name: 'Rahul Sharma', phone: '9876543210' },
        venueId: { _id: 'venue_001', name: 'Nine Star Turf' },
        date: '2026-02-22',
        startTime: '7:00 PM',
        endTime: '8:00 PM',
        sport: 'Football',
        status: 'pending',
        paymentStatus: 'unpaid',
        totalAmount: 800,
        userName: 'Rahul Sharma',
        userPhone: '9876543210',
        createdAt: '2026-02-22T06:00:00.000Z',
    },
];

const MOCK_NOTIFICATIONS = [
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

// Helper to generate slots for a venue/date
const formatHour = (hour: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const h = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${h}:00 ${period}`;
};

const generateMockSlots = (venueId: string, date: string, price: number) => {
    const slots = [];
    const bookedHours = [8, 9, 14, 17]; // Some pre-booked hours
    for (let hour = 6; hour < 23; hour++) {
        slots.push({
            _id: `slot_${venueId}_${date}_${hour}`,
            venueId,
            date,
            startTime: formatHour(hour),
            endTime: formatHour(hour + 1),
            price,
            isAvailable: !bookedHours.includes(hour),
            isBlocked: hour === 12, // Lunch hour blocked
        });
    }
    return slots;
};

// ─── In-Memory State (mutated by admin actions) ──────────────────────────────
let venues = [...MOCK_VENUES];
let users = [...MOCK_USERS];
let bookings = [...MOCK_BOOKINGS];
let notifications = [...MOCK_NOTIFICATIONS];
let slotCache: Record<string, any[]> = {};

const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

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
    // Dashboard
    getDashboard: async () => {
        await delay();
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

    // Venues
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

    // Slots
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

    // Bookings
    getBookings: async (status?: string) => {
        await delay();
        const data = status ? bookings.filter((b) => b.status === status) : bookings;
        return { success: true, data };
    },
    getBookingById: async (id: string) => {
        await delay();
        const b = bookings.find((b) => b._id === id);
        return b ? { success: true, data: b } : { success: false, message: 'Not found' };
    },
    updateBookingStatus: async (id: string, body: { status?: string; paymentStatus?: string; adminNote?: string }) => {
        await delay();
        bookings = bookings.map((b) => b._id === id ? { ...b, ...body } : b);
        return { success: true, data: bookings.find((b) => b._id === id) };
    },

    // Users
    getUsers: async () => { await delay(); return { success: true, data: users }; },
    getUserById: async (id: string) => {
        await delay();
        const u = users.find((u) => u._id === id);
        return u ? { success: true, data: u } : { success: false, message: 'Not found' };
    },
    getUserBookings: async (id: string) => {
        await delay();
        return { success: true, data: bookings.filter((b) => b.userId._id === id) };
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

    // Notifications
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
// These write/read the same `bookings` array that the admin panel uses.
// This means: user booking → appears in admin panel instantly.
// Admin changes status → user sees updated status on refresh.

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
    const newBooking = {
        _id: `booking_${Date.now()}`,
        venueName: body.venueName,
        venueLocation: body.venueLocation || '',
        userId: { _id: body.userId || 'user_current', name: body.userName || 'You', phone: body.userPhone || '' },
        venueId: { _id: body.venueId, name: body.venueName },
        date: body.date,
        startTime: body.startTime,
        endTime: body.endTime,
        sport: body.sport || 'General',
        status: 'pending' as const,
        paymentStatus: 'unpaid' as const,
        totalAmount: body.totalAmount,
        userName: body.userName || 'You',
        userPhone: body.userPhone || '',
        createdAt: new Date().toISOString(),
    };
    bookings = [newBooking, ...bookings];

    // Mark the booked slot as unavailable in slotCache
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
    // If we have a userId, filter to that user's bookings
    // Otherwise return all (in demo mode without real auth, return all)
    const data = userId
        ? bookings.filter((b) => b.userId?._id === userId)
        : bookings;
    return { success: true, data };
};

