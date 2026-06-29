# Golden Comments for Span Buffer Multiprocess Enhancement with Health Monitoring

## [Medium]
Inconsistent metric tagging with 'shard' and 'shards'

## [Low]
Fixed sleep in tests can be flaky; wait on condition instead

## [High]
Because flusher processes are created via multiprocessing.get_context('spawn').Process, they are instances of multiprocessing.context.SpawnProcess, which on POSIX is not a subclass of multiprocessing.Process, so this isinstance check will always be false and hung processes won't be killed here.

## [Medium]
Sleep in test_consumer.py won’t actually wait because time.sleep was monkeypatched above; consider restoring sleep or using a different sync to ensure the flusher has time to process.

## [Medium]
Breaking out of the loop when the deadline has elapsed can skip terminating remaining flusher processes, potentially leaving them running after shutdown; consider ensuring termination is attempted even if the deadline is exceeded.
