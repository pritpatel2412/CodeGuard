# Golden Comments for Add HTML sanitizer for translated message resources

## [Medium]
The translation is in Italian instead of Lithuanian. This should be translated to Lithuanian to match the file's locale (messages_lt.properties).

## [Medium]
The totpStep1 value uses Traditional Chinese terms in the Simplified Chinese file (zh_CN), which is likely incorrect for this locale. Please verify the locale‑appropriate translation.

## [Low]
The anchor sanitization logic has a potential issue where it consumes English matcher groups without proper validation. If the translated text has more anchor tags than the English text, this could lead to incorrect validation results.

## [Low]
The method name 'santizeAnchors' should be 'sanitizeAnchors' (missing 'i').
