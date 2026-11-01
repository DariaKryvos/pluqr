import { getProducts } from '../../../../lib/shopify/catalog';
import { apiResponse, json } from '../../../../lib/shopify/http';
import { parsePagination } from '../../../../lib/shopify/validation';
export async function GET(request: Request) {
  return apiResponse(async () => {
    const {first, after} = parsePagination(new URL(request.url));
    return json(await getProducts(first, after));
  });
}
