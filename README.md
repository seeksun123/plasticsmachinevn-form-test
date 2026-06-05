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
- `TURNSTILE_SECRET_KEY` optional, enable after Turnstile site key is added to the form

Without `RESEND_API_KEY`, `/api/inquiry` intentionally returns a configuration
message and fallback inquiry text so we can confirm the backend route is alive.
