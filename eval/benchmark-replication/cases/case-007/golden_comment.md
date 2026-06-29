# Golden Comments for OAuth credential sync and app integration enhancements

## [High]
The parseRefreshTokenResponse function incorrectly sets refresh_token to the hardcoded string 'refresh_token' when it's missing from the OAuth refresh token response. This invalidates the token, breaking subsequent token refreshes and causing authentication failures.

## [High]
Invalid Zod schema syntax. Computed property keys like [z.string().toString()] are not valid in Zod object schemas and will cause runtime errors. 

## [High]
parseRefreshTokenResponse returns a Zod safeParse result ({ success, data, error }), not the credential key object. Persisting that as key stores the wrapper instead of the token payload; we should store the parsed data or use schema parse.

## [High]
When APP_CREDENTIAL_SHARING_ENABLED and CALCOM_CREDENTIAL_SYNC_ENDPOINT are set, the refreshFunction helper returns the fetch Response, but several callers (for example GoogleCalendarService.refreshAccessToken expecting res.data, and HubspotCalendarService.refreshAccessToken expecting a HubspotToken) assume it returns the integration-specific token object. That mismatch will cause runtime errors in the sync-enabled path unless the return type or those call sites are adjusted.

## [High]
When the sync endpoint path is used, res is a fetch Response and has no .data; res?.data will be undefined and token.access_token will throw at runtime. This relies on a consistent return shape from refreshOAuthTokens, which isn’t guaranteed currently.
