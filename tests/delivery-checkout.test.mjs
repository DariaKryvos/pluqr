import test from 'node:test';
import assert from 'node:assert/strict';
import {validateDeliveryChoice} from '../src/lib/delivery/checkout.ts';
test('checkout requires a delivery method and never accepts an unchecked postcode',async()=>{
 await assert.rejects(validateDeliveryChoice(undefined,'1106AK'));
 await assert.rejects(validateDeliveryChoice('delivery',undefined));
 await assert.rejects(validateDeliveryChoice('delivery','not-a-postcode'));
 assert.deepEqual(await validateDeliveryChoice('pickup',null),{method:'pickup',postcode:null});
});
test('checkout rechecks the submitted postcode against the actual delivery town',async()=>{
 const oldFetch=globalThis.fetch;
 const before={...process.env};
 process.env.GOOGLE_MAPS_API_KEY='test';process.env.DELIVERY_LOCALITIES='Amsterdam';
 let town='Almere';
 globalThis.fetch=async()=>new Response(JSON.stringify({status:'OK',results:[{address_components:[{long_name:'Nederland',short_name:'NL',types:['country']},{long_name:'1325 RC',short_name:'1325 RC',types:['postal_code']},{long_name:town,short_name:town,types:['locality']}],geometry:{location:{lat:52,lng:5}}}]}));
 try{
  await assert.rejects(validateDeliveryChoice('delivery','1325 RC'),error=>error.code==='DELIVERY_NOT_AVAILABLE');
  town='Amsterdam';
  assert.deepEqual(await validateDeliveryChoice('delivery','1325 rc'),{method:'delivery',postcode:'1325RC'});
 }finally{globalThis.fetch=oldFetch;for(const key of ['GOOGLE_MAPS_API_KEY','DELIVERY_LOCALITIES']){if(before[key]===undefined)delete process.env[key];else process.env[key]=before[key];}}
});
