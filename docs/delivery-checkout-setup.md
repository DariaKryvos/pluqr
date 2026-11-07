# Delivery restriction at Shopify checkout

The app requires an in-area postcode before opening checkout with delivery selected. The server independently geocodes and checks that postcode; a browser-supplied success flag is never trusted. Pickup needs no delivery postcode. This check does not lock the shipping address or delivery method in Shopify checkout.

To enforce the rule against the final address, configure the production Shopify store:

1. Settings → Shipping and delivery → Local delivery: enable delivery for the fulfilment location and enter the approved postal codes (or an agreed radius matching the service area).
2. Enable pickup in store for the actual collection location.
3. Review every shipping profile and remove delivery/shipping rates that would let these products ship outside the approved area. Do not leave a general Netherlands shipping rate as a bypass.
4. Test a valid address, an outside-area address, pickup, and changing from an accepted postcode to an outside-area address inside Shopify checkout. Check accelerated checkout paths too.

The current app allowlist uses town names from DELIVERY_LOCALITIES. Shopify's native local delivery uses postal codes or radius, so these configurations must be reconciled explicitly. No Shopify settings were changed by this code update. Stored cart preferences are informational and do not force a Shopify delivery method.

Official setup guide: https://help.shopify.com/en/manual/fulfillment/setup/delivery-methods/local-delivery
