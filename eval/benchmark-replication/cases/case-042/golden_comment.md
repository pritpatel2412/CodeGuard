# Golden Comments for feat(upsampling) - Support upsampled error count with performance optimizations

## [Low]
sample_rate = 0.0 is falsy and skipped

## [Low]
Using Python’s built-in hash() to build cache keys is non-deterministic across processes (hash randomization), so keys won’t match across workers and invalidate_upsampling_cache may fail to delete them. Use a deterministic serialization of project_ids for the cache key.

## [Medium]
The upsampling eligibility check passes the outer dataset instead of the actual dataset used by scoped_dataset. In paths where the query ultimately runs against discover (e.g., dashboard split) while the original dataset is metrics, upsampling may be skipped even when all projects are allowlisted.
