// Browser requests use our same-origin backend; no Shopify credential is needed here.
export async function shopifyApi<T>(path: string, method = 'GET', body?: unknown, signal?: AbortSignal): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`/api/shopify/${path}`, {
      method, credentials: 'same-origin', cache: 'no-store', signal,
      ...(body === undefined ? {} : {headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}),
    });
  } catch { throw new Error('De winkel is tijdelijk niet bereikbaar. Probeer het opnieuw.'); }
  let result;
  try { result = await response.json(); }
  catch { throw new Error('De winkel gaf geen geldig antwoord. Probeer het opnieuw.'); }
  if (!response.ok) throw new Error(result.error?.message || 'De winkel is tijdelijk niet bereikbaar. Probeer het opnieuw.');
  return result as T;
}
