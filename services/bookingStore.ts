/**
 * bookingStore.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Single source of truth for ALL bookings in the app.
 * Both the User side and the Admin panel read/write from this store,
 * so every user booking appears in the admin panel immediately,
 * and admin status changes are reflected on the user side on next refresh.
 *
 * Persistence: AsyncStorage key "@bookings_store"
 * ─────────────────────────────────────────────────────────────────────────────
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORE_KEY = '@bookings_store';

// ─── Booking Type ─────────────────────────────────────────────────────────────
export interface StoredBooking {
    _id: string;
    venueName: string;
    venueLocation: string;
    venueId: { _id: string; name: string };
    userId: { _id: string; name: string; phone: string };
    date: string;
    startTime: string;
    endTime: string;
    sport: string;
    status: 'pending' | 'approved' | 'completed' | 'cancelled' | 'rejected';
    paymentStatus: 'unpaid' | 'paid' | 'refunded';
    totalAmount: number;
    userName: string;
    userPhone: string;
    createdAt: string;
}

// ─── Seed Dummy Data (shown only on very first launch, before any real bookings) ──
const SEED_BOOKINGS: StoredBooking[] = [
    {
        _id: 'booking_seed_001',
        venueName: 'Nine Star Turf',
        venueLocation: 'Sector 17, Kharghar, Navi Mumbai',
        venueId: { _id: 'venue_001', name: 'Nine Star Turf' },
        userId: { _id: 'user_001', name: 'Rahul Sharma', phone: '9876543210' },
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
        _id: 'booking_seed_002',
        venueName: 'Green Valley Arena',
        venueLocation: 'Seawoods, Navi Mumbai',
        venueId: { _id: 'venue_002', name: 'Green Valley Arena' },
        userId: { _id: 'user_002', name: 'Priya Patel', phone: '9123456789' },
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
        _id: 'booking_seed_003',
        venueName: 'Nine Star Turf',
        venueLocation: 'Sector 17, Kharghar',
        venueId: { _id: 'venue_001', name: 'Nine Star Turf' },
        userId: { _id: 'user_004', name: 'Sneha Gupta', phone: '9912345678' },
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
        _id: 'booking_seed_004',
        venueName: 'Green Valley Arena',
        venueLocation: 'Seawoods, Navi Mumbai',
        venueId: { _id: 'venue_002', name: 'Green Valley Arena' },
        userId: { _id: 'user_003', name: 'Arjun Mehta', phone: '9988776655' },
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
];

// ─── Internal flag — ensures seed is only written once per install ─────────────
const SEEDED_KEY = '@bookings_seeded';

// ─── Load All Bookings from AsyncStorage ─────────────────────────────────────
export const loadAllBookings = async (): Promise<StoredBooking[]> => {
    try {
        // First launch: seed dummy data so admin panel isn't empty
        const seeded = await AsyncStorage.getItem(SEEDED_KEY);
        if (!seeded) {
            await AsyncStorage.setItem(STORE_KEY, JSON.stringify(SEED_BOOKINGS));
            await AsyncStorage.setItem(SEEDED_KEY, 'true');
            return SEED_BOOKINGS;
        }

        const raw = await AsyncStorage.getItem(STORE_KEY);
        if (!raw) return [];
        return JSON.parse(raw) as StoredBooking[];
    } catch (err) {
        console.warn('[bookingStore] loadAllBookings error:', err);
        return [];
    }
};

// ─── Save Full Bookings Array ─────────────────────────────────────────────────
export const saveAllBookings = async (bookings: StoredBooking[]): Promise<void> => {
    try {
        await AsyncStorage.setItem(STORE_KEY, JSON.stringify(bookings));
    } catch (err) {
        console.warn('[bookingStore] saveAllBookings error:', err);
    }
};

// ─── Add a New Booking ────────────────────────────────────────────────────────
export const addBookingToStore = async (booking: StoredBooking): Promise<void> => {
    try {
        const current = await loadAllBookings();
        // Prepend so newest appears first
        const updated = [booking, ...current];
        await saveAllBookings(updated);
    } catch (err) {
        console.warn('[bookingStore] addBookingToStore error:', err);
    }
};

// ─── Update a Booking (status / paymentStatus / etc.) ────────────────────────
export const updateBookingInStore = async (
    id: string,
    updates: Partial<StoredBooking>
): Promise<StoredBooking | null> => {
    try {
        const current = await loadAllBookings();
        let updated: StoredBooking | null = null;
        const next = current.map((b) => {
            if (b._id === id) {
                updated = { ...b, ...updates };
                return updated;
            }
            return b;
        });
        await saveAllBookings(next);
        return updated;
    } catch (err) {
        console.warn('[bookingStore] updateBookingInStore error:', err);
        return null;
    }
};

// ─── Get Bookings for a Specific User ─────────────────────────────────────────
export const getBookingsForUser = async (userId: string): Promise<StoredBooking[]> => {
    const all = await loadAllBookings();
    return all.filter((b) => b.userId?._id === userId);
};

// ─── Get Bookings filtered by Status ─────────────────────────────────────────
export const getBookingsByStatus = async (status: string): Promise<StoredBooking[]> => {
    const all = await loadAllBookings();
    if (!status || status === 'all') return all;
    return all.filter((b) => b.status === status);
};
