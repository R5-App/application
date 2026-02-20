# MyPet Application

A comprehensive pet management application built with React Native and Expo, supporting iOS, Android, and Web platforms.

## Overview

MyPet is a full-featured mobile application that helps pet owners manage their pets' daily activities, health records, and wellness tracking. The application provides GPS-enabled walk tracking, health record management, and multi-user pet sharing capabilities.

## Features

### Pet Management
- Create and manage multiple pet profiles
- Track pet details (breed, sex, birthdate, weight)
- Custom pet avatars and images
- Share pets with family members or caregivers
- Role-based access (owner, caretaker, veterinarian)

### Walk Tracking
- GPS-based walk route recording
- Real-time distance and duration tracking
- Step counter integration using device sensors
- Average speed calculation
- Walk history with detailed maps
- Offline walk recording with cloud sync

### Health Records
- **Vaccinations**: Track vaccination schedules and history
- **Medications**: Manage medication schedules and reminders
- **Veterinary Visits**: Record checkups and visit notes
- **Weight Management**: Monitor weight trends over time

### Calendar
- Event scheduling for pets
- Appointment reminders
- Activity history

### User Management
- Secure authentication (login/register)
- User profiles
- Multi-user pet sharing with share codes
- Sync setup for data backup

### Additional Features
- Offline-first architecture with cloud sync
- Material Design 3 UI
- Cross-platform support (iOS, Android, Web)

## Repository Architecture

The repository follows a monorepo structure with the mobile application as the primary component.

```
application/
├── mobile/                          # React Native mobile application
├── .vscode/                         # VS Code workspace settings
├── .git/                            # Git version control
├── LICENSE                          # MIT License
└── README.md                        # This file
```

## Project Structure

```
mobile/
├── src/
│   ├── App.tsx                      # Root application component
│   │
│   ├── assets/                      # Static assets
│   │   ├── fonts/                   # Custom fonts
│   │   ├── icons/                   # Icon assets
│   │   └── images/                  # Image assets
│   │
│   ├── components/                  # Reusable UI components
│   │   ├── AvatarDisplay.tsx        # Pet avatar display component
│   │   ├── AvatarUploadDialog.tsx   # Avatar upload modal
│   │   ├── RedeemShareCodeDialog.tsx # Share code redemption
│   │   ├── SharePetDialog.tsx       # Pet sharing dialog
│   │   ├── SwipeableCard.tsx        # Swipeable card component
│   │   └── SyncSetupDialog.tsx      # Sync configuration dialog
│   │
│   ├── screens/                     # Application screens
│   │   ├── AddPetScreen.tsx         # Add new pet
│   │   ├── CalendarScreen.tsx       # Calendar view
│   │   ├── HealthScreen.tsx         # Health records hub
│   │   ├── HomeScreen.tsx           # Main dashboard
│   │   ├── LoginScreen.tsx          # User login
│   │   ├── MapScreen.tsx            # Map view for walks
│   │   ├── MedicationsScreen.tsx    # Medication management
│   │   ├── PetProfileScreen.tsx     # Individual pet profile
│   │   ├── PetsScreen.tsx           # Pet list view
│   │   ├── ProfileScreen.tsx        # User profile
│   │   ├── RegisterScreen.tsx       # User registration
│   │   ├── SettingsScreen.tsx       # App settings
│   │   ├── VaccinationsScreen.tsx   # Vaccination records
│   │   ├── VisitsScreen.tsx         # Veterinary visits
│   │   ├── WalkDetailScreen.tsx     # Walk tracking detail
│   │   ├── WalkHistoryScreen.tsx    # Walk history list
│   │   └── WeightManagementScreen.tsx # Weight tracking
│   │
│   ├── navigation/                  # Navigation configuration
│   │   └── Navigation.tsx           # App navigation structure
│   │
│   ├── services/                    # Business logic & API layer
│   │   ├── api.ts                   # Base API client (Axios)
│   │   ├── authService.ts           # Authentication service
│   │   ├── avatarService.ts         # Avatar management
│   │   ├── calendarService.ts       # Calendar events
│   │   ├── locationService.ts       # GPS & location tracking
│   │   ├── medicationsService.ts    # Medication records
│   │   ├── petService.ts            # Pet data management
│   │   ├── routeService.ts          # Walk route tracking
│   │   ├── storageService.ts        # Local storage (AsyncStorage)
│   │   ├── vaccinationsService.ts   # Vaccination records
│   │   ├── visitsService.ts         # Veterinary visits
│   │   └── weightsService.ts        # Weight tracking
│   │
│   ├── contexts/                    # React Context providers
│   │   ├── AuthContext.tsx          # Authentication state
│   │   ├── SnackbarContext.tsx      # Global notifications
│   │   ├── WalkContext.tsx          # Walk tracking state
│   │   └── index.ts                 # Context exports
│   │
│   ├── hooks/                       # Custom React hooks
│   │   └── index.ts                 # Hook exports
│   │
│   ├── helpers/                     # Helper functions
│   │   └── index.ts                 # Helper exports
│   │
│   ├── utils/                       # Utility functions
│   │   └── constants.ts             # App constants
│   │
│   ├── config/                      # Application configuration
│   │   └── index.ts                 # Config settings (API URLs)
│   │
│   ├── types/                       # TypeScript type definitions
│   │   └── index.ts                 # Type exports
│   │
│   └── styles/                      # Styling & theming
│       ├── theme.ts                 # MD3 theme (colors, typography)
│       ├── authStyles.ts            # Auth screen styles
│       ├── screenStyles.ts          # Screen-specific styles
│       ├── index.ts                 # Style exports
│       └── README.md                # Design system documentation
│
├── android/                         # Android native code
│   ├── app/                         # Android app module
│   │   ├── src/
│   │   │   ├── main/
│   │   │   │   ├── AndroidManifest.xml
│   │   │   │   ├── java/com/mypet/ # Native Java code
│   │   │   │   └── res/             # Android resources
│   │   │   ├── debug/               # Debug build configuration
│   │   │   └── debugOptimized/      # Optimized debug build
│   │   ├── build.gradle             # App build configuration
│   │   └── proguard-rules.pro       # ProGuard rules
│   ├── gradle/                      # Gradle wrapper
│   ├── build.gradle                 # Project build configuration
│   ├── settings.gradle              # Project settings
│   ├── gradle.properties            # Gradle properties
│   ├── gradlew                      # Gradle wrapper (Unix)
│   └── gradlew.bat                  # Gradle wrapper (Windows)
│
├── app.json                         # Expo configuration
├── babel.config.js                  # Babel configuration
├── eslint.config.mjs                # ESLint configuration
├── metro.config.js                  # Metro bundler configuration
├── tsconfig.json                    # TypeScript configuration
├── package.json                     # Dependencies and scripts
└── index.ts                         # App entry point
```

