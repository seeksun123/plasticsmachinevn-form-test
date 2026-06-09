# plasticsmachinevn Vietnamese site

Static Vietnamese lead-generation site for `plasticsmachinevn.com`.

The site is pure HTML/CSS/JS with Cloudflare Pages Functions/advanced mode
Worker support for `/api/inquiry`.

## Cloudflare Pages

- Project type: Pages
- Build command: none
- Build output directory: `/`
- Functions entry for Direct Upload / advanced mode: `_worker.js`
- Classic Pages Functions copy: `functions/api/inquiry.js`

## Content

- `index.html` - Vietnamese homepage
- `san-pham.html`, `products/` - product listing and product detail pages
- `industries/` - application and industry pages
- `blog.html`, `blog/` - SEO content pages
- `lien-he.html` - inquiry/contact page
- `assets/` - CSS, JS, product images, factory images and certificate images

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

Without `RESEND_API_KEY`, `/api/inquiry` returns a configuration message and
fallback inquiry text instead of pretending that email was sent.
