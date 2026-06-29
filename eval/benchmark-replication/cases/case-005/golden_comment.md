# Golden Comments for Comprehensive workflow reminder management for booking lifecycle events

## [Medium]
Asynchronous functions deleteScheduledEmailReminder and deleteScheduledSMSReminder are called without await inside forEach loops. This occurs during booking rescheduling/cancellation, and workflow/workflow step deletion/updates. Consequently, scheduled workflow reminders may not be reliably cancelled, potentially leaving them active.

## [High]
When immediateDelete is true, the deleteScheduledEmailReminder function cancels the SendGrid email but fails to delete the corresponding WorkflowReminder record from the database. This creates orphaned database entries and is inconsistent with the immediateDelete: false path, which marks the record as cancelled. The SendGrid DELETE API call is also omitted in this path.
