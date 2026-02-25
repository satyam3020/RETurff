/**
 * slotStore.ts — Local slot store using AsyncStorage.
 *
 * Admin generates slots → saved here.
 * User booking screen fetches slots → reads from here (+ backend fallback).
 *
 * Each slot is keyed by:  `{venueId}|{date}|{sport}|{surface}`
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface LocalSlot {
    _id: string;
    venueId: string;
    date: string;           // ISO  YYYY-MM-DD
    sport: string;          // 'Cricket' | 'Football'
    surface: string;        // 'Pitch 1' | 'Pitch 2'
    startTime: string;      // '06:00'
    endTime: string;        // '07:00'
    price: number;
    isAvailable: boolean;
    isBooked: boolean;
    isBlocked: boolean;
}

const STORE_KEY = '@slotStore_v1';

// ─── Private helpers ──────────────────────────────────────────────────────────

async function readAll(): Promise<LocalSlot[]> {
    try {
        const raw = await AsyncStorage.getItem(STORE_KEY);
        return raw ? (JSON.parse(raw) as LocalSlot[]) : [];
    } catch {
        return [];
    }
}

async function writeAll(slots: LocalSlot[]): Promise<void> {
    await AsyncStorage.setItem(STORE_KEY, JSON.stringify(slots));
}

/** Generate a simple unique ID */
function makeId(venueId: string, date: string, sport: string, surface: string, startTime: string) {
    return `${venueId}_${date}_${sport}_${surface}_${startTime}`.replace(/\s+/g, '_').toLowerCase();
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Bulk-generate 1-hour slots from 06:00 to 22:00 for a given
 * venue / date / sport / pitch, and persist them locally.
 * Skips creating a slot if one already exists for that time.
 */
export async function bulkGenerateLocalSlots(params: {
    venueId: string;
    date: string;
    sport: string;
    surface: string;
    price: number;
}): Promise<{ success: boolean; count: number; message?: string }> {
    try {
        const existing = await readAll();

        const newSlots: LocalSlot[] = [];
        // 06:00 → 22:00, one-hour blocks
        for (let h = 6; h < 22; h++) {
            const startTime = `${String(h).padStart(2, '0')}:00`;
            const endTime = `${String(h + 1).padStart(2, '0')}:00`;
            const id = makeId(params.venueId, params.date, params.sport, params.surface, startTime);

            // Skip if already exists
            if (existing.some(s => s._id === id)) continue;

            newSlots.push({
                _id: id,
                venueId: params.venueId,
                date: params.date,
                sport: params.sport,
                surface: params.surface,
                startTime,
                endTime,
                price: params.price,
                isAvailable: true,
                isBooked: false,
                isBlocked: false,
            });
        }

        await writeAll([...existing, ...newSlots]);
        return { success: true, count: newSlots.length };
    } catch (e: any) {
        return { success: false, count: 0, message: e?.message || 'Failed to generate slots' };
    }
}

/**
 * Load slots for a venue + date, optionally filtered by sport + surface.
 */
export async function getLocalSlots(params: {
    venueId: string;
    date: string;
    sport?: string;
    surface?: string;
}): Promise<LocalSlot[]> {
    const all = await readAll();
    return all.filter(s => {
        if (s.venueId !== params.venueId) return false;
        if (s.date !== params.date) return false;
        if (params.sport && s.sport !== params.sport) return false;
        if (params.surface && s.surface !== params.surface) return false;
        return true;
    });
}

/**
 * Toggle a slot's isBlocked status.
 */
export async function toggleLocalSlotBlock(slotId: string): Promise<{ success: boolean }> {
    const all = await readAll();
    const updated = all.map(s =>
        s._id === slotId
            ? { ...s, isBlocked: !s.isBlocked, isAvailable: s.isBlocked }
            : s
    );
    await writeAll(updated);
    return { success: true };
}

/**
 * Mark a slot as booked (called from booking confirmation).
 */
export async function markSlotBooked(slotId: string): Promise<{ success: boolean }> {
    const all = await readAll();
    const updated = all.map(s =>
        s._id === slotId
            ? { ...s, isBooked: true, isAvailable: false }
            : s
    );
    await writeAll(updated);
    return { success: true };
}

/**
 * Delete all slots for a venue+date+sport+surface combination.
 * Used when admin wants to regenerate.
 */
export async function clearLocalSlots(params: {
    venueId: string;
    date: string;
    sport: string;
    surface: string;
}): Promise<void> {
    const all = await readAll();
    const filtered = all.filter(s =>
        !(s.venueId === params.venueId &&
            s.date === params.date &&
            s.sport === params.sport &&
            s.surface === params.surface)
    );
    await writeAll(filtered);
}
