# Golden Comments for Add rolling-updates feature flag and compatibility framework

## [Medium]
Incorrect method call for exit codes. The picocli.exit() method calls System.exit() directly, which is problematic:
