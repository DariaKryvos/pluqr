# Performance cleanup

Measured with cold Chromium sessions at 390 × 844, observing the first 12 seconds.

- Before: 4,807,487 transferred bytes on production.
- Optimized production build: 2,715,798 transferred bytes locally (about 44% less). This comparison measures payload, not network speed; hosting differs.
- Logo transfers: about 901 KB combined → 36 KB.
- Story poster: about 708 KB → 45 KB.
- Product photos: about 708 KB combined → 239 KB.
- Catalog refresh: every 60 seconds and on focus/visibility, rather than every 5 seconds. No duplicate client request when server-rendered catalog data exists.
- Closed cart no longer polls. Opening it still fetches fresh data; cart mutations and checkout remain uncached.
- Font files are self-hosted with swap; no Google Fonts CSS connection is required.
- Removed unused quick-order popup code, continuous sugar particle animations, obsolete decoration rules, and roughly 40 MiB of superseded public assets. Removing unused files reduces deployment size, not the measured runtime transfer by itself.

Validation: production build and 36 unit tests; WebKit forward/reverse scroll and delayed video startup; mocked quick-add, cart flavour update, invalid/outside postcodes, pickup, navigation, and missing-asset checks. Browser checks do not submit orders or payments.
