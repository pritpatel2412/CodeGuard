# Golden Comments for feat: add calendar cache status and actions (#22532)

## [Medium]
The updateManyByCredentialId call uses an empty data object, which prevents Prisma's @updatedAt decorator from updating the updatedAt timestamp. This results in inaccurate cache status tracking, as the timestamp isn't updated when the cache is refreshed. To fix this, explicitly set the updatedAt field.

## [Low]
logic: macOS-specific sed syntax with empty string after -i flag will fail on Linux systems
