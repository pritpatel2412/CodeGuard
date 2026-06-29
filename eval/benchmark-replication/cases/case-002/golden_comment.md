# Golden Comments for feat: 2fa backup codes

## [Low]
The exported function TwoFactor handles backup codes and is in BackupCode.tsx. Inconsistent naming.

## [Low]
Error message mentions 'backup code login' but this is a disable endpoint, not login

## [Medium]
Backup code validation is case-sensitive due to the use of indexOf(). This causes validation to fail if a user enters uppercase hex characters, as backup codes should be case-insensitive for a better user experience.

## [High]
Because backupCodes are decrypted and mutated in memory before being written back, two concurrent login requests using the same backupCode could both pass this check and update, so a single backup code may effectively be accepted more than once if used concurrently, weakening the intended one-time-use semantics.
