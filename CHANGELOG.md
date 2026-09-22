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
