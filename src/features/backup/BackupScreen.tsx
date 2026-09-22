import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
} from 'react-native';
import {
  keepLocalCopy,
  pick,
  saveDocuments,
} from '@react-native-documents/picker';
import RNFS from 'react-native-fs';
import { useVaultKey } from '@app/VaultKeyContext';
import { colors, radius, spacing, typography } from '@shared/theme';
import {
  BackupDecryptionError,
  exportVaultBackup,
  importVaultBackup,
} from './backupService';
import type { ImportSummary } from './types';

function summaryTotal(summary: ImportSummary): number {
  return (
    summary.wifiCredentials +
    summary.licenseKeys +
    summary.recoveryCodes +
    summary.importantNumbers +
    summary.deviceDetails +
    summary.secureNotes
  );
}

export function BackupScreen() {
  const vaultKey = useVaultKey();
  const [passphrase, setPassphrase] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  const handleExport = async () => {
    if (passphrase.length === 0) {
      setStatus('Enter a passphrase to encrypt the backup.');
      return;
    }

    setIsBusy(true);
    setStatus(null);
    try {
      const contents = await exportVaultBackup(vaultKey, passphrase);
      const tempPath = `${
        RNFS.CachesDirectoryPath
      }/vault-backup-${Date.now()}.json`;
      await RNFS.writeFile(tempPath, contents, 'utf8');
      try {
        await saveDocuments({
          sourceUris: [`file://${tempPath}`],
          fileName: 'vault-backup.json',
          mimeType: 'application/json',
        });
      } finally {
        await RNFS.unlink(tempPath);
      }
      setStatus('Backup exported.');
    } catch {
      setStatus('Export failed.');
    } finally {
      setIsBusy(false);
    }
  };

  const handleImport = async () => {
    if (passphrase.length === 0) {
      setStatus('Enter the passphrase this backup was exported with.');
      return;
    }

    setIsBusy(true);
    setStatus(null);
    try {
      const [picked] = await pick({ mode: 'import' });
      const [copy] = await keepLocalCopy({
        files: [
          { uri: picked.uri, fileName: picked.name ?? 'vault-backup.json' },
        ],
        destination: 'cachesDirectory',
      });

      if (copy.status !== 'success') {
        setStatus('Could not read the selected file.');
        return;
      }

      const localPath = copy.localUri.replace('file://', '');
      const contents = await RNFS.readFile(localPath, 'utf8');
      await RNFS.unlink(localPath);

      const summary = await importVaultBackup(vaultKey, contents, passphrase);
      setStatus(
        `Imported ${summaryTotal(summary)} entries and ${
          summary.attachments
        } attachments.`,
      );
    } catch (error) {
      setStatus(
        error instanceof BackupDecryptionError
          ? 'Incorrect passphrase or corrupted backup file.'
          : 'Import failed.',
      );
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.fieldLabel}>Backup passphrase</Text>
      <TextInput
        style={styles.input}
        value={passphrase}
        onChangeText={setPassphrase}
        placeholder="Passphrase"
        placeholderTextColor={colors.textSecondary}
        secureTextEntry
        autoCapitalize="none"
      />

      <Pressable
        accessibilityRole="button"
        style={styles.primaryButton}
        onPress={handleExport}
        disabled={isBusy}
      >
        <Text style={styles.primaryButtonText}>Export backup</Text>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        style={styles.secondaryButton}
        onPress={handleImport}
        disabled={isBusy}
      >
        <Text style={styles.secondaryButtonText}>Import backup</Text>
      </Pressable>

      {isBusy && (
        <ActivityIndicator color={colors.accent} style={styles.spinner} />
      )}
      {status && <Text style={styles.statusText}>{status}</Text>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
  },
  fieldLabel: {
    ...typography.label,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  input: {
    ...typography.body,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  primaryButton: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  primaryButtonText: {
    ...typography.bodyEmphasis,
    color: colors.accentText,
  },
  secondaryButton: {
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  secondaryButtonText: {
    ...typography.bodyEmphasis,
    color: colors.textPrimary,
  },
  spinner: {
    marginTop: spacing.lg,
  },
  statusText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.lg,
  },
});
