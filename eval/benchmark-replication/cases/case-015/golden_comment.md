# Golden Comments for Optimize header layout performance with flexbox mixins

## [Low]
Mixing float: left with flexbox causes layout issues. Further this PR removes the float-based right alignment for .d-header .panel, which may cause the login panel in the non-Ember/noscript header (where .panel is nested inside .row and not a flex item) to stack under the title instead of remaining right-aligned.

## [Low]
-ms-align-items never existed in any version of IE/Edge; the correct legacy property is -ms-flex-align.
