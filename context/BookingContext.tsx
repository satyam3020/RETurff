import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ConfirmedBooking {
    id: string;
    turfName: string;
    location: string;
    date: string;
    slots: { time: string; surface: string; court: string; price: number }[];
    sport: string;
    totalAmount: number;
    status: 'payment_pending' | 'upcoming' | 'completed' | 'cancelled';
    confirmedAt: string;
}

interface BookingContextType {
    bookings: ConfirmedBooking[];
    addBooking: (booking: ConfirmedBooking) => Promise<void>;
    refreshBookings: () => Promise<void>;
}

const BookingContext = createContext<BookingContextType>({
    bookings: [],
    addBooking: async () => { },
    refreshBookings: async () => { },
});

const STORAGE_KEY = 'confirmed_bookings';

export function BookingProvider({ children }: { children: ReactNode }) {
    const [bookings, setBookings] = useState<ConfirmedBooking[]>([]);

    const refreshBookings = async () => {
        try {
            const stored = await AsyncStorage.getItem(STORAGE_KEY);
            if (stored) {
                setBookings(JSON.parse(stored));
            }
        } catch (e) {
            console.error('Failed to load bookings', e);
        }
    };

    useEffect(() => {
        refreshBookings();
    }, []);

    const addBooking = async (booking: ConfirmedBooking) => {
        try {
            const updated = [booking, ...bookings];
            setBookings(updated);
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch (e) {
            console.error('Failed to save booking', e);
        }
    };

    return (
        <BookingContext.Provider value={{ bookings, addBooking, refreshBookings }}>
            {children}
        </BookingContext.Provider>
    );
}

export function useBookings() {
    return useContext(BookingContext);
}
