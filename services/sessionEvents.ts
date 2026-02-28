/**
 * Tiny event bus used to decouple auth-related events from navigation.
 * Uses a simple custom implementation instead of Node's EventEmitter,
 * which is not available in React Native.
 *
 * Events:
 *   'session-expired'  — emitted when the refresh token is invalid/expired,
 *                         meaning the user must log in again.
 */

type Listener = (...args: any[]) => void;

class SimpleEventEmitter {
    private listeners: Record<string, Listener[]> = {};

    on(event: string, listener: Listener): this {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(listener);
        return this;
    }

    off(event: string, listener: Listener): this {
        if (!this.listeners[event]) return this;
        this.listeners[event] = this.listeners[event].filter((l) => l !== listener);
        return this;
    }

    emit(event: string, ...args: any[]): boolean {
        if (!this.listeners[event] || this.listeners[event].length === 0) {
            return false;
        }
        this.listeners[event].forEach((listener) => listener(...args));
        return true;
    }

    removeAllListeners(event?: string): this {
        if (event) {
            delete this.listeners[event];
        } else {
            this.listeners = {};
        }
        return this;
    }
}

const sessionEvents = new SimpleEventEmitter();

export default sessionEvents;
