# PLUQR — Cinematic oliebol experience

Next.js App Router + React + TypeScript, Tailwind CSS, GSAP/ScrollTrigger, Lucide React and the HTML5 Video API.

Requires Node.js 20.9 or newer.

```sh
npm install
npm run dev
npm run build
npm start
```

The development and production servers default to http://localhost:3000. Scripts use Next.js’s supported Webpack option because Turbopack’s PostCSS worker cannot bind its internal port in this restricted environment. `npm run typecheck` runs TypeScript checks separately.

`src/app/layout.tsx` owns global styles and page metadata; `src/app/page.tsx` composes the homepage. Interactive components use explicit client boundaries for video, dialogs, the basket and postcode checking. Static page sections remain server components. Tailwind uses the PostCSS plugin in `postcss.config.mjs`. Public asset URLs remain unchanged.

The unrelated nested `pluqr/` starter is not part of this application and is excluded from TypeScript checks.

The scroll story uses the supplied slicing clip at `public/videos/oliebol-slicing.mp4`. Its poster is extracted from the same footage. No generated product imagery is used. The source footage has a warm brown backdrop, so CSS masks its edges into the forest-green scene without stretching or cropping the video.

`ScrollExperience` accepts a configurable `videoSrc`. `useScrollVideo` waits for metadata, then maps a scrubbed GSAP timeline to `currentTime`. Within the slicing story, the opening holds the whole product, then seeks to the final frame before revealing ingredient annotations and the typographic finale. One scene pins for 400 viewport heights of scrolling, starting directly with the whole oliebol. The following cream section naturally rises over the scene and reveals its editorial content. Scrolling backward reverses the same timeline.

Seeks are coalesced while the decoder is busy and resume at the latest requested time after `seeked`; React state is not updated on scroll. Hover and tap select callouts. Reduced-motion users get an unpinned layout with the opening still and all copy readable. Timeline contexts and media listeners are cleaned up on unmount.

Components: `Navbar`, `ScrollExperience`, `ProductVideo`, `IngredientCallouts`, `FinaleTypography`, `EditorialSection`; styles in `src/styles/globals.css`.

## Seeking performance

The supplied MP4 is preserved as-is. Browser/device seeking performance still needs visual verification. If its encoding causes jumping, use frequent keyframes (then set `videoSrc` to the new file):

```sh
ffmpeg -i public/videos/oliebol-slicing.mp4 -an -c:v libx264 -preset slow -crf 20 -g 6 -keyint_min 6 -sc_threshold 0 -pix_fmt yuv420p -movflags +faststart public/videos/oliebol-slicing-seek.mp4
```

The existing 151 WebP frames in `public/frames/oliebol` are retained from this same clip as a future canvas fallback. The active experience uses the HTML5 video only. Swapping that renderer can stay isolated from scene typography and the GSAP timeline.

## Product collection

`ProductCollection` loads the published Shopify catalog through `/api/shopify/products`. Cards and detail views use actual Shopify descriptions, images, prices, availability and variant IDs. Product options appear only when configured in Shopify. The current store has three products with a single default variant each; the old demo pack sizes and prices are removed. Create size/variation options in Shopify to offer those choices.

## Postcode delivery checker

The gold banner submits to `POST /api/delivery/check`. The key and business origin stay server-side. Fill these values in `.env.local`:

```dotenv
GOOGLE_MAPS_API_KEY=your-server-side-geocoding-key
DELIVERY_ORIGIN_ADDRESS=your-full-business-address-in-the-netherlands
DELIVERY_LOCALITIES=Amsterdam, Diemen, Duivendrecht, Halfweg, Weesp, Zwanenburg, Zaandam, Landsmeer, Oostzaan, Den Ilp, Amstelveen, Ouderkerk aan de Amstel, Schiphol-Rijk, Badhoevedorp, Hoofddorp, Lijnden
# Optional alternative when no town list is set:
DELIVERY_RADIUS_KM=
```

Enable the Google Geocoding API for the key’s Cloud project and configure billing as required by Google. Limit the key’s API access to Geocoding API; server-side IP restrictions should match your hosting egress IPs when those are known. Do not use a browser-referrer-restricted key for these server requests.

