# Golden Comments for scale-color $lightness must use $secondary for dark themes

## [Low]
In .topic-meta-data h5 a, the original code had color: scale-color($primary, $lightness: 30%) but was changed to dark-light-choose(scale-color($primary, $lightness: 70%), scale-color($secondary, $lightness: 30%)). The lightness for the light theme changed from 30% to 70%, which is a dramatic inversion

## [Low]
This change for desktop/user.css changes $primary from 30% to 50% for the light theme; most other changes preserve the original $primary value and move the complement to $secondary for dark. Consider reviewing this (also applies to a similar .name change in the mobile variant).

## [Low]
In topic-post.css the original code used $lightness: 70% but the replacement uses $lightness: 30% for the light theme. This makes the text significantly darker than intended.
