import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors, spacing } from '@shared/theme';
import type { SessionGuardStatus } from '@shared/sessionGuard';

export interface UnlockScreenProps {
  status: Exclude<SessionGuardStatus, 'unlocked'>;
  failedAttempts: number;
  cooldownUntil: number | null;
  onRequestUnlock: () => void;
}

function useRemainingCooldownSeconds(cooldownUntil: number | null): number {
  const [remainingMs, setRemainingMs] = useState(() =>
    cooldownUntil === null ? 0 : cooldownUntil - Date.now(),
  );

  useEffect(() => {
    if (cooldownUntil === null) {
      return;
    }
    setRemainingMs(cooldownUntil - Date.now());
    const interval = setInterval(() => {
      setRemainingMs(cooldownUntil - Date.now());
    }, 250);
    return () => clearInterval(interval);
  }, [cooldownUntil]);

  return Math.max(0, Math.ceil(remainingMs / 1000));
}

export function UnlockScreen({
  status,
  failedAttempts,
  cooldownUntil,
  onRequestUnlock,
}: UnlockScreenProps) {
  const remainingSeconds = useRemainingCooldownSeconds(cooldownUntil);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Vault</Text>

      {status === 'authenticating' && (
        <View style={styles.statusBlock}>
          <ActivityIndicator color={colors.accent} />
          <Text style={styles.statusText}>Authenticating…</Text>
        </View>
      )}

      {status === 'cooldown' && (
        <View style={styles.statusBlock}>
          <Text style={styles.dangerText}>Too many failed attempts</Text>
          <Text style={styles.statusText}>
            Try again in {remainingSeconds}s
          </Text>
        </View>
      )}

      {status === 'locked' && (
        <>
          {failedAttempts > 0 && (
            <Text style={styles.dangerText}>
              {failedAttempts} failed attempt{failedAttempts === 1 ? '' : 's'}
            </Text>
          )}
          <Pressable
            accessibilityRole="button"
            onPress={onRequestUnlock}
            style={styles.unlockButton}
          >
            <Text style={styles.unlockButtonText}>Unlock</Text>
          </Pressable>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: spacing.xl,
  },
  statusBlock: {
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statusText: {
    color: colors.textSecondary,
    fontSize: 16,
  },
  dangerText: {
    color: colors.danger,
    fontSize: 14,
    marginBottom: spacing.sm,
  },
  unlockButton: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: spacing.sm,
  },
  unlockButtonText: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
});