The checker requires an exact Dutch six-character postcode result and rejects partial matches. The active delivery rule uses the 16 confirmed towns in `DELIVERY_LOCALITIES`. Google resolves the postcode to an exact locality/postal town; administrative municipalities are not accepted as substitutes. This avoids admitting unlisted towns within a broad radius. Town names normalize spacing, accents and dash variants. When no town list is configured, fixed postcode ranges take precedence over the optional radius rule. A radius rule uses **straight-line distance**, not road/driving distance, and is labelled accordingly in the response. Missing keys or delivery rules return an unconfigured result without paid Google requests. Google errors never confirm delivery or expose key-bearing URLs. Results are not stored or cached; Google Maps attribution appears with Google-derived results.

The Google Cloud key, origin address and 16-town delivery area are configured in the local environment; supply them separately when deploying. Live checks confirmed Amsterdam postcodes as available and an Utrecht postcode as outside the service area. This availability check does not override Shopify checkout shipping zones; configure those consistently in Shopify. Terms/privacy pages for Google Maps data use must be in place before launch. See [Google Geocoding documentation](https://developers.google.com/maps/documentation/geocoding/requests-geocoding) and [attribution guidance](https://developers.google.com/maps/documentation/geocoding/policies).

## Shopify backend and basket

Set these values in `.env.local` (see `.env.example`; keep existing tokens):

```dotenv
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_STOREFRONT_API_VERSION=2026-10
SHOPIFY_STOREFRONT_ACCESS_TOKEN=your-public-storefront-token
```

The existing `NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN` is supported as a fallback. The GraphQL client is server-only, uses `X-Shopify-Storefront-Access-Token`, and never reads the separate Admin token. Enable product and cart permissions and publish the desired products to the Headless sales channel in Shopify. The application makes no Admin API writes.

| Endpoint | Purpose |
| --- | --- |
| `GET /api/shopify/shop` | Verify connection and read shop name/domain |
| `GET /api/shopify/products?first=12&after=…` | Paginated product catalog (maximum 50 per page) |
| `GET /api/shopify/products/[handle]` | Product, options and up to 100 variants, with pagination metadata |
| `GET /api/shopify/cart` | Current browser-session cart, or `null` |
| `POST /api/shopify/cart` | Create a cart or add `{lines: [{merchandiseId, quantity}]}` |
| `PATCH /api/shopify/cart` | Update `{lines: [{id, quantity}]}`; zero removes a line |
| `DELETE /api/shopify/cart` | Remove `{lineIds: [id]}` |
| `POST /api/shopify/checkout` | Read the current cart session and request a fresh Shopify checkout URL |

Cart operations accept Shopify ProductVariant/CartLine IDs, never client prices. Use IDs returned by the catalog/cart endpoints. Shopify supplies authoritative cart totals, currency and availability. Responses are not cached, mutations require same-origin browser requests, and GraphQL/network errors are sanitized. The full cart ID and secret stay in a seven-day HTTP-only, SameSite=Lax cookie (Secure in production), not response JSON or browser storage. Expired carts are cleared on read and recreated on the next add. Server-side requests time out after ten seconds and never follow redirects with credentials.

`CartProvider` loads the Shopify cart when the page opens, prevents overlapping UI mutations, and displays stock warnings/errors. Basket quantities, removals and navigation badge use the returned Shopify state. The basket survives reloads through the cookie. Checkout is provided by Shopify’s hosted checkout. `ProductDetails` retains the supplied base-recipe ingredients with lupine highlighted; the complete raisin recipe remains pending.

Run `npm test` for mocked backend regression checks (requires Node.js 22.6+ for native TypeScript stripping). The normal Next.js runtime minimum remains Node.js 20.9. Production builds use `npm run build`.

Shopify references: [Getting started](https://shopify.dev/docs/storefronts/headless/building-with-the-storefront-api/getting-started), [Storefront API authentication](https://shopify.dev/docs/api/storefront/latest), [Cart mutations](https://shopify.dev/docs/api/storefront/latest/mutations/cartCreate).

Framework references: [Next.js App Router](https://nextjs.org/docs/app/getting-started/installation), [Tailwind with Next.js](https://tailwindcss.com/docs/installation/framework-guides/nextjs).


## Automatic Shopify updates

Visible tabs re-read products and the cart every five seconds, and immediately on window focus or returning to the tab. Opening the basket also refreshes it. Both browser and server reads bypass caches. This is near-real-time polling, not webhook push: a Shopify edit appears after the Storefront API exposes it and the next refresh completes. Open product details use the refreshed catalog while keeping the visitor’s variant and quantity selection. Unpublished products are disabled in an already-open detail view.

Catalog refreshes retain previously loaded pages and avoid overlapping requests. Background cart reads are aborted and version-checked when a mutation starts, so an older response cannot overwrite a newer basket. Polling stops in hidden tabs and listeners/timers are removed on unmount.

## Checkout and test payments

The basket’s **Naar afrekenen** button requests a fresh checkout URL from `/api/shopify/checkout`, using the HTTP-only cart session cookie. Empty and expired carts are rejected. The server validates the URL’s HTTPS scheme and host against the configured Shopify store, its primary domain, or `checkout.shopify.com`. It is not an arbitrary redirect endpoint. Background cart refreshes are cancelled before checkout starts.

Payment and address fields are served by Shopify, so the payment provider and test mode configured under Shopify Settings → Payments apply automatically. The app does not collect card details or label the store as being in test mode without verification. Shipping and payment eligibility are determined by the Shopify checkout configuration.

A live smoke test verified cart creation and retrieval of a fresh Shopify checkout URL. Direct automated access to the hosted checkout returned HTTP 403, so gateway visibility and a completed test payment remain unverified. The test cart was emptied; no customer address, payment or order was submitted.

To finish the end-to-end check, add a product in the browser, open the basket, select **Naar afrekenen**, and use the test credentials for the active Shopify test gateway. Shopify documents separate details for the Test payment gateway/Bogus Gateway and Shopify Payments test mode: [test payment settings](https://help.shopify.com/en/manual/checkout-settings/test-orders/payments-test-mode). No payment settings were changed by the app.

## Optional GPS delivery hint

The delivery banner includes **Gebruik mijn locatie**. It automatically performs one lookup only if the browser already reports geolocation permission as granted. Otherwise the site waits for a button click before invoking the native permission prompt. Unsupported Permissions APIs do not prevent manual use. GPS must run in a secure browser context (HTTPS in production; localhost for development).

Coordinates are sent to the same-origin delivery endpoint and reverse-geocoded by Google Maps to evaluate the same confirmed town list. They are not put in cookies, local storage or application logs; no watchPosition/background tracking is used. Changing the postcode or starting another check invalidates an outstanding GPS callback. Position requests use an eight-second timeout and reuse a device position no older than one minute.

Every result is advisory. Permission denial, GPS failure, a location outside the area or a delivery API error never gates navigation, products, cart or checkout. Manual postcode checking remains available; the checkout delivery address can differ from the visitor's current location. Browser-coordinate handling and result logic are covered by automated tests, without requesting the developer's actual GPS location.

## SEO and structured data

`SITE_URL` defines the public canonical origin (currently `https://pluqr.nl`). Set it to the final domain at deployment. Development is noindex automatically; `SITE_INDEXABLE=false` also disables indexing in production. `robots.txt` blocks API paths on indexable production deployments, and `sitemap.xml` lists the homepage and all published Shopify product pages through pagination. Sitemap dates, stock amounts, reviews, opening hours, GTINs and return/shipping policies are not fabricated.

The homepage server-renders the initial Shopify catalog, preserving its five-second client refresh, and includes Bakery, WebSite, CollectionPage and ItemList JSON-LD. Business identity uses the supplied address, telephone, email, KVK and exact configured delivery towns. The supplied `PLUQR_-_logo.avif` is used unchanged in navigation, footer and business schema. A cream backing keeps its original green lettering legible in the dark header. Contact details are also visible on the page.

Each `/producten/[handle]` URL has a canonical URL, Dutch title/description, Open Graph/Twitter metadata, a server-rendered product detail, Product/Offer JSON-LD and BreadcrumbList. Offers come from actual Shopify variant prices, currency and availability. Cart/checkout still use the same provider and backend. Product card titles are crawlable links while the existing order button continues opening the product modal.

The 1200×630 social image is a frame of the supplied slicing video; favicon and Apple touch icon use the site monogram. JSON-LD serialization escapes `<` and Unicode line separators to prevent script injection from product text. No client credentials are used in metadata or structured data.

Verification: automated schema/content and serialization tests, production build, and HTTP checks for the rendered metadata, initial product links, Product offers, sitemap, robots, public assets and missing-product 404. Once this app is published, submit its sitemap in Google Search Console and validate a deployed product URL with the [Rich Results Test](https://search.google.com/test/rich-results) or [Schema Validator](https://validator.schema.org/). Search appearance is controlled by search engines and is not guaranteed.
# pluqr
