# Golden Comments for feat: convert InsightsBookingService to use Prisma.sql raw queries

## [Low]
In getBaseConditions(), the else if (filterConditions) and final else branches are unreachable. This is because getAuthorizationConditions() always returns a non-null Prisma.Sql object, making authConditions always truthy, which means only the first two if/else if conditions are ever evaluated.

## [Medium]
Fetching userIdsFromOrg only when teamsFromOrg.length > 0 can exclude org-level members for orgs without child teams; consider deriving from teamIds (which includes orgId) or removing the guard so org-only orgs still include member user bookings.
