import 'server-only';
import { ShopifyError } from './errors.ts';
export async function apiResponse(action: () => Promise<Response>) {
  try { return await action(); }
  catch (error) {
    const known = error instanceof ShopifyError;
    return Response.json({error: {code: known ? error.code : 'INTERNAL_ERROR', message: known ? error.message : 'Er ging iets mis. Probeer het opnieuw.'}}, {
      status: known ? error.status : 500, headers: {'Cache-Control': 'no-store'},
    });
  }
}
export function json(data: unknown, status = 200) {
  return Response.json(data, {status, headers: {'Cache-Control': 'no-store'}});
}
export async function readMutation(request: Request): Promise<unknown> {
  const origin = request.headers.get('origin');
  const url = new URL(request.url);
  // Next.js can use its bind address in request.url; browsers use the incoming Host.
  const host = request.headers.get('host') || url.host;
  const expectedOrigin = `${url.protocol}//${host}`;
  if ((origin && origin !== expectedOrigin) || request.headers.get('sec-fetch-site') === 'cross-site') {
    throw new ShopifyError('INVALID_ORIGIN', 'Deze aanvraag is niet toegestaan.', 403);
  }
  if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) {
    throw new ShopifyError('INVALID_REQUEST', 'Verstuur de aanvraag als JSON.', 415);
  }
  if (Number(request.headers.get('content-length')) > 16_384) throw new ShopifyError('INVALID_REQUEST', 'De aanvraag is te groot.', 413);
  const text = await request.text();
  if (text.length > 16_384) throw new ShopifyError('INVALID_REQUEST', 'De aanvraag is te groot.', 413);
  try { return JSON.parse(text); }
  catch { throw new ShopifyError('INVALID_REQUEST', 'De aanvraag bevat ongeldige JSON.', 400); }
}
