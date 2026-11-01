import { getCheckoutUrl } from '../../../../lib/shopify/checkout';
import { ShopifyError } from '../../../../lib/shopify/errors';
import { apiResponse, json, readMutation } from '../../../../lib/shopify/http';
import { getCartSessionId } from '../../../../lib/shopify/session';

export async function POST(request: Request) {
  return apiResponse(async () => {
    await readMutation(request);
    const id = await getCartSessionId();
    if (!id) throw new ShopifyError('CART_EMPTY', 'Je winkelmand is nog leeg.', 400);
    return json({checkoutUrl: await getCheckoutUrl(id)});
  });
}
