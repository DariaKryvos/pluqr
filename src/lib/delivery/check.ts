import 'server-only';
import { checkDelivery, deliveryPostcodeRanges } from '../../data/delivery.ts';

export interface DeliveryResult {
  status: 'invalid' | 'unconfigured' | 'available' | 'unavailable' | 'error';
  source?: 'google';
  distanceKm?: number;
  radiusKm?: number;
  locality?: string;
}
interface Location { lat: number; lng: number }
interface GeocodeResult {
  partial_match?: boolean;
  address_components: {long_name:string; short_name:string; types:string[]}[];
  geometry: {location:Location};
}
interface GeocodeResponse { status:string; results:GeocodeResult[] }
export function distanceKm(a:Location,b:Location) {
  const radians=(value:number)=>value*Math.PI/180;
  const dLat=radians(b.lat-a.lat),dLng=radians(b.lng-a.lng);
  const x=Math.sin(dLat/2)**2+Math.cos(radians(a.lat))*Math.cos(radians(b.lat))*Math.sin(dLng/2)**2;
  return 6371*2*Math.atan2(Math.sqrt(Math.min(1,x)),Math.sqrt(Math.max(0,1-x)));
}
async function geocode(key:string,params:Record<string,string>) {
  const url=new URL('https://maps.googleapis.com/maps/api/geocode/json');
  url.search=new URLSearchParams({...params,key,language:'nl'}).toString();
  const response=await fetch(url,{cache:'no-store',redirect:'error',signal:AbortSignal.timeout(8000)});
  if(!response.ok)throw new Error('Geocoding unavailable');
  const data:GeocodeResponse=await response.json();
  if(!['OK','ZERO_RESULTS'].includes(data.status))throw new Error('Geocoding unavailable');
  return data.results||[];
}
function isDutch(result:GeocodeResult){
  return result.address_components.some(item=>item.types.includes('country')&&item.short_name==='NL');
}
export function normalizeLocality(value:string){
  return value.normalize('NFKD').replace(/\p{Diacritic}/gu,'').toLowerCase().replace(/[-‐‑‒–—]/g,' ').replace(/\s+/g,' ').trim();
}
function deliveryConfig(){
  const key=process.env.GOOGLE_MAPS_API_KEY?.trim();
  const localities=(process.env.DELIVERY_LOCALITIES||'').split(',').map(value=>value.trim()).filter(Boolean);
  const origin=process.env.DELIVERY_ORIGIN_ADDRESS?.trim();
  const radius=Number(process.env.DELIVERY_RADIUS_KM);
  const radiusConfigured=!!origin&&Number.isFinite(radius)&&radius>0&&radius<=1000;
  return {key,localities,origin,radius,configured:!!key&&(!!localities.length||!!deliveryPostcodeRanges.length||radiusConfigured)};
}
async function evaluateDestination(destination:GeocodeResult):Promise<DeliveryResult>{
  const {key,localities,origin,radius}=deliveryConfig();
  if(localities.length){
    const locality=destination.address_components.find(item=>item.types.includes('locality'))?.long_name
      ||destination.address_components.find(item=>item.types.includes('postal_town'))?.long_name;
    if(!locality)return {status:'error'};
    const available=localities.some(value=>normalizeLocality(value)===normalizeLocality(locality));
    return {status:available?'available':'unavailable',locality,source:'google'};
  }
  if(deliveryPostcodeRanges.length){
    const postcode=destination.address_components.find(item=>item.types.includes('postal_code'))?.long_name;
    if(!postcode)return {status:'error'};
    return {status:checkDelivery(postcode),source:'google'};
  }
  const origins=await geocode(key!,{address:origin!,components:'country:NL'});
  const departure=origins.find(result=>!result.partial_match&&isDutch(result));
  if(!departure)return {status:'error'};
  const distance=distanceKm(departure.geometry.location,destination.geometry.location);
  return {status:distance<=radius?'available':'unavailable',distanceKm:Math.round(distance*10)/10,radiusKm:radius,source:'google'};
}
export async function checkPostcodeDelivery(input:unknown):Promise<DeliveryResult> {
  if(typeof input!=='string')return {status:'invalid'};
  const postcode=input.replace(/\s/g,'').toUpperCase();
  if(!/^[1-9][0-9]{3}[A-Z]{2}$/.test(postcode))return {status:'invalid'};
  const {key,configured}=deliveryConfig();
  if(!configured)return {status:'unconfigured'};
  try{
    const results=await geocode(key!,{components:`country:NL|postal_code:${postcode}`});
    const destination=results.find(result=>!result.partial_match&&isDutch(result)&&result.address_components.some(item=>item.types.includes('postal_code')&&item.long_name.replace(/\s/g,'').toUpperCase()===postcode));
    if(!destination)return {status:'invalid',source:'google'};
    return await evaluateDestination(destination);
  }catch{return {status:'error'};}
}
export async function checkLocationDelivery(latitude:unknown,longitude:unknown):Promise<DeliveryResult>{
  if(typeof latitude!=='number'||typeof longitude!=='number'||!Number.isFinite(latitude)||!Number.isFinite(longitude)||Math.abs(latitude)>90||Math.abs(longitude)>180)return {status:'invalid'};
  const {key,configured}=deliveryConfig();
  if(!configured)return {status:'unconfigured'};
  try{
    const results=await geocode(key!,{latlng:`${latitude},${longitude}`});
    const destination=results.find(result=>!result.partial_match&&result.address_components.some(item=>item.types.includes('country')));
    if(!destination)return {status:'error'};
    if(!isDutch(destination))return {status:'unavailable',source:'google'};
    return await evaluateDestination(destination);
  }catch{return {status:'error'};}
}
