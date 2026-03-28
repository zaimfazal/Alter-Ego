import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text } from 'react-native';
import * as Font from 'expo-font';
import { Inter_400Regular, Inter_500Medium } from '@expo-google-fonts/inter';
import { SpaceGrotesk_600SemiBold, SpaceGrotesk_700Bold } from '@expo-google-fonts/space-grotesk';

import AppNavigator from './navigation/AppNavigator';
import { COLORS, TYPOGRAPHY, SIZES } from './constants/theme';
import { Shield } from 'lucide-react-native';

export default function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      await Font.loadAsync({
        'Inter-Regular': Inter_400Regular,
        'Inter-Medium': Inter_500Medium,
        'SpaceGrotesk-SemiBold': SpaceGrotesk_600SemiBold,
        'SpaceGrotesk-Bold': SpaceGrotesk_700Bold,
      });
      // Add deliberate 1.5s delay so the launch screen motivation is readable
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsReady(true);
    }
    loadFonts();
  }, []);

  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar style="light" backgroundColor={COLORS.surfaceContainerLowest} />
        <View style={styles.launchCenter}>
           <Shield size={64} color={COLORS.primaryFixed} />
           <Text style={styles.launchTitle}>ALTER EGO</Text>
        </View>
        <Text style={styles.launchMotivation}>EXCUSES ARE INVALID. EXECUTE.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor={COLORS.surfaceContainerLowest} />
      <AppNavigator />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surfaceContainerLowest,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.surfaceContainerLowest,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 80,
  },
  launchCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  launchTitle: {
    fontFamily: TYPOGRAPHY.display,
    color: COLORS.onSurface,
    fontSize: 40,
    marginTop: SIZES.md,
    letterSpacing: 4,
  },
  launchMotivation: {
    fontFamily: TYPOGRAPHY.label,
    color: COLORS.primaryFixed,
    fontSize: SIZES.sm,
    letterSpacing: 2,
    paddingHorizontal: SIZES.xl,
    textAlign: 'center',
  }
});
