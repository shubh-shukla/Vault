import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '@shared/theme';

export function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.placeholder}>No entries yet.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  placeholder: {
    color: colors.textSecondary,
    fontSize: 16,
  },
});
