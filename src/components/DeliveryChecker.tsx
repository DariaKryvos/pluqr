'use client';

import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { MapPin, ArrowRight, LocateFixed } from 'lucide-react';
import { getCurrentLocation, hasLocationPermission } from '../lib/delivery/geolocation';
import type { DeliveryResult } from '../lib/delivery/check';
const POSTCODE_KEY='pluqr-delivery-postcode';
const POSTCODE_EVENT='pluqr-delivery-postcode-change';
export default function DeliveryChecker({compact=false}:{compact?:boolean}) {
 const uid=useId();
 const titleId=`delivery-title-${uid}`;
 const inputId=`delivery-postcode-${uid}`;
 const resultId=`delivery-result-${uid}`;
 function remember(value:string){
  try{sessionStorage.setItem(POSTCODE_KEY,value);}catch{}
  window.dispatchEvent(new CustomEvent(POSTCODE_EVENT,{detail:value}));
 }
 const [postcode,setPostcode]=useState('');
 const [result,setResult]=useState<DeliveryResult|null>(null);
 const [busy,setBusy]=useState(false);
 const [locating,setLocating]=useState(false);
 const [locationNote,setLocationNote]=useState('');
 const [locationBased,setLocationBased]=useState(false);
 const request=useRef<AbortController|null>(null);
 const generation=useRef(0);
 function cancel(){generation.current++;request.current?.abort();request.current=null;setBusy(false);setLocating(false);}
 async function check(body:unknown,gps=false,expected=generation.current){
  if(expected!==generation.current)return;
  const controller=new AbortController();request.current=controller;setBusy(true);setResult(null);
  try{
   const response=await fetch('/api/delivery/check',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),cache:'no-store',signal:controller.signal});
   if(!response.ok)throw new Error();
   const data:DeliveryResult=await response.json();
   if(!controller.signal.aborted&&expected===generation.current){setResult(data);setLocationBased(gps);}
  }catch{if(!controller.signal.aborted&&expected===generation.current)setResult({status:'error'});}
  finally{if(request.current===controller){request.current=null;setBusy(false);}}
 }
 async function useLocation(){
  cancel();const expected=generation.current;setLocating(true);setLocationNote('');setResult(null);
  try{
   const coordinates=await getCurrentLocation();
   if(expected===generation.current)await check(coordinates,true,expected);
  }catch(error){if(expected===generation.current)setLocationNote(error instanceof Error?error.message:'Vul je postcode in om je bezorggebied te controleren.');}
  finally{if(expected===generation.current)setLocating(false);}
 }
 useEffect(()=>{
  let active=true;const expected=generation.current;
  // Never show a permission prompt on page load. Reuse an existing grant only.
  let saved='';
  try{saved=sessionStorage.getItem(POSTCODE_KEY)||'';}catch{}
  if(saved)setPostcode(saved);
  else void hasLocationPermission().then(granted=>{if(active&&granted&&generation.current===expected)void useLocation();});
  function sync(event:Event){cancel();setPostcode((event as CustomEvent<string>).detail);setResult(null);setLocationNote('');}
  window.addEventListener(POSTCODE_EVENT,sync);
  return()=>{active=false;generation.current++;request.current?.abort();window.removeEventListener(POSTCODE_EVENT,sync);};
 // This runs once; manual interactions invalidate the initial permission check.
 },[]);
 useEffect(()=>{
  if(!/^[1-9][0-9]{3}[A-Z]{2}$/.test(postcode.replace(/\s/g,'').toUpperCase()))return;
  const timer=window.setTimeout(()=>{cancel();setLocationBased(false);void check({postcode});},500);
  return()=>window.clearTimeout(timer);
 },[postcode]);
 function submit(event:FormEvent<HTMLFormElement>){
  event.preventDefault();cancel();setLocationNote('');setLocationBased(false);
  if(!/^[1-9][0-9]{3}[A-Z]{2}$/.test(postcode.replace(/\s/g,'').toUpperCase())){setResult({status:'invalid'});return;}
  void check({postcode});
 }
 const messages = {
  invalid:locationBased?'Je locatie kon niet worden gecontroleerd. Vul eventueel je postcode in.':'Vul een bestaande Nederlandse postcode in, bijvoorbeeld 1234 AB.',
  unconfigured:'Ons bezorggebied wordt nog ingesteld. We kunnen bezorging hier nog niet bevestigen.',
  available:locationBased?'Je lijkt binnen ons bezorggebied te zijn.':'Goed nieuws! We bezorgen op jouw postcode.',
  unavailable:locationBased?'Je huidige locatie lijkt buiten ons bezorggebied te liggen. Je kunt gewoon verder winkelen of een andere bezorgpostcode controleren.':'Helaas valt jouw postcode buiten ons bezorggebied. Je kunt gewoon verder winkelen.',
  error:'De bezorgcheck is tijdelijk niet beschikbaar. Je kunt gewoon verder winkelen.',
 };
 if(!compact){
  const statusText=locating||busy?'Locatie controleren…':locationNote?'Locatie niet beschikbaar':result?.status==='available'?`We bezorgen ${result.locality?`in ${result.locality}`:'op deze locatie'}`:result?.status==='unavailable'?`Geen bezorging ${result.locality?`in ${result.locality}`:'op deze locatie'}`:result?'Bezorggebied niet te controleren':'Bezorgen we bij jou?';
  return <aside className="delivery-banner delivery-topbar" aria-label="Bezorggebied" lang="nl">
   <MapPin size={15} aria-hidden="true"/>
   <span role="status" aria-live="polite" aria-atomic="true">{statusText}</span>
   <button className="delivery-topbar-action" type="button" onClick={()=>void useLocation()} disabled={locating||busy} aria-label="Controleer bezorging op mijn huidige locatie"><LocateFixed size={14} aria-hidden="true"/>{result||locationNote?'Opnieuw bepalen':'Vind mijn locatie'}</button>
   {result?.source==='google'&&<span className="maps-attribution">Google Maps</span>}
   {locationNote&&<span className="delivery-topbar-help">Je kunt je postcode in de winkelmand controleren.</span>}
  </aside>;
 }
 return <aside className={`delivery-banner${compact?' delivery-banner-compact':''}`} aria-labelledby={titleId} lang="nl"><div className="delivery-banner-inner"><div className="delivery-heading"><MapPin size={23} strokeWidth={1.5} aria-hidden="true"/><div><h2 id={titleId}>Bezorgen we bij jou?</h2><p>{compact?'Je postcode wordt automatisch gecontroleerd. Je kunt altijd verder naar afrekenen.':'Check je postcode of gebruik je locatie. Altijd vrijblijvend.'}</p></div></div><div className="delivery-controls"><form className="delivery-form" onSubmit={submit} noValidate><label className="sr-only" htmlFor={inputId}>Nederlandse postcode</label><input id={inputId} name="postal-code" autoComplete="postal-code" placeholder="1234 AB" maxLength={7} value={postcode} onChange={event=>{cancel();setPostcode(event.target.value);remember(event.target.value);setResult(null);setLocationNote('');}} aria-invalid={result?.status==='invalid'&&!locationBased} aria-describedby={result||locationNote?resultId:undefined} required/><button type="submit" disabled={busy}>{busy?'Controleren…':'Check postcode'} <ArrowRight size={16} aria-hidden="true"/></button></form><button className="delivery-location-button" type="button" onClick={()=>void useLocation()} disabled={locating||busy}><LocateFixed size={15} aria-hidden="true"/>{locating?'Locatie bepalen…':'Gebruik mijn locatie'}</button></div></div><div className="delivery-result" id={resultId} role="status" aria-live="polite" aria-atomic="true">{locationNote}{result&&<>{messages[result.status]}{result.locality&&<span> Plaats: {result.locality}.</span>}{result.distanceKm!==undefined&&<span> Afstand: circa {result.distanceKm.toLocaleString('nl-NL')} km hemelsbreed.</span>}{result.source==='google'&&<span className="maps-attribution">Google Maps</span>}</>}</div></aside>;
}
