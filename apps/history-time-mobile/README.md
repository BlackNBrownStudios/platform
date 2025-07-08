# History Time Mobile App

A React Native mobile application for the History Time platform that allows users to test their knowledge of historical events by arranging them in chronological order.

## Architecture

This app follows a scalable architecture with clear separation of concerns:

### Core Structure

- **app/components/**: Reusable UI components
- **app/screens/**: Screen components for different app sections
- **app/navigation/**: Navigation structure and routing
- **app/services/**: API services and data fetching
- **app/themes/**: Theme definitions and context provider
- **app/utils/**: Utility functions and helpers
- **app/hooks/**: Custom React hooks
- **app/models/**: Data models and types

### Key Features

- **Theme System**: Shared theme system with the web version, supporting light, dark, sepia, and historical themes
- **API Integration**: Structured API service that matches the web frontend for code sharing
- **Navigation**: Tab-based navigation with nested stack navigation for game screens
- **Component Library**: Uses React Native Paper for consistent UI elements
- **Type Safety**: Full TypeScript implementation for better code quality and developer experience

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Expo CLI

### Installation

1. Clone the repository
2. Navigate to the mobile app directory

```bash
cd history-time/mobile/HistoryTimeMobile
```

3. Install dependencies

```bash
npm install
```

4. Start the development server

```bash
npm start
```

### Running on Devices

- **Android Emulator**: Press 'a' in the Expo CLI or click 'Run on Android device/emulator'
- **iOS Simulator**: Press 'i' in the Expo CLI or click 'Run on iOS simulator'
- **Physical Device**: Scan the QR code with the Expo Go app

## Backend Connection

The app is configured to connect to the History Time backend:

- Android Emulator: `http://10.0.2.2:3001`
- iOS Simulator: `http://localhost:3001`

You may need to adjust the API URL in `app/services/api.ts` if your backend is running on a different host or port.

## Shared Code with Web Frontend

This mobile app shares the following code patterns with the web frontend:

- Theme definitions and structure
- API service methods
- Data models and types
- Game logic

## Build and Distribution

To build the app for distribution:

```bash
expo build:android  # For Android
expo build:ios      # For iOS
```

## Development Workflow

1. Make changes to the code
2. Test on development server
3. Run linting and type checking

```bash
npm run lint
tsc --noEmit
```

4. Build and test release version before distribution
