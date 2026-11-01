export interface Money { amount: string; currencyCode: string }
export interface PageInfo { hasNextPage: boolean; endCursor: string | null }
export interface ShopifyImage { url: string; altText: string | null; width: number | null; height: number | null }
export interface ShopifyVariant {
  id: string; title: string; availableForSale: boolean;
  selectedOptions: { name: string; value: string }[];
  price: Money;
}
export interface ShopifyProduct {
  id: string; handle: string; title: string; description: string; availableForSale: boolean;
  featuredImage: ShopifyImage | null;
  options: { name: string; values: string[] }[];
  priceRange: { minVariantPrice: Money; maxVariantPrice: Money };
  variants: { nodes: ShopifyVariant[]; pageInfo: PageInfo };
}
export interface CartLine {
  id: string; quantity: number; cost: { totalAmount: Money };
  merchandise: ShopifyVariant & { product: { id: string; title: string; handle: string; featuredImage: ShopifyImage | null } };
}
export interface ShopifyCart {
  id: string; totalQuantity: number;
  cost: { subtotalAmount: Money; totalAmount: Money; subtotalAmountEstimated: boolean; totalAmountEstimated: boolean };
  lines: { nodes: CartLine[]; pageInfo: PageInfo };
}
export interface CartMutationResult {
  cart: ShopifyCart | null;
  userErrors: { code: string | null; field: string[] | null; message: string }[];
  warnings: { code: string; message: string; target: string | null }[];
}
