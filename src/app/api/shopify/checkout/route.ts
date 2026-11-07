import { validateDeliveryChoice } from '../../../../lib/delivery/checkout';
import { storefrontQuery } from '../../../../lib/shopify/client';
import { getCheckoutUrl } from '../../../../lib/shopify/checkout';
import { ShopifyError } from '../../../../lib/shopify/errors';
import { apiResponse, json, readMutation } from '../../../../lib/shopify/http';
import { getCartSessionId } from '../../../../lib/shopify/session';

export async function POST(request: Request) {
  return apiResponse(async () => {
    const body=await readMutation(request);
    const method=body&&typeof body==='object'&&'deliveryMethod' in body?body.deliveryMethod:undefined;
    const postcode=body&&typeof body==='object'&&'postcode' in body?body.postcode:undefined;
    const id = await getCartSessionId();
    if (!id) throw new ShopifyError('CART_EMPTY', 'Je winkelmand is nog leeg.', 400);
    const choice=await validateDeliveryChoice(method,postcode);
    if(method){
      const data=await storefrontQuery<{cartAttributesUpdate:{userErrors:{message:string}[]}}>(`mutation DeliveryPreference($id:ID!,$attributes:[AttributeInput!]!){cartAttributesUpdate(cartId:$id,attributes:$attributes){userErrors{message}}}`,{id,attributes:[{key:'Voorkeur ontvangst',value:method==='pickup'?'Gratis afhalen — Remmerdenplein 100, Amsterdam':'Bezorgen'},{key:'Gecontroleerde bezorgpostcode',value:choice.postcode||'Niet van toepassing — afhalen'}]});
      if(data.cartAttributesUpdate.userErrors.length)throw new ShopifyError('CART_REJECTED','Je bezorgvoorkeur kon niet worden opgeslagen. Probeer opnieuw.',422);
    }
    return json({checkoutUrl: await getCheckoutUrl(id)});
  });
}
