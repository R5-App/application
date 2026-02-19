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

## Project Structure

```
application/
├── mobile/                 # React Native mobile app
│   ├── src/
│   │   ├── App.tsx        # Root component
│   │   ├── assets/        # Images, fonts, icons
│   │   ├── components/    # Reusable UI components
│   │   ├── screens/       # Screen components
│   │   ├── navigation/    # Navigation configuration
│   │   ├── services/      # API and external services
│   │   ├── contexts/      # React Context providers
│   │   ├── hooks/         # Custom React hooks
│   │   ├── helpers/       # Helper functions
│   │   ├── utils/         # Utility functions
│   │   ├── config/        # App configuration
│   │   ├── types/         # TypeScript definitions
│   │   └── styles/        # Styling and theme
│   ├── android/           # Android native code
│   └── app.json          # Expo configuration
├── android/               # Android build configuration
├── package.json          # Root workspace configuration
└── LICENSE
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

### Web
```bash
cd mobile
expo build:web
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