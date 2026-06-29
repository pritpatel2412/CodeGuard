# Golden Comments for AuthZService: improve authz caching

## [High]
The Check operation exhibits asymmetric cache trust logic: cached permission grants are trusted and returned immediately, but cached denials from the same permission cache are ignored, leading to a fresh database lookup. This allows stale cached grants to provide access to revoked resources, posing a security risk. 

## [Low]
The test comment says the cached permissions 'allow access', but the map stores false for dashboards:uid:dash1, so checkPermission will still treat this scope as not allowed.
