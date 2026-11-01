import 'server-only';
import { ShopifyError } from './errors.ts';

export function getShopifyConfig() {
  const domain = (process.env.SHOPIFY_STORE_DOMAIN ?? '').trim().replace(/^https:\/\//, '').replace(/\/$/, '').toLowerCase();
  if (!domain) throw new ShopifyError('SHOPIFY_NOT_CONFIGURED', 'De Shopify-winkel is nog niet gekoppeld.', 503);
  if (!/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/.test(domain)) {
    throw new ShopifyError('SHOPIFY_NOT_CONFIGURED', 'De Shopify-winkelconfiguratie is ongeldig.', 503);
  }
  // The public Storefront credential also works for server-side requests.
  // An Admin API token is never a fallback for this different API.
  const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN?.trim() || process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN?.trim();
  if (!token || /^shpat_/i.test(token)) throw new ShopifyError('SHOPIFY_NOT_CONFIGURED', 'Een geldige Storefront API-token ontbreekt.', 503);
  const version = process.env.SHOPIFY_STOREFRONT_API_VERSION?.trim() || '2026-10';
  if (!/^20\d{2}-(01|04|07|10)$/.test(version)) throw new ShopifyError('SHOPIFY_NOT_CONFIGURED', 'De Shopify API-versie is ongeldig.', 503);
  return { endpoint: `https://${domain}/api/${version}/graphql.json`, token };
}
