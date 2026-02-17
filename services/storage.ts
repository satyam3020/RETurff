// AsyncStorage helpers for data persistence
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../utils/constants';
import type { User, Booking } from '../types';

export async function saveUserProfile(user: User): Promise<boolean> {
    try {
        await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(user));
        return true;
    } catch (error) {
        console.error('Failed to save user profile:', error);
        return false;
    }
}

export async function getUserProfile(): Promise<User | null> {
    try {
        const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Failed to load user profile:', error);
        return null;
    }
}

export async function saveBookings(bookings: Booking[]): Promise<boolean> {
    try {
        await AsyncStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
        return true;
    } catch (error) {
        console.error('Failed to save bookings:', error);
        return false;
    }
}

export async function getBookings(): Promise<Booking[]> {
    try {
        const data = await AsyncStorage.getItem(STORAGE_KEYS.BOOKINGS);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Failed to load bookings:', error);
        return [];
    }
}

export async function addBooking(booking: Booking): Promise<boolean> {
    try {
        const existingBookings = await getBookings();
        const updatedBookings = [...existingBookings, booking];
        return await saveBookings(updatedBookings);
    } catch (error) {
        console.error('Failed to add booking:', error);
        return false;
    }
}
