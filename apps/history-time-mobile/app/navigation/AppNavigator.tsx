import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

// Screens
import ErrorBoundary from '../components/ErrorBoundary';
import { Icon } from '../components/Icon';
import { CardManagerTestScreen } from '../screens/CardManagerTestScreen';
import DiagnosticsScreen from '../screens/DiagnosticsScreen';
import { GameBoardScreen } from '../screens/GameBoardScreen';
import HistoricalEventsScreen from '../screens/HistoricalEventsScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { LeaderboardScreen } from '../screens/LeaderboardScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

// Icon Component
import { useAppTheme } from '../themes/ThemeContext';

// Define the param lists for the navigators
export type RootStackParamList = {
  Main: undefined;
  GameBoard: {
    category?: string;
    categories?: string[];
    difficulty: string;
    devMode?: boolean;
  };
  Diagnostics: undefined;
  HistoricalEvents: undefined;
  CardManagerTest: undefined;
};

export type TabParamList = {
  Home: undefined;
  Leaderboard: undefined;
  Settings: undefined;
  Profile: undefined;
  HistoricalEvents: undefined;
  Debug: undefined;
};

// Create the navigators
const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

// Bottom Tab Navigator
const MainTabNavigator = () => {
  const { styles: themeStyles } = useAppTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: themeStyles.primary,
        tabBarInactiveTintColor: themeStyles.text,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        tabBarStyle: {
          backgroundColor: themeStyles.surface,
          borderTopColor: 'rgba(0, 0, 0, 0.1)',
        },
        headerStyle: {
          backgroundColor: themeStyles.surface,
        },
        headerTintColor: themeStyles.text,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <ErrorBoundary>
              <Icon name="home" size={size} color={color} />
            </ErrorBoundary>
          ),
          headerTitle: 'History Time',
        }}
      />
      <Tab.Screen
        name="Leaderboard"
        component={LeaderboardScreen}
        options={{
          tabBarLabel: 'Leaderboard',
          tabBarIcon: ({ color, size }) => (
            <ErrorBoundary>
              <Icon name="leaderboard" size={size} color={color} />
            </ErrorBoundary>
          ),
          headerTitle: 'Leaderboard',
        }}
      />
      <Tab.Screen
        name="HistoricalEvents"
        component={HistoricalEventsScreen}
        options={{
          tabBarLabel: 'Events',
          tabBarIcon: ({ color, size }) => (
            <ErrorBoundary>
              <Icon name="event" size={size} color={color} />
            </ErrorBoundary>
          ),
          headerTitle: 'Historical Events',
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <ErrorBoundary>
              <Icon name="settings" size={size} color={color} />
            </ErrorBoundary>
          ),
          headerTitle: 'App Settings',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <ErrorBoundary>
              <Icon name="game" size={size} color={color} />
            </ErrorBoundary>
          ),
          headerTitle: 'Your Profile',
        }}
      />
      <Tab.Screen
        name="Debug"
        component={DiagnosticsScreen}
        options={{
          tabBarLabel: 'Debug',
          tabBarIcon: ({ color, size }) => (
            <ErrorBoundary>
              <Icon name="settings" size={size} color={color} />
            </ErrorBoundary>
          ),
          headerTitle: 'Diagnostics',
        }}
      />
    </Tab.Navigator>
  );
};

// Root Stack Navigator
const AppNavigator: React.FC = () => {
  const { styles: themeStyles } = useAppTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: themeStyles.surface,
        },
        headerTintColor: themeStyles.text,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        contentStyle: {
          backgroundColor: themeStyles.background,
        },
      }}
    >
      <Stack.Screen name="Main" component={MainTabNavigator} options={{ headerShown: false }} />
      <Stack.Screen
        name="GameBoard"
        component={GameBoardScreen}
        options={({ route }) => ({
          title: `${route.params.category || 'All Categories'} - ${
            route.params.difficulty.charAt(0).toUpperCase() + route.params.difficulty.slice(1)
          } Game`,
        })}
      />
      <Stack.Screen
        name="Diagnostics"
        component={DiagnosticsScreen}
        options={{
          title: 'System Diagnostics',
        }}
      />
      <Stack.Screen
        name="HistoricalEvents"
        component={HistoricalEventsScreen}
        options={{
          title: 'Historical Events',
        }}
      />
      <Stack.Screen
        name="CardManagerTest"
        component={CardManagerTestScreen}
        options={{
          title: 'CardManager Test',
        }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
