import assert from 'node:assert/strict';
import { beforeEach, afterEach, test } from 'node:test';
import { checkPostcodeDelivery, checkLocationDelivery, distanceKm } from '../src/lib/delivery/check.ts';
const keys=['GOOGLE_MAPS_API_KEY','DELIVERY_ORIGIN_ADDRESS','DELIVERY_RADIUS_KM','DELIVERY_LOCALITIES'];
const original=Object.fromEntries(keys.map(key=>[key,process.env[key]]));
const fetchOriginal=globalThis.fetch;
beforeEach(()=>{delete process.env.DELIVERY_LOCALITIES;process.env.GOOGLE_MAPS_API_KEY='test-key';process.env.DELIVERY_ORIGIN_ADDRESS='Testadres, Nederland';process.env.DELIVERY_RADIUS_KM='10';});
afterEach(()=>{globalThis.fetch=fetchOriginal;for(const[key,value]of Object.entries(original)){if(value===undefined)delete process.env[key];else process.env[key]=value;}});
function point(postcode='1234 AB',lat=52,lng=5,partial=false){return {partial_match:partial,address_components:[{long_name:postcode,short_name:postcode,types:['postal_code']},{long_name:'Nederland',short_name:'NL',types:['country']}],geometry:{location:{lat,lng}}};}
test('invalid or unconfigured delivery checks never call a paid API',async()=>{
 globalThis.fetch=()=>{throw new Error('Unexpected API call');};
 assert.equal((await checkPostcodeDelivery('not a postcode')).status,'invalid');
 delete process.env.GOOGLE_MAPS_API_KEY;assert.equal((await checkPostcodeDelivery('1234 AB')).status,'unconfigured');
 process.env.GOOGLE_MAPS_API_KEY='test-key';delete process.env.DELIVERY_ORIGIN_ADDRESS;assert.equal((await checkPostcodeDelivery('1234 AB')).status,'unconfigured');
});
test('checks exact Dutch postcodes and compares the configured straight-line radius',async()=>{
 globalThis.fetch=async(url,options)=>{
  assert.equal(options.cache,'no-store');assert.equal(url.hostname,'maps.googleapis.com');
  assert.equal(url.searchParams.get('key'),'test-key');
  assert.ok(url.searchParams.get('components').includes('country:NL'));
  return Response.json({status:'OK',results:[point()]});
 };
 const inside=await checkPostcodeDelivery('1234 ab');assert.equal(inside.status,'available');assert.equal(inside.distanceKm,0);assert.equal(inside.source,'google');
 globalThis.fetch=async url=>Response.json({status:'OK',results:[point('1234 AB',url.searchParams.has('address')?50:52)]});
 assert.equal((await checkPostcodeDelivery('1234AB')).status,'unavailable');
});
test('partial and nonexistent postcode matches never confirm delivery',async()=>{
 for(const results of [[],[point('1234 AB',52,5,true)],[point('1234 AC')]]){
  globalThis.fetch=async()=>Response.json({status:results.length?'OK':'ZERO_RESULTS',results});
  assert.equal((await checkPostcodeDelivery('1234 AB')).status,'invalid');
 }
});
test('Google access failures are reported without credentials or upstream messages',async()=>{
 globalThis.fetch=async()=>Response.json({status:'REQUEST_DENIED',error_message:'test-key secret details'});
 const result=await checkPostcodeDelivery('1234 AB');assert.deepEqual(result,{status:'error'});
});
test('distance math is stable at identical points and a known angular separation',()=>{
 assert.equal(distanceKm({lat:52,lng:5},{lat:52,lng:5}),0);
 assert.ok(Math.abs(distanceKm({lat:0,lng:0},{lat:0,lng:1})-111.195)<.01);
});

test('town-based delivery allows only the named town, not its municipality',async()=>{
 process.env.DELIVERY_LOCALITIES='Amsterdam, Weesp, Schiphol-Rijk';
 delete process.env.DELIVERY_RADIUS_KM;
 let calls=0;
 function place(locality){const data=point();data.address_components.push({long_name:locality,short_name:locality,types:['locality']},{long_name:'Amsterdam',short_name:'Amsterdam',types:['administrative_area_level_2']});return data;}
 globalThis.fetch=async()=>{calls++;return Response.json({status:'OK',results:[place('Weesp')]});};
 const inside=await checkPostcodeDelivery('1234 AB');assert.equal(inside.status,'available');assert.equal(inside.locality,'Weesp');assert.equal(calls,1);
 globalThis.fetch=async()=>Response.json({status:'OK',results:[place('Schiphol‑Rijk')]});
 assert.equal((await checkPostcodeDelivery('1234 AB')).status,'available');
 globalThis.fetch=async()=>Response.json({status:'OK',results:[place('Driemond')]});
 assert.equal((await checkPostcodeDelivery('1234 AB')).status,'unavailable');
});

test('GPS checks the same town list and does not expand coverage to municipalities',async()=>{
 process.env.DELIVERY_LOCALITIES='Amsterdam, Weesp';
 const inside=point();inside.address_components.push({long_name:'Weesp',short_name:'Weesp',types:['locality']});
 globalThis.fetch=async url=>{assert.equal(url.searchParams.get('latlng'),'52,5');assert.equal(url.searchParams.has('components'),false);return Response.json({status:'OK',results:[inside]});};
 assert.equal((await checkLocationDelivery(52,5)).status,'available');
 const outside=point();outside.address_components.push({long_name:'Utrecht',short_name:'Utrecht',types:['locality']});
 globalThis.fetch=async()=>Response.json({status:'OK',results:[outside]});
 assert.equal((await checkLocationDelivery(52,5)).status,'unavailable');
});
test('invalid coordinates never trigger a Google request',async()=>{
 globalThis.fetch=()=>{throw Error('Unexpected Google request');};
 for(const[lat,lng]of [[91,5],[52,181],[NaN,5],[52,Infinity],['52',5],[null,5]])assert.equal((await checkLocationDelivery(lat,lng)).status,'invalid');
});
test('a GPS location outside the Netherlands is informative, not an error',async()=>{
 process.env.DELIVERY_LOCALITIES='Amsterdam';
 const abroad=point();abroad.address_components[1]={long_name:'België',short_name:'BE',types:['country']};
 globalThis.fetch=async()=>Response.json({status:'OK',results:[abroad]});
 assert.deepEqual(await checkLocationDelivery(50,4),{status:'unavailable',source:'google'});
});
