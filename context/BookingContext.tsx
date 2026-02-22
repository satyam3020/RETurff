import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { getUserBookings, createBooking as mockCreateBooking } from '../services/api';
import { getAuthUser } from '../services/api';

// ─── Types ─────────────────────────────────────────────────────────────────
export interface ConfirmedBooking {
    _id: string;
    id?: string;             // alias for _id
    turfName?: string;       // alias for venueName (legacy compat)
    venueName: string;
    venueLocation?: string;
    date: string;
    startTime: string;
    endTime: string;
    sport?: string;
    // Status uses admin-side values; user screen maps them for display
    status: 'pending' | 'approved' | 'completed' | 'cancelled' | 'rejected' | 'payment_pending' | 'upcoming';
    paymentStatus: 'unpaid' | 'paid' | 'refunded';
    totalAmount: number;
    slots?: { time: string }[];  // legacy compat
    createdAt?: string;
}

interface BookingContextType {
    bookings: ConfirmedBooking[];
    addBooking: (bookingData: any) => Promise<{ success: boolean; data?: ConfirmedBooking; message?: string }>;
    refreshBookings: () => Promise<void>;
    isLoading: boolean;
}

// ─── Context ───────────────────────────────────────────────────────────────
const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const useBookings = () => {
    const ctx = useContext(BookingContext);
    if (!ctx) throw new Error('useBookings must be used within BookingProvider');
    return ctx;
};

// Normalize a raw booking from the shared store to ConfirmedBooking shape
const normalizeBooking = (b: any): ConfirmedBooking => ({
    ...b,
    _id: b._id || b.id || `bk_${Math.random()}`,
    id: b._id || b.id,
    venueName: b.venueName || b.turfName || 'Unknown Venue',
    turfName: b.venueName || b.turfName || 'Unknown Venue', // legacy alias
    startTime: b.startTime || '',
    endTime: b.endTime || '',
    // Provide a slots array compatible with the old UI (legacy slots screen)
    slots: b.slots || [{ time: `${b.startTime || ''} - ${b.endTime || ''}` }],
    totalAmount: b.totalAmount || 0,
    status: b.status || 'pending',
    paymentStatus: b.paymentStatus || 'unpaid',
});

// ─── Provider ──────────────────────────────────────────────────────────────
export const BookingProvider = ({ children }: { children: ReactNode }) => {
    const [bookings, setBookings] = useState<ConfirmedBooking[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const refreshBookings = useCallback(async () => {
        setIsLoading(true);
        try {
            // Try to get user id for filtering; fallback to all bookings in demo mode
            const user = await getAuthUser().catch(() => null);
            const userId = user?._id;
            const res = await getUserBookings(userId);
            if (res.success && Array.isArray(res.data)) {
                setBookings(res.data.map(normalizeBooking));
            }
        } catch (error) {
            console.warn('BookingContext: Could not refresh bookings', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Load bookings on mount
    useEffect(() => { refreshBookings(); }, []);

    const addBooking = async (bookingData: any): Promise<{ success: boolean; data?: ConfirmedBooking; message?: string }> => {
        try {
            const res = await mockCreateBooking(bookingData);
            if (res.success && res.data) {
                const normalized = normalizeBooking(res.data);
                setBookings((prev) => [normalized, ...prev]);
                return { success: true, data: normalized };
            }
            return { success: false, message: 'Booking failed' };
        } catch (error: any) {
            return { success: false, message: error.message || 'Failed to create booking' };
        }
    };

    return (
        <BookingContext.Provider value={{ bookings, addBooking, refreshBookings, isLoading }}>
            {children}
        </BookingContext.Provider>
    );
};

export default BookingContext;
