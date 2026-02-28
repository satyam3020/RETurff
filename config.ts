import { Platform } from 'react-native';
import Constants from 'expo-constants';

/**
 * Determines the correct API base URL based on the runtime environment.
 *
 * Priority:
 *  1. `extra.apiUrl` set in app.json / app.config.js  (for production / staging)
 *  2. Auto-detected local development URL based on platform:
 *     - Android emulator  → http://10.0.2.2:<PORT>/api
 *     - iOS simulator     → http://localhost:<PORT>/api
 *     - Physical device   → http://<debuggerHost IP>:<PORT>/api
 *        (Expo injects the dev machine IP via the manifest)
 */

const API_PORT = 5000;

function getBaseUrl(): string {
    // 1. Explicit override from app.json  →  expo.extra.apiUrl
    const explicit = Constants.expoConfig?.extra?.apiUrl;
    if (explicit) return explicit;

    // 2. In development, derive URL from the Expo dev-server host
    const debuggerHost =
        Constants.expoConfig?.hostUri ?? // SDK 49+
        (Constants as any).manifest?.debuggerHost ?? // older SDKs
        (Constants as any).manifest2?.extra?.expoGo?.debuggerHost;

    if (debuggerHost) {
        // debuggerHost looks like "192.168.1.5:8081" – grab only the IP
        const ip = debuggerHost.split(':')[0];
        return `http://${ip}:${API_PORT}/api`;
    }

    // 3. Fallback per platform (no debuggerHost available)
    if (Platform.OS === 'android') {
        return `http://10.0.2.2:${API_PORT}/api`;
    }

    // iOS simulator / web
    return `http://localhost:${API_PORT}/api`;
}

export const API_BASE_URL = getBaseUrl();
