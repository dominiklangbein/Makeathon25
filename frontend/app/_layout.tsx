import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import * as Linking from 'expo-linking'; // Added
import { useEffect, useState } from 'react';
import { View, Text, Button } from 'react-native'; // Added
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import React from 'react';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const [incomingLink, setIncomingLink] = useState<string | null>(null); // Added

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // Handle incoming deep links
  useEffect(() => {
    const handleDeepLink = (event: Linking.EventType) => {
      const url = event.url;
      console.log('Received URL:', url);
      setIncomingLink(url);
    };

    const subscription = Linking.addEventListener('url', handleDeepLink);

    (async () => {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        console.log('App opened from link:', initialUrl);
        setIncomingLink(initialUrl);
      }
    })();

    return () => {
      subscription.remove();
    };
  }, []);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>

      {/* 👇 Floating incoming link view */}
      {incomingLink && (
        <View style={{
          position: 'absolute',
          bottom: 50,
          left: 20,
          right: 20,
          padding: 16,
          backgroundColor: 'white',
          borderRadius: 8,
          shadowColor: '#000',
          shadowOpacity: 0.2,
          shadowRadius: 6,
          elevation: 5,
        }}>
          <Text>Received link: {incomingLink}</Text>
        </View>
      )}

      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
