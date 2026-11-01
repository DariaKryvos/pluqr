import { getShop } from '../../../../lib/shopify/catalog';
import { apiResponse, json } from '../../../../lib/shopify/http';
export async function GET() { return apiResponse(async () => json(await getShop())); }
