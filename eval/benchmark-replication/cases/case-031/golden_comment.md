# Golden Comments for Fixing Re-authentication with passkeys

## [Medium]
ConditionalPasskeysEnabled() called without UserModel parameter

## [Medium]
With isConditionalPasskeysEnabled(UserModel user) requiring user != null, authenticate(...) will not call webauthnAuth.fillContextForm(context) on the initial login page where context.getUser() is still null, so conditional passkey UI will not be set up for first-time passkey login. Consider whether this should also be enabled when no user has been selected yet so ID-less passkey authentication on the initial login form continues to work.
