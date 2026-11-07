import 'server-only';
import {checkPostcodeDelivery} from './check.ts';
import {ShopifyError} from '../shopify/errors.ts';
export async function validateDeliveryChoice(method:unknown,input:unknown){
 if(method!=='pickup'&&method!=='delivery')throw new ShopifyError('INVALID_REQUEST','Kies bezorgen of gratis afhalen.',400);
 if(method==='pickup')return {method,postcode:null};
 const postcode=typeof input==='string'?input.replace(/\s/g,'').toUpperCase():'';
 const result=await checkPostcodeDelivery(postcode);
 if(result.status!=='available')throw new ShopifyError('DELIVERY_NOT_AVAILABLE',result.status==='unavailable'?'Dit adres valt buiten ons bezorggebied. Kies gratis afhalen.':result.status==='invalid'?'Vul een geldige bezorgpostcode in.':'Je bezorgpostcode kon niet worden gecontroleerd. Probeer opnieuw of kies afhalen.',422);
 return {method,postcode};
}
