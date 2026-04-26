# `.codeguard.yml` Specification

CodeGuard supports repository-level security policy definitions using a `.codeguard.yml` file at the root of your repository.

## File Location

- Path: `.codeguard.yml`
- Branch scope: policy is loaded from the PR head SHA
- If no policy file exists, CodeGuard skips custom policy enforcement

## Supported Schema

```yaml
version: "1"
policy_name: "Acme Corp Security Standards v2.1"
compliance: ["SOC2", "HIPAA", "OWASP-ASVS"]

rules:
  - id: "ACME-001"
    name: "PII must be hashed before database storage"
    severity: "CRITICAL" # CRITICAL | HIGH | MEDIUM | LOW
    description: >
      Any variable containing PII must be hashed before writing to storage.
    examples:
      violation: "await db.users.create({ email: user.email })"
      compliant: "await db.users.create({ email: EncryptionUtils.hash(user.email) })"

disabled_builtin_rules:
  - "PERF-N-PLUS-ONE"
```

## Validation Rules

- `version`: string (defaults to `"1"`)
- `policy_name`: string (defaults to `"Custom Policy"`)
- `compliance`: string array (defaults to `[]`)
- `rules`: array of up to **50** rules
- `disabled_builtin_rules`: string array (defaults to `[]`)

Each rule must include:

- `id`: non-empty string, max 50 chars
- `name`: non-empty string, max 200 chars
- `severity`: one of `CRITICAL`, `HIGH`, `MEDIUM`, `LOW`
- `description`: string, minimum 10 chars
- `examples` is optional and may include `violation` / `compliant`

If parsing or validation fails, CodeGuard logs a policy load error and does not enforce invalid policy rules for that run.

## Enforcement Behavior

- Custom policy checks run after standard CodeGuard review analysis.
- Violations are stored as `policy_violations` records tied to the review.
- A summary comment is posted to the PR if any policy violations are detected.
- Dashboard surfaces:
  - repository policy metadata and rules
  - per-review policy violations
