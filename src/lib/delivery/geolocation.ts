export async function hasLocationPermission():Promise<boolean>{
  if(typeof navigator==='undefined'||!navigator.geolocation||!navigator.permissions)return false;
  try{return (await navigator.permissions.query({name:'geolocation'})).state==='granted';}
  catch{return false;}
}
export function getCurrentLocation():Promise<{latitude:number;longitude:number}>{
  return new Promise((resolve,reject)=>{
    if(!navigator.geolocation){reject(new Error('Locatie is niet beschikbaar. Je kunt gewoon je postcode invullen.'));return;}
    navigator.geolocation.getCurrentPosition(
      ({coords})=>resolve({latitude:coords.latitude,longitude:coords.longitude}),
      ()=>reject(new Error('We kunnen je locatie niet bepalen. Je kunt gewoon je postcode invullen of verder winkelen.')),
      {enableHighAccuracy:true,timeout:8000,maximumAge:60000},
    );
  });
}
