import React from 'react';
import { TouchableOpacity, View, Image, Text, StyleSheet } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
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
import TranscriptScreen from './screens/TranscriptScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

function HeaderTitle({ title, color }: { title: string; color: string }) {
  return (
    <View style={styles.headerTitleContainer}>
      <Image
        source={require('./assets/logo.png')}
        style={styles.headerLogo}
        resizeMode="contain"
      />
      <Text style={[styles.headerTitleText, { color }]}>{title}</Text>
    </View>
  );
}

function AppNavigator() {
  const { colors, isDark } = useTheme();

  const navigationTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      primary: colors.primary,
      background: colors.background,
      card: colors.card,
      text: colors.text,
      border: colors.border,
      notification: colors.primary,
    },
  };

  return (
    <NavigationContainer theme={navigationTheme}>
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
          headerBackTitleVisible: false,
          headerBackButtonDisplayMode: 'minimal',
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={({ navigation }) => ({
            headerTitle: () => (
              <HeaderTitle title="CDB BrainRecorder" color={colors.text} />
            ),
            headerBackTitle: ' ',
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
            headerBackTitle: '',
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
            headerBackTitle: '',
          }}
        />
        <Stack.Screen
          name="Transcript"
          component={TranscriptScreen}
          options={{
            title: 'Transkript',
            presentation: 'card',
            headerBackTitle: '',
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

const styles = StyleSheet.create({
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerLogo: {
    width: 32,
    height: 32,
  },
  headerTitleText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