## Technology Stack

### Frontend/Mobile
- **React Native** 0.81.5 - Cross-platform mobile framework
- **Expo** 54 - Development and build platform
- **TypeScript** 5.9 - Type-safe JavaScript
- **React** 19.1 - UI library
- **React Navigation** 7 - Navigation framework
- **React Native Paper** 5 - Material Design components

### Key Libraries
- **Axios** - HTTP client for API communication
- **AsyncStorage** - Local data persistence
- **Expo Location** - GPS and location services
- **Expo Sensors** - Device sensors (pedometer)
- **Expo Notifications** - Push notifications
- **Expo Image Picker** - Photo selection
- **React Native Reanimated** - Smooth animations
- **React Native Gesture Handler** - Touch gestures
- **React Native SVG** - Vector graphics

## Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- Expo CLI (`npm install -g expo-cli`)
- For iOS: macOS with Xcode
- For Android: Android Studio with SDK

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd application

# Install dependencies
npm install

# Navigate to mobile app
cd mobile
npm install
```

### Running the Application

```bash
# Start Expo development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

### Development

```bash
# Type checking
npm run type-check

# Linting
npm run lint
```

## Configuration

Configure the API endpoint in `mobile/src/config/index.ts`:

```typescript
export const config = {
  api: {
    baseURL: 'https://your-api-url.com',
    timeout: 30000,
  },
};
```

## Build & Deployment

### Android
```bash
cd mobile
expo build:android
```

### iOS
```bash
cd mobile
expo build:ios
```

## Permissions

The app requires the following permissions:
- **Location**: GPS tracking for walks
- **Camera/Photos**: Pet avatar uploads
- **Motion & Fitness**: Step counting

## Architecture

The application follows a modern React Native architecture:
- **Component-based UI**: Reusable React components
- **Context API**: Global state management
- **Service layer**: Abstracted API and business logic
- **Type-safe**: Full TypeScript coverage
- **Offline-first**: Local storage with cloud sync

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
