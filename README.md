# Vault

A small, offline-only secrets vault for iOS and Android. Not a 1Password/Bitwarden
replacement — no cloud sync, no cross-device sharing, no browser autofill. A single
device, gated by biometrics, for a narrow set of things people actually need to keep:

- Wi-Fi credentials
- Software license keys
- Recovery codes (one or more per entry)
- Freeform "important numbers" (PINs, passport numbers, etc.)
- Device details (name, serial number, specs)
- Secure notes
- Encrypted attachments and tags, attachable to any entry above

## Security model

- **Encryption at rest**: every field and attachment is encrypted with AES-256-GCM
  before it reaches disk. The key is derived from a random seed stored in the
  platform Keychain (iOS) / Keystore (Android), gated by biometry or device passcode —
  there's no separate master password. See `src/shared/crypto`.
- **Unlock gate**: `src/shared/sessionGuard` is an explicit state machine
  (`locked → authenticating → unlocked | cooldown`), not a boolean. It owns idle
  timeout, re-lock on backgrounding, and failed-attempt lockout with a cooldown.
- **No cloud sync.** The only way data leaves or enters the vault is a manual,
  passphrase-encrypted export/import file (`src/features/backup`).
- **In-memory-only search**: the search index (`src/features/search`) is built
  fresh on every unlock and lives only in component state — it's never written to
  disk, and disappears the moment the app locks.
- **Reveal-on-demand fields**: secret values are masked by default, reveal on tap,
  and auto re-mask after a timeout (`src/shared/components/RevealableSecretField`).
- **Clipboard auto-clear** after copying a revealed value — see that component for
  the real platform limitations (this only works while the app stays foregrounded).
- **Screenshot protection**: enabled via Android's `FLAG_SECURE` where the platform
  allows it. iOS has no equivalent API; don't rely on this on iOS.

## Project structure

```
src/
  app/            App composition: entry point, unlock screen, vault key context
  features/       One folder per entry type, plus attachments/search/backup/tags
  shared/
    crypto/        Key derivation, encrypt/decrypt — the only code that touches
                    a raw cipher API
    storage/       Encrypted record + attachment file persistence
    sessionGuard/   The lock state machine
    components/     Cross-feature UI (RevealableSecretField, ...)
    theme/          Colors, spacing
  navigation/      React Navigation stack + route types
```

## Getting started

```sh
corepack enable
yarn install
```

iOS also needs CocoaPods:

```sh
bundle install
bundle exec pod install
```

Then:

```sh
yarn ios      # or: yarn android
```

See [CONTRIBUTING.md](./CONTRIBUTING.md) for commands, commit conventions, and what
a security-sensitive change needs to include.
