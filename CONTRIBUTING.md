# Contributing

## Setup

```sh
corepack enable
yarn install
```

## Commands

```sh
yarn typecheck
yarn lint
yarn format:check
yarn test
```

All four run in CI on every PR; `yarn lint`/`yarn format` also run on staged files via
the pre-commit hook.

## Commit messages

This repo follows [Conventional Commits](https://www.conventionalcommits.org/):

- `feat(scope): ...` — new capability
- `fix(scope): ...` — bug fix
- `chore: ...` — tooling, CI, deps
- `refactor(scope): ...` — no behavior change
- `test(scope): ...` — test-only change

Scope is the feature folder name (`wifi-credentials`, `session-guard`, `crypto`, ...).
Keep commits small and each one buildable/lintable/testable on its own — avoid a commit
that stubs out encryption or leaves an entry type reachable before it's wired to
`shared/crypto`.

## Security-sensitive changes

Anything touching `shared/crypto`, `shared/sessionGuard`, or `shared/storage` needs:

- A round-trip test (encrypt → persist → decrypt) for any new field or entry type.
- No new code path that logs, indexes, or persists a decrypted value.
- A state machine test for any new `sessionGuard` transition.
