import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { colors, spacing } from '@shared/theme';

const DEFAULT_REVEAL_DURATION_MS = 15_000;
const DEFAULT_CLIPBOARD_CLEAR_DELAY_MS = 30_000;
const MASK = '••••••••';

export interface RevealableSecretFieldProps {
  label: string;
  value: string;
  revealDurationMs?: number;
  clipboardClearDelayMs?: number;
}

export function RevealableSecretField({
  label,
  value,
  revealDurationMs = DEFAULT_REVEAL_DURATION_MS,
  clipboardClearDelayMs = DEFAULT_CLIPBOARD_CLEAR_DELAY_MS,
}: RevealableSecretFieldProps) {
  const [isRevealed, setIsRevealed] = useState(false);
  const reMaskTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (reMaskTimerRef.current) {
        clearTimeout(reMaskTimerRef.current);
      }
    };
  }, []);

  const reveal = useCallback(() => {
    setIsRevealed(true);
    if (reMaskTimerRef.current) {
      clearTimeout(reMaskTimerRef.current);
    }
    reMaskTimerRef.current = setTimeout(
      () => setIsRevealed(false),
      revealDurationMs,
    );
  }, [revealDurationMs]);

  const hide = useCallback(() => {
    setIsRevealed(false);
    if (reMaskTimerRef.current) {
      clearTimeout(reMaskTimerRef.current);
      reMaskTimerRef.current = null;
    }
  }, []);

  const copy = useCallback(() => {
    Clipboard.setString(value);
    setTimeout(async () => {
      const current = await Clipboard.getString();
      if (current === value) {
        Clipboard.setString('');
      }
    }, clipboardClearDelayMs);
  }, [value, clipboardClearDelayMs]);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        <Text style={styles.value} selectable={isRevealed}>
          {isRevealed ? value : MASK}
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={isRevealed ? hide : reveal}
          style={styles.actionButton}
        >
          <Text style={styles.actionText}>
            {isRevealed ? 'Hide' : 'Reveal'}
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={copy}
          style={styles.actionButton}
        >
          <Text style={styles.actionText}>Copy</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 13,
    marginBottom: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  value: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 16,
    fontFamily: 'Menlo',
  },
  actionButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  actionText: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '600',
  },
});
