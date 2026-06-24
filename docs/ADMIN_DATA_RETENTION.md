# Admin Data Retention & Privacy Policy

As a compliance-positioned product, CodeGuard adheres to strict data retention and privacy constraints regarding administrative telemetry and request logging.

## 1. Request Logging Data Collection
To power the Admin Dashboard, we collect the following on every HTTP request:
- Timestamp, Method, Path, Status Code, Response Time
- Authenticated User ID (if applicable) and Session ID
- User-Agent strings (parsed into browser, OS, and device)
- Geolocation metadata derived from IP addresses

## 2. IP Masking and Privacy Boundary
IP addresses and precise geolocation data (such as coordinates) are treated as sensitive personal data. 

**CodeGuard uses `geoip-lite`**, an offline, bundled geolocation database. This prevents sending raw user IP addresses to third-party APIs during the hot path of the request cycle, ensuring no external tracking occurs.

By default, CodeGuard operates with the `ADMIN_IP_VISIBILITY` environment variable set to `masked`.
- **Masked Mode**: IPv4 addresses have their final octet zeroed out (e.g., `192.168.1.0`). IPv6 addresses have their last four segments redacted. Precise coordinates (Lat/Lng) are discarded, logging only at the city and region level.
- **Unmasked Mode**: Can be enabled for explicit security investigations. Enabling this mode creates a permanent record in the `admin_action_log`.

## 3. Retention Policy
Infinite log retention is an unnecessary liability. CodeGuard purges administrative telemetry on a strict schedule.

- **Retention Window**: Configured via the `REQUEST_LOG_RETENTION_DAYS` environment variable. The default is **90 days**.
- **Automated Cleanup**: A native background cron job runs continuously within the server event loop, querying the Drizzle ORM to permanently delete records from `request_logs` older than the specified retention window.

## 4. Admin Audit Trail
Administrative actions (e.g., suspending a user, manually applying a plan, toggling IP visibility) are logged securely in the `admin_action_log` table. This provides a transparent, bounded audit history of "who accessed what, for what reason, and at what time" for compliance reviews.
