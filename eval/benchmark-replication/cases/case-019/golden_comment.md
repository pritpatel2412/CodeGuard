# Golden Comments for FEATURE: Localization fallbacks (server-side)

## [Low]
Thread-safety issue with lazy @loaded_locales

## [Low]
Consider normalizing the input locale (e.g., to a symbol) when checking/loading here to avoid double-loading if the same locale is passed as a String vs Symbol (also applies to other locations in the PR).
