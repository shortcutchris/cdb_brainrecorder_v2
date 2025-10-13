import React from 'react';
import { TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from './types';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';

// Screens
import HomeScreen from './screens/HomeScreen';
import PlayerScreen from './screens/PlayerScreen';
import RecordingScreen from './screens/RecordingScreen';
import SettingsScreen from './screens/SettingsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

function AppNavigator() {
  const { colors, isDark } = useTheme();

  return (
    <NavigationContainer>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.card,
          },
          headerTintColor: colors.text,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerShadowVisible: true,
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={({ navigation }) => ({
            title: 'CDB BrainRecorder',
            headerRight: () => (
              <TouchableOpacity
                onPress={() => navigation.navigate('Settings')}
                style={{ padding: 8 }}
              >
                <Ionicons name="settings-outline" size={24} color={colors.text} />
              </TouchableOpacity>
            ),
          })}
        />
        <Stack.Screen
          name="Player"
          component={PlayerScreen}
          options={{
            title: '',
            presentation: 'card',
          }}
        />
        <Stack.Screen
          name="Recording"
          component={RecordingScreen}
          options={{
            title: 'Aufnahme',
            presentation: 'fullScreenModal',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            title: 'Einstellungen',
            presentation: 'card',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppNavigator />
    </ThemeProvider>
  );
}
