# Changelog

All notable changes to this project are documented here. Format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), commit history follows
[Conventional Commits](https://www.conventionalcommits.org/).

## [Unreleased]

### Added

- Project scaffold: React Native + TypeScript (strict mode), path aliases.
- ESLint, Prettier, Husky, lint-staged.
- GitHub Actions CI (typecheck, lint, format check, test).
- Renovate, PR template, CONTRIBUTING guide.
- Keychain-backed key derivation and AES-256-GCM encrypt/decrypt primitives
  (`shared/crypto`).
- sessionGuard lock state machine (idle timeout, background re-lock,
  failed-attempt lockout with cooldown) and the biometric unlock screen.
- Navigation shell, in-memory vault key context, and the encrypted record
  storage layer (`shared/storage`).
- Wi-Fi credentials: CRUD with field-level encryption, reveal-on-demand
  password field with clipboard auto-clear (`shared/components/RevealableSecretField`).
- License keys: CRUD with field-level encryption, reveal-on-demand key field.
- Recovery codes: CRUD for multi-code entries, all codes revealed together.
- Important numbers: CRUD for freeform label/value entries with a
  reveal-on-demand value field.
- Device details: CRUD for device name, serial number, specs, and notes
  (no reveal-on-demand field — nothing in this entry type is secret).
- Secure notes: CRUD for freeform title/body notes.
- Encrypted attachments (`features/attachments`): import a file via the
  system document picker, encrypt it with a dedicated attachment subkey,
  and store it under a random on-disk name — the original filename only
  ever exists inside the encrypted metadata record, never as a path.
  Wired into secure notes as the first consumer via `AttachmentsSection`.
- In-memory search (`features/search`) across all six entry types. The
  index is built once per unlock, held only in component state, and
  discarded automatically when the app locks (the whole navigator
  unmounts) — it is never written to disk.
- Encrypted backup export/import (`features/backup`). Export re-encrypts
  every entry and attachment under a key derived from a user-chosen
  passphrase via scrypt (independent of the device Keychain, so the file
  is restorable on another device), and saves it through the system
  "save as" dialog. Import reverses that, then writes each entry back
  through the normal per-feature repositories under the _current_
  device's vault key. No cloud sync — this is the only way data leaves
  or enters the vault.
- Tags (`features/tags`): create/rename/delete a tag and assign it to
  any entry via (entryType, entryId), same cross-cutting treatment as
  attachments. Wired into Wi-Fi credentials and secure notes as pilot
  consumers, including a tag-filter row on the Wi-Fi credentials list.
- A consolidated "no decrypted value is ever written to disk or a search
  index" test exercising all six entry types, attachments, tags, and
  search indexing in one place, plus a `no-console` ESLint rule scoped
  to `shared/crypto`, `shared/storage`, and every `*Repository.ts` so a
  future change can't silently start logging a decrypted value.
- A real project README replacing the React Native CLI boilerplate.
