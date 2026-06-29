# Golden Comments for GitHub OAuth Security Enhancement

## [Medium]
Null reference if github_authenticated_user state is missing

## [Medium]
OAuth state uses pipeline.signature (static) instead of a per-request random value

## [High]
The code attempts to access integration.metadata[sender][login] without checking for the existence of the sender key. This causes a KeyError for integrations where the sender metadata was not set during creation
