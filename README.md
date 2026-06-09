# plasticsmachinevn-form-test

Form-only Cloudflare Pages test project for `plasticsmachinevn.com`.

This repository is intentionally limited to the inquiry form test page. It does
not contain the full Vietnamese Zhengyi Machinery website.

## Cloudflare Pages

- Project type: Pages
- Build command: none
- Build output directory: `/`
- Functions entry for Direct Upload / advanced mode: `_worker.js`
- Classic Pages Functions copy: `functions/api/inquiry.js`

## Environment Variables

Set these in Cloudflare Pages after the project is connected:

- `RESEND_API_KEY`
- `INQUIRY_TO_EMAIL=info@plasticsmachinevn.com`
- `INQUIRY_FROM_EMAIL=Zhengyi Machinery <inquiry@plasticsmachinevn.com>`
- `TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA` for the current test widget

The form currently uses Cloudflare Turnstile's official test sitekey
`1x00000000000000000000AA`, which always validates successfully with the test
secret above. Replace both values with a real `plasticsmachinevn.com` Turnstile
widget before production launch.

Without `RESEND_API_KEY`, `/api/inquiry` intentionally returns a configuration
message and fallback inquiry text so we can confirm the backend route is alive.
