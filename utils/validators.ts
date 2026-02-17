// Form validation utilities
import { PHONE_REGEX, NAME_MIN_LENGTH } from './constants';
import type { ValidationError } from '../types';

export function validatePhone(phone: string): ValidationError | null {
    if (!phone || phone.trim() === '') {
        return { field: 'phone', message: 'Phone number is required' };
    }

    if (!PHONE_REGEX.test(phone)) {
        return { field: 'phone', message: 'Please enter a valid 10-digit phone number' };
    }

    return null;
}

export function validateName(name: string): ValidationError | null {
    if (!name || name.trim() === '') {
        return { field: 'name', message: 'Name is required' };
    }

    if (name.trim().length < NAME_MIN_LENGTH) {
        return { field: 'name', message: `Name must be at least ${NAME_MIN_LENGTH} characters` };
    }

    return null;
}

export function validateDate(date: Date): ValidationError | null {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
        return { field: 'date', message: 'Please select a future date' };
    }

    return null;
}

export function validateBookingForm(data: {
    date: Date;
    slotId: string;
    userName: string;
    userPhone: string;
}): ValidationError[] {
    const errors: ValidationError[] = [];

    const dateError = validateDate(data.date);
    if (dateError) errors.push(dateError);

    if (!data.slotId) {
        errors.push({ field: 'slot', message: 'Please select a time slot' });
    }

    const nameError = validateName(data.userName);
    if (nameError) errors.push(nameError);

    const phoneError = validatePhone(data.userPhone);
    if (phoneError) errors.push(phoneError);

    return errors;
}

export function formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
}

export function formatTime(hour: number): string {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:00 ${period}`;
}

export function formatPrice(price: number): string {
    return `₹${price.toFixed(0)}`;
}
