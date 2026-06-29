# Golden Comments for FIX: proper handling of group memberships

## [High]
 The findMembers() call is now asynchronous and unhandled. The controller may not have member data immediately available, creating a race condition.

## [Medium]
In the next action, capping the next offset at user_count can produce an empty page (e.g., total equal to limit results in offset == total, showing 2/2 with no members). This can cause confusing UX on the last page.

## [Medium]
HTTP method mismatch in .remove_member - test uses PUT but remove_member action expects DELETE
