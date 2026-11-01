const IMAGE = `url altText width height`;
const VARIANT = `id title availableForSale selectedOptions { name value } price { amount currencyCode }`;
const PRODUCT = `
  id handle title description availableForSale
  featuredImage { ${IMAGE} }
  options { name values }
  priceRange { minVariantPrice { amount currencyCode } maxVariantPrice { amount currencyCode } }
  variants(first: 100) { nodes { ${VARIANT} } pageInfo { hasNextPage endCursor } }
`;
export const PRODUCTS_QUERY = `query Products($first: Int!, $after: String) {
  products(first: $first, after: $after) { nodes { ${PRODUCT} } pageInfo { hasNextPage endCursor } }
}`;
export const PRODUCT_QUERY = `query Product($handle: String!) { product(handle: $handle) { ${PRODUCT} } }`;
export const SHOP_QUERY = `query Shop { shop { name description primaryDomain { url } } }`;
const CART = `
  id totalQuantity
  cost { subtotalAmount { amount currencyCode } totalAmount { amount currencyCode } subtotalAmountEstimated totalAmountEstimated }
  lines(first: 100) { nodes {
    id quantity cost { totalAmount { amount currencyCode } }
    merchandise { ... on ProductVariant { ${VARIANT} product { id title handle featuredImage { ${IMAGE} } } } }
  } pageInfo { hasNextPage endCursor } }
`;
const RESULT = `cart { ${CART} } userErrors { code field message } warnings { code message target }`;
export const CART_QUERY = `query Cart($id: ID!) { cart(id: $id) { ${CART} } }`;
export const CART_CREATE = `mutation CartCreate($lines: [CartLineInput!]!) { cartCreate(input: {lines: $lines, buyerIdentity: {countryCode: NL}}) { ${RESULT} } }`;
export const CART_ADD = `mutation CartAdd($cartId: ID!, $lines: [CartLineInput!]!) { cartLinesAdd(cartId: $cartId, lines: $lines) { ${RESULT} } }`;
export const CART_UPDATE = `mutation CartUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) { cartLinesUpdate(cartId: $cartId, lines: $lines) { ${RESULT} } }`;
export const CART_REMOVE = `mutation CartRemove($cartId: ID!, $lineIds: [ID!]!) { cartLinesRemove(cartId: $cartId, lineIds: $lineIds) { ${RESULT} } }`;
