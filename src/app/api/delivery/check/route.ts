import { checkLocationDelivery, checkPostcodeDelivery } from '../../../../lib/delivery/check';
import { apiResponse, json, readMutation } from '../../../../lib/shopify/http';
export async function POST(request:Request){
  return apiResponse(async()=>{
    const body=await readMutation(request);
    if(body&&typeof body==='object'&&'latitude'in body&&'longitude'in body){
      return json(await checkLocationDelivery(body.latitude,body.longitude));
    }
    const postcode=body&&typeof body==='object'&&'postcode'in body?(body as {postcode:unknown}).postcode:null;
    return json(await checkPostcodeDelivery(postcode));
  });
}
