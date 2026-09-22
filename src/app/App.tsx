import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StatusBar, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { provisionVaultKeyIfNeeded } from '@shared/crypto';
import { useSessionGuard } from '@shared/sessionGuard';
import { colors } from '@shared/theme';
import { RootNavigator } from '@navigation/RootNavigator';
import { UnlockScreen } from './UnlockScreen';
import { VaultKeyProvider } from './VaultKeyContext';

function App() {
  return (
    <GestureHandlerRootView style={styles.flex}>
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" />
        <AppContent />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function AppContent() {
  const [isProvisioned, setIsProvisioned] = useState(false);
  const vaultKeyRef = useRef<Buffer | null>(null);
  const [, forceRenderAfterVaultKeyChange] = useState(false);

  useEffect(() => {
    provisionVaultKeyIfNeeded().then(() => setIsProvisioned(true));
  }, []);

  const handleUnlocked = useCallback((vaultKey: Buffer) => {
    vaultKeyRef.current = vaultKey;
    forceRenderAfterVaultKeyChange(value => !value);
  }, []);

  const handleLocked = useCallback(() => {
    vaultKeyRef.current = null;
    forceRenderAfterVaultKeyChange(value => !value);
  }, []);

  const { status, failedAttempts, cooldownUntil, requestUnlock } =
    useSessionGuard({
      onUnlocked: handleUnlocked,
      onLocked: handleLocked,
    });

  if (!isProvisioned) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  if (status !== 'unlocked') {
    return (
      <UnlockScreen
        status={status}
        failedAttempts={failedAttempts}
        cooldownUntil={cooldownUntil}
        onRequestUnlock={requestUnlock}
      />
    );
  }

  if (!vaultKeyRef.current) {
    // AUTH_SUCCESS and onUnlocked always land in the same update batch, so
    // this is unreachable in practice — it only satisfies the type checker.
    return null;
  }

  return (
    <VaultKeyProvider vaultKey={vaultKeyRef.current}>
      <RootNavigator />
    </VaultKeyProvider>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});

export default App;
