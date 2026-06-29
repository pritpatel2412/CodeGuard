# Golden Comments for Unified Storage Performance Optimizations

## [High]
A race condition in BuildIndex allows multiple goroutines to concurrently build the same expensive index for the same key. This is caused by moving the b.cacheMu lock from protecting the entire function to only protecting the final cache assignment. 

## [High]
Calling s.search.TotalDocs() here may race with concurrent index creation: TotalDocs iterates b.cache without synchronization, and the event watcher goroutine started just above could trigger BuildIndex writes concurrently, potentially causing a concurrent map read/write panic.
