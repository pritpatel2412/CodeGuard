# Golden Comments for Implement access token context encoding framework

## [Critical]
Wrong parameter in null check (grantType vs. rawTokenId)

## [High]
In isAccessTokenId, the substring for the grant shortcut and the equality check look inverted: the grant shortcut occupies indices 4–5 (substring(4,6)), and a match should return true (combined with UUID check), not false.

## [Low]
Javadoc mentions "usually like 3-letters shortcut" but some implementations use 2-letter shortcuts ("ac", "cc", "rt", "te", "pc", "ci", "ro"). Consider updating documentation to reflect actual usage pattern.

## [Low]
 Catching generic RuntimeException is too broad. The implementation throws IllegalArgumentException specifically - catch that instead for more precise testing.
