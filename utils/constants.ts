// App-wide constants

export const APP_NAME = 'Turf Booker';

// Time constants
export const OPERATING_HOURS = {
    START: 6, // 6 AM
    END: 23, // 11 PM
};

export const SLOT_DURATION = 60; // minutes

// Booking status
export const BOOKING_STATUS = {
    UPCOMING: 'upcoming' as const,
    COMPLETED: 'completed' as const,
    CANCELLED: 'cancelled' as const,
};

// Error messages
export const ERROR_MESSAGES = {
    NETWORK_ERROR: 'Network error. Please check your connection and try again.',
    SERVER_ERROR: 'Something went wrong. Please try again later.',
    VALIDATION_ERROR: 'Please check your input and try again.',
    FETCH_TURF_ERROR: 'Failed to load turf details.',
    FETCH_SLOTS_ERROR: 'Failed to load available slots.',
    CREATE_BOOKING_ERROR: 'Failed to create booking.',
    FETCH_BOOKINGS_ERROR: 'Failed to load your bookings.',
    UPDATE_PROFILE_ERROR: 'Failed to update profile.',
};

// Success messages
export const SUCCESS_MESSAGES = {
    BOOKING_CREATED: 'Booking confirmed successfully!',
    PROFILE_UPDATED: 'Profile updated successfully!',
};

// Storage keys
export const STORAGE_KEYS = {
    USER_PROFILE: '@user_profile',
    BOOKINGS: '@bookings',
};

// API timeouts
export const API_TIMEOUT = 10000; // 10 seconds

// Validation patterns
export const PHONE_REGEX = /^[0-9]{10}$/;
export const NAME_MIN_LENGTH = 2;
