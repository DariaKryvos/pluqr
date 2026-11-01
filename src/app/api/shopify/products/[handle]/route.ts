import { getProduct } from '../../../../../lib/shopify/catalog';
import { ShopifyError } from '../../../../../lib/shopify/errors';
import { apiResponse, json } from '../../../../../lib/shopify/http';
export async function GET(_request: Request, {params}: {params: Promise<{handle: string}>}) {
  return apiResponse(async () => {
    const {handle} = await params;
    if (!handle.trim() || handle.length > 255) throw new ShopifyError('INVALID_REQUEST', 'Ongeldig product.', 400);
    const product = await getProduct(handle);
    if (!product) throw new ShopifyError('PRODUCT_NOT_FOUND', 'Dit product is niet gevonden.', 404);
    return json({product});
  });
}
