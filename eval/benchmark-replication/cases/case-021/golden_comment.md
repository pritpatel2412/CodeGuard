# Golden Comments for Anonymous: Add configurable device limit

## [High]
Race condition: Multiple concurrent requests could pass the device count check simultaneously and create devices beyond the limit. Consider using a database transaction or lock.

## [Medium]
Anonymous authentication now fails entirely if anonDeviceService.TagDevice returns ErrDeviceLimitReached. Previously, device tagging was asynchronous and non-blocking. This change prevents anonymous users from authenticating when the device limit is reached.

## [Medium]
This call won’t compile: dbSession.Exec(args...) is given a []interface{} where the first element is the query, but Exec’s signature requires a first parameter of type string (not an interface{} splat).

## [Low]
Returning ErrDeviceLimitReached when no rows were updated is misleading; the device might not exist.

## [Low]
Time window calculation inconsistency: Using device.UpdatedAt.UTC().Add(-anonymousDeviceExpiration) as the lower bound but device.UpdatedAt as the current time may not match the intended logic. Consider using time.Now().UTC() consistently.
