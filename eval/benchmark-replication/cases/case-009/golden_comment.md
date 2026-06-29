# Golden Comments for Add guest management functionality to existing bookings

## [High]
Case sensitivity bypass in email blacklist

## [Critical]
The logic for checking team admin/owner permissions is incorrect. This condition uses AND (&&) which requires both isTeamAdmin AND isTeamOwner to be true, but it should use OR (||) since a user needs to be either an admin OR an owner to have permission.

## [Medium]
This calls the email sender with the original guests, so existing attendees included in the input will be treated as new when sending notifications, leading to incorrect emails.

## [Medium]
uniqueGuests filters out existing attendees and blacklisted emails but does not deduplicate duplicates within the input; createMany can insert duplicate attendee rows if the client submits repeated emails.

## [Low]
Starting with an array containing an empty string may cause validation issues. Consider starting with an empty array [] and handling the empty state in the MultiEmail component instead.
