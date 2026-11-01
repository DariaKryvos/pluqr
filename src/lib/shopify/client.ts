import 'server-only';
import { getShopifyConfig } from './config.ts';
import { ShopifyError } from './errors.ts';

interface GraphQLResponse<T> { data?: T; errors?: { message: string }[] }
export async function storefrontQuery<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  const { endpoint, token } = getShopifyConfig();
  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Shopify-Storefront-Access-Token': token },
      body: JSON.stringify({ query, variables }),
      cache: 'no-store',
      redirect: 'error',
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    throw new ShopifyError('SHOPIFY_UNAVAILABLE', 'De winkel is tijdelijk niet bereikbaar. Probeer het opnieuw.', 502);
  }
  if (!response.ok) {
    throw new ShopifyError('SHOPIFY_UNAVAILABLE', 'De winkel kan deze aanvraag nu niet verwerken.', response.status === 429 ? 503 : 502);
  }
  let result: GraphQLResponse<T>;
  try { result = await response.json(); }
  catch { throw new ShopifyError('SHOPIFY_INVALID_RESPONSE', 'De winkel gaf een ongeldig antwoord.', 502); }
  // Do not expose upstream errors, credentials, request headers, or cart secrets.
  if (result.errors?.length || !result.data) throw new ShopifyError('SHOPIFY_REQUEST_FAILED', 'De winkel kan deze aanvraag niet verwerken.', 502);
  return result.data;
}
