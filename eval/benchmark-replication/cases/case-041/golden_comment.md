# Golden Comments for Optimize spans buffer insertion with eviction during insert

## [Critical]
OptimizedCursorPaginator negative-offset branch slices QuerySet with a negative start index

## [High]
BasePaginator negative-offset branch slices QuerySet with a negative start index

## [High]
OptimizedCursorPaginator.get_item_key uses floor/ceil on a datetime key (order_by='-datetime'), causing TypeError.
