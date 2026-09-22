## Summary

<!-- What does this change, and why? -->

## Security checklist

- [ ] No decrypted/plaintext value is written to disk, logs, or a search index.
- [ ] Every new persisted field is encrypted before it reaches `shared/storage`.
- [ ] Any new `sessionGuard` transition is covered by a state machine test.
- [ ] No new dependency was added without checking its license against the approved list.

## Test plan

<!-- Commands run, devices/simulators used, edge cases exercised -->

- [ ] `yarn typecheck`
- [ ] `yarn lint`
- [ ] `yarn test`
