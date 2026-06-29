# Golden Comments for FEATURE: automatically downsize large images

## [Medium]
The downsize method is defined twice. The second definition, which expects a single dimensions string parameter, overrides the first, which expected separate max_width and max_height parameters. This makes the original method unreachable and breaks existing code that calls it with separate width and height arguments.

## [Low]
Hardcoding maxSizeKB = 10 * 1024 ignores Discourse.SiteSettings['max_' + type + '_size_kb'], so the client-side limit can diverge from server-side and per-type settings (also applies to the 413 handler below).

## [Medium]
Passing 80% as the dimensions can fail for animated GIFs when allow_animated_thumbnails is true, since the animated path uses gifsicle --resize-fit which expects WxH geometry, not a percentage; downsizing would then silently fail.
