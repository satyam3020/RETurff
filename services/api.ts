// Mock API service with comprehensive error handling
import { OPERATING_HOURS, ERROR_MESSAGES, API_TIMEOUT } from '../utils/constants';
import { formatDate, formatTime } from '../utils/validators';
import { getBookings, addBooking } from './storage';
import type { Turf, TimeSlot, Booking, ApiResponse, User } from '../types';

// Simulated network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Random error simulation (for testing error handling)
const shouldSimulateError = () => Math.random() < 0.05; // 5% chance of error

// Mock turf data
const MOCK_TURF: Turf = {
    id: 'turf-001',
    name: 'Green Valley Sports Arena',
    description: 'Premium quality turf with excellent facilities. Perfect for football, cricket, and other outdoor sports.',
    location: 'Sector 21, Electronic City, Bangalore',
    pricePerHour: 1500,
    images: [
        'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800',
        'https://images.unsplash.com/photo-1459865264687-595d652de67e?w=800',
        'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800',
    ],
    amenities: ['Floodlights', 'Changing Room', 'Parking', 'Water', 'First Aid'],
    rating: 4.5,
    reviews: 124,
};

const MOCK_VENUES: Turf[] = [
    {
        id: '1',
        name: 'Nine Star Turf',
        description: 'Elite sports facility in Dahisar East.',
        location: 'Vaishali Nagar, Dahisar East',
        rating: 4.33,
        reviews: 3,
        pricePerHour: 1200,
        images: ['https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800'],
        amenities: ['Artificial Turf', 'Ball Boy', 'Drinking Water', 'Floodlights'],
    },
    {
        id: '2',
        name: 'Nine Stars Cricket Academy',
        description: 'Professional cricket training facility.',
        location: 'Vaishali Nagar, Dahisar East',
        rating: 4.6,
        reviews: 5,
        pricePerHour: 1500,
        images: ['https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800'],
        amenities: ['Box Cricket', 'Coaching', 'Equipment', 'Parking'],
    }
];

export async function getVenues(): Promise<ApiResponse<Turf[]>> {
    try {
        await delay(500);
        return { success: true, data: MOCK_VENUES };
    } catch (error) {
        return { success: false, error: 'Could not fetch venues' };
    }
}

/**
 * Fetch turf details
 */
export async function getTurfDetails(): Promise<ApiResponse<Turf>> {
    try {
        await delay(500);

        if (shouldSimulateError()) {
            throw new Error('Network error');
        }

        return {
            success: true,
            data: MOCK_TURF,
        };
    } catch (error) {
        console.error('getTurfDetails error:', error);
        return {
            success: false,
            error: ERROR_MESSAGES.FETCH_TURF_ERROR,
        };
    }
}

/**
 * Generate available time slots for a given date
 */
export async function getAvailableSlots(date: Date): Promise<ApiResponse<TimeSlot[]>> {
    try {
        await delay(500);

        if (shouldSimulateError()) {
            throw new Error('Network error');
        }

        const slots: TimeSlot[] = [];
        const dateStr = formatDate(date);

        // Get existing bookings to mark slots as unavailable
        const existingBookings = await getBookings();
        const bookedSlots = new Set(
            existingBookings
                .filter(b => b.date === dateStr && b.status === 'upcoming')
                .map(b => b.startTime)
        );

        // Generate slots from 6 AM to 10 PM
        for (let hour = OPERATING_HOURS.START; hour < OPERATING_HOURS.END - 1; hour++) {
            const startTime = formatTime(hour);
            const endTime = formatTime(hour + 1);
            const isBooked = bookedSlots.has(startTime);

            slots.push({
                id: `slot-${dateStr}-${hour}`,
                startTime,
                endTime,
                isAvailable: !isBooked,
                price: MOCK_TURF.pricePerHour,
                date: dateStr,
            });
        }

        return {
            success: true,
            data: slots,
        };
    } catch (error) {
        console.error('getAvailableSlots error:', error);
        return {
            success: false,
            error: ERROR_MESSAGES.FETCH_SLOTS_ERROR,
        };
    }
}

/**
 * Create a new booking
 */
export async function createBooking(
    bookingData: Omit<Booking, 'id' | 'createdAt'>
): Promise<ApiResponse<Booking>> {
    try {
        await delay(800);

        if (shouldSimulateError()) {
            throw new Error('Server error');
        }

        // Validate slot availability
        const slotsResponse = await getAvailableSlots(new Date(bookingData.date));
        if (!slotsResponse.success || !slotsResponse.data) {
            throw new Error('Failed to verify slot availability');
        }

        const selectedSlot = slotsResponse.data.find(
            slot => slot.startTime === bookingData.startTime
        );

        if (!selectedSlot || !selectedSlot.isAvailable) {
            return {
                success: false,
                error: 'Selected slot is no longer available',
            };
        }

        // Create booking
        const booking: Booking = {
            ...bookingData,
            id: `booking-${Date.now()}`,
            createdAt: new Date().toISOString(),
        };

        // Save to storage
        const saved = await addBooking(booking);
        if (!saved) {
            throw new Error('Failed to save booking');
        }

        return {
            success: true,
            data: booking,
        };
    } catch (error) {
        console.error('createBooking error:', error);
        return {
            success: false,
            error: ERROR_MESSAGES.CREATE_BOOKING_ERROR,
        };
    }
}

/**
 * Get user's bookings
 */
export async function getUserBookings(): Promise<ApiResponse<Booking[]>> {
    try {
        await delay(500);

        if (shouldSimulateError()) {
            throw new Error('Network error');
        }

        const bookings = await getBookings();

        // Sort by date (newest first)
        const sorted = bookings.sort((a, b) => {
            return new Date(b.date).getTime() - new Date(a.date).getTime();
        });

        return {
            success: true,
            data: sorted,
        };
    } catch (error) {
        console.error('getUserBookings error:', error);
        return {
            success: false,
            error: ERROR_MESSAGES.FETCH_BOOKINGS_ERROR,
        };
    }
}

/**
 * Update user profile
 */
export async function updateUserProfile(user: User): Promise<ApiResponse<User>> {
    try {
        await delay(500);

        if (shouldSimulateError()) {
            throw new Error('Network error');
        }

        // In a real app, this would call the backend
        // For now, we just return the user data
        return {
            success: true,
            data: user,
        };
    } catch (error) {
        console.error('updateUserProfile error:', error);
        return {
            success: false,
            error: ERROR_MESSAGES.UPDATE_PROFILE_ERROR,
        };
    }
}
