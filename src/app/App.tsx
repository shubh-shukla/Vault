import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { provisionVaultKeyIfNeeded } from '@shared/crypto';
import { useSessionGuard } from '@shared/sessionGuard';
import { colors } from '@shared/theme';
import { UnlockScreen } from './UnlockScreen';

function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" />
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {
  const [isProvisioned, setIsProvisioned] = useState(false);

  useEffect(() => {
    provisionVaultKeyIfNeeded().then(() => setIsProvisioned(true));
  }, []);

  const handleLocked = useCallback(() => {
    // No decrypted vault state exists yet to discard — added once the
    // in-memory index (search) and entry screens land.
  }, []);

  const { status, failedAttempts, cooldownUntil, requestUnlock } =
    useSessionGuard({
      onLocked: handleLocked,
    });

  if (!isProvisioned) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  if (status === 'unlocked') {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.unlockedText}>Vault</Text>
      </View>
    );
  }

  return (
    <UnlockScreen
      status={status}
      failedAttempts={failedAttempts}
      cooldownUntil={cooldownUntil}
      onRequestUnlock={requestUnlock}
    />
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  unlockedText: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: '600',
  },
});

export default App;
