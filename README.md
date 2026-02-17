# Turf Booker 🏟️

A production-ready turf booking mobile app built with Expo (React Native) and TypeScript.

## Features

- 🏠 **Home Screen**: Browse turf details, photos, location, and pricing
- 📅 **Slots Screen**: View and select available time slots by date
- ✅ **Booking Confirmation**: Complete bookings with form validation
- 📝 **My Bookings**: Track booking history with status indicators
- 👤 **Profile**: Manage user information

## Tech Stack

- **Framework**: Expo SDK 54 (React Native)
- **Language**: TypeScript
- **Navigation**: Expo Router (file-based routing)
- **Storage**: AsyncStorage for local data persistence
- **Build Tool**: EAS Build for Android .aab generation

## Prerequisites

- Node.js 18+ and npm
- Expo CLI
- EAS CLI (for builds)
- Android Studio (for local testing) or physical Android device

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Development Server

```bash
npx expo start
```

Then:
- Press `a` to open in Android emulator
- Scan QR code with Expo Go app on your phone

### 3. Run on Android

```bash
npx expo run:android
```

## Project Structure

```
TurfBooking/
├── app/                        # Expo Router screens
│   ├── (tabs)/                # Bottom tab navigation
│   │   ├── index.tsx          # Home screen
│   │   ├── slots.tsx          # Slots screen
│   │   ├── bookings.tsx       # My Bookings screen
│   │   └── profile.tsx        # Profile screen
│   ├── booking/[id].tsx       # Booking confirmation
│   └── _layout.tsx            # Root layout
├── components/                 # Reusable UI components
│   ├── ui/                    # Basic components
│   └── turf/                  # Turf-specific components
├── services/                   # API and storage services
│   ├── api.ts                 # Mock API (replace with real API)
│   └── storage.ts             # AsyncStorage helpers
├── utils/                      # Utilities
│   ├── theme.ts               # Design system
│   ├── constants.ts           # App constants
│   └── validators.ts          # Form validation
├── types/                      # TypeScript types
├── app.json                    # Expo configuration
└── eas.json                    # EAS Build configuration
```

## Building for Production

### Setup EAS

```bash
# Install EAS CLI globally
npm install -g eas-cli

# Login to Expo account
eas login

# Initialize EAS
eas init
```

### Build Android APK (for testing)

```bash
eas build -p android --profile preview
```

### Build Android AAB (for Play Store)

```bash
eas build -p android --profile production
```

This creates a `.aab` file ready for Google Play Store submission.

### Download Build

After the build completes, EAS will provide a download link. Download the `.aab` file and upload it to Google Play Console.

## Key Features & Error Handling

### ✅ Crash Prevention
- Global ErrorBoundary for unexpected errors
- Try/catch blocks on all async operations
- Type safety with TypeScript
- Input validation on all forms
- Null checks and optional chaining

### 🌐 Network Resilience
- Loading states for all API calls
- User-friendly error messages
- Retry mechanisms
- Offline detection
- Graceful degradation

### 📱 User Experience
- Empty states for all screens
- Pull-to-refresh on bookings
- Form validation with clear error messages
- Success confirmations
- Smooth navigation transitions

## Replacing Mock API with Real Backend

The app currently uses mock data. To connect to a real backend:

1. Update `services/api.ts` with your API endpoints:

```typescript
const API_BASE_URL = 'https://your-backend.com/api';

export async function getTurfDetails(): Promise<ApiResponse<Turf>> {
  try {
    const response = await fetch(`${API_BASE_URL}/turf`);
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: 'Failed to fetch turf details' };
  }
}
```

2. Add authentication headers as needed
3. Update error handling for your API's error format
4. Test all flows with real data

**No other code changes needed!** All components use the API service abstraction.

## Environment Variables

For production, create `.env` file:

```bash
API_BASE_URL=https://your-backend.com/api
API_KEY=your-api-key
```

Then install `expo-dotenv`:

```bash
npm install expo-dotenv
```

## Testing Checklist

Before Play Store submission:

- [ ] Test all navigation flows
- [ ] Test booking creation end-to-end
- [ ] Test form validation (invalid inputs)
- [ ] Test network error scenarios
- [ ] Test on slow connections
- [ ] Test empty states (no bookings, no slots)
- [ ] Test data persistence (close/reopen app)
- [ ] Test on different screen sizes
- [ ] Test with real device (not just emulator)
- [ ] Verify app doesn't crash under any scenario

## Play Store Submission

1. **Create Keystore** (EAS handles this automatically)
2. **Build AAB**: `eas build -p android --profile production`
3. **Download AAB** from EAS dashboard
4. **Create Play Console Account** (one-time $25 fee)
5. **Create App** in Play Console
6. **Upload AAB** to Internal Testing track
7. **Fill Required Info**: App description, screenshots, privacy policy
8. **Submit for Review**

## Troubleshooting

### Build Fails
- Check `eas.json` configuration
- Ensure package.json dependencies are correct
- Clear cache: `npx expo start -c`

### Navigation Issues
- Ensure all routes in `app/` directory
- Check Stack/Tabs configuration in layouts
- Clear bundler cache

### AsyncStorage Errors
- Check permissions in app.json
- Ensure AsyncStorage is installed correctly

## Support

For issues or questions:
- Check Expo docs: https://docs.expo.dev
- EAS Build docs: https://docs.expo.dev/build/introduction
- React Navigation: https://reactnavigation.org

## License

MIT

---

**Built with ❤️ for turf booking management**
