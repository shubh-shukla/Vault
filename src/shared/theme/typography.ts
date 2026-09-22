import { Platform } from 'react-native';

// Menlo doesn't exist on Android — this is the one font-family reference
// every screen showing a secret value should use, on both platforms.
export const monospaceFontFamily = Platform.select({
  ios: 'Menlo',
  android: 'monospace',
  default: 'monospace',
});

export const typography = {
  display: { fontSize: 28, lineHeight: 34, fontWeight: '700' as const },
  title: { fontSize: 20, lineHeight: 26, fontWeight: '600' as const },
  body: { fontSize: 16, lineHeight: 22, fontWeight: '400' as const },
  bodyEmphasis: { fontSize: 16, lineHeight: 22, fontWeight: '600' as const },
  label: { fontSize: 13, lineHeight: 18, fontWeight: '500' as const },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '400' as const },
  secretValue: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '400' as const,
    fontFamily: monospaceFontFamily,
  },
} as const;
