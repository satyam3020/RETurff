// Core data types for the Turf Booking App

export interface Turf {
    id: string;
    name: string;
    description: string;
    location: string;
    pricePerHour: number;
    images: string[];
    amenities: string[];
    rating: number;
    reviews: number; // Added reviews count
}

export type Venue = Turf; // Aligning names if needed

export interface TimeSlot {
    id: string;
    startTime: string;
    endTime: string;
    isAvailable: boolean;
    price: number;
    date: string;
}

export type BookingStatus = 'upcoming' | 'completed' | 'cancelled' | 'payment_pending';

export interface Booking {
    id: string;
    turfId: string;
    turfName: string;
    date: string;
    startTime: string;
    endTime: string;
    duration: number;
    totalPrice: number;
    status: BookingStatus;
    userName: string;
    userPhone: string;
    createdAt: string;
}

export interface User {
    name: string;
    phone: string;
    mobile: string; // Add mobile for consistency
    profileImage?: string;
    preferences?: {
        age: number;
        gender: string;
        interestedSports: string[];
    };
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

export interface ValidationError {
    field: string;
    message: string;
}
