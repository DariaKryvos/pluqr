'use client';

import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { useDeliveryPreference } from '../hooks/useDeliveryPreference';
import { MapPin, ArrowRight, LocateFixed } from 'lucide-react';
import { getCurrentLocation, hasLocationPermission } from '../lib/delivery/geolocation';
import type { DeliveryResult } from '../lib/delivery/check';
const POSTCODE_KEY='pluqr-delivery-postcode';
const POSTCODE_EVENT='pluqr-delivery-postcode-change';
export default function DeliveryChecker({compact=false}:{compact?:boolean}) {
 const {pickup,choosePickup}=useDeliveryPreference();
 const uid=useId();
 const titleId=`delivery-title-${uid}`;
 const inputId=`delivery-postcode-${uid}`;
 const resultId=`delivery-result-${uid}`;
 function remember(value:string){
  try{sessionStorage.setItem(POSTCODE_KEY,value);}catch{}
  window.dispatchEvent(new CustomEvent(POSTCODE_EVENT,{detail:value}));
 }
 const [editing,setEditing]=useState(false);
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
  cancel();choosePickup(false);const expected=generation.current;setLocating(true);setLocationNote('');setResult(null);
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
  event.preventDefault();cancel();choosePickup(false);setLocationNote('');setLocationBased(false);
  if(!/^[1-9][0-9]{3}[A-Z]{2}$/.test(postcode.replace(/\s/g,'').toUpperCase())){setResult({status:'invalid'});return;}
  void check({postcode});
 }
 const messages = {
  invalid:locationBased?'Je locatie kon niet worden gecontroleerd. Vul eventueel je postcode in.':'Vul een bestaande Nederlandse postcode in, bijvoorbeeld 1234 AB.',
  unconfigured:'Ons bezorggebied wordt nog ingesteld. We kunnen bezorging hier nog niet bevestigen.',
  available:'We bezorgen op deze locatie ✓',
  unavailable:'Buiten ons bezorggebied. Gratis afhalen mogelijk.',
  error:'De bezorgcheck is tijdelijk niet beschikbaar. Je kunt gewoon verder winkelen.',
 };
 if(!compact){
  const statusText=pickup?'Gratis afhalen gekozen':busy||locating?'Locatie controleren…':result?.status==='available'?`${result.locality||'Jouw locatie'}: binnen bezorggebied ✓`:result?.status==='unavailable'?`${result.locality||'Jouw locatie'}: buiten bezorggebied · gratis afhalen`:locationNote?'Locatie niet beschikbaar':result?'Controleer je postcode':'Bezorgen we bij jou?';
  return <aside className="delivery-banner delivery-topbar minimal-delivery-bar" aria-label="Bezorggebied" lang="nl">
   <div className="minimal-delivery-row"><MapPin size={15} aria-hidden="true"/><span role="status" aria-live="polite">{statusText}</span><button type="button" className="minimal-delivery-edit" onClick={()=>setEditing(value=>!value)} aria-expanded={editing} aria-controls={`${inputId}-controls`}>{editing?'Sluiten':result||pickup?'Wijzig':'Check'}</button>{result?.status==='unavailable'&&!pickup&&<button className="minimal-pickup-button" type="button" onClick={()=>choosePickup(true)} aria-label="Gratis afhalen kiezen">Afhalen</button>}</div>
   {editing&&<div className="minimal-delivery-controls" id={`${inputId}-controls`}><form className="topbar-postcode-form" onSubmit={submit} noValidate><label className="sr-only" htmlFor={inputId}>Postcode</label><input id={inputId} value={postcode} name="postal-code" autoComplete="postal-code" placeholder="1234 AB" maxLength={7} onChange={event=>{cancel();choosePickup(false);setPostcode(event.target.value);remember(event.target.value);setResult(null);setLocationNote('');}} required/><button disabled={busy} type="submit" aria-label="Postcode controleren"><ArrowRight size={15} aria-hidden="true"/></button></form><button type="button" className="delivery-topbar-action" onClick={()=>void useLocation()} disabled={busy||locating}><LocateFixed size={14} aria-hidden="true"/>Mijn locatie</button></div>}
  </aside>;
 }

 return <aside className={`delivery-banner${compact?' delivery-banner-compact':''}`} aria-labelledby={titleId} lang="nl"><div className="delivery-banner-inner"><div className="delivery-heading"><MapPin size={23} strokeWidth={1.5} aria-hidden="true"/><div><h2 id={titleId}>Bezorgen we bij jou?</h2></div></div><div className="delivery-controls"><form className="delivery-form" onSubmit={submit} noValidate><label className="sr-only" htmlFor={inputId}>Nederlandse postcode</label><input id={inputId} name="postal-code" autoComplete="postal-code" placeholder="1234 AB" maxLength={7} value={postcode} onChange={event=>{cancel();setPostcode(event.target.value);remember(event.target.value);setResult(null);setLocationNote('');}} aria-invalid={result?.status==='invalid'&&!locationBased} aria-describedby={result||locationNote?resultId:undefined} required/><button type="submit" disabled={busy}>{busy?'Controleren…':'Check'} <ArrowRight size={16} aria-hidden="true"/></button></form><button className="delivery-location-button" type="button" onClick={()=>void useLocation()} disabled={locating||busy}><LocateFixed size={15} aria-hidden="true"/>{locating?'Even zoeken…':'Mijn locatie'}</button></div></div><div className="delivery-result" id={resultId} role="status" aria-live="polite" aria-atomic="true">{locationNote}{result&&<>{messages[result.status]}</>}</div>{result?.status==='unavailable'&&<DeliveryAlternatives pickup={pickup} onPickup={()=>choosePickup(true)}/>}</aside>;
}

function DeliveryAlternatives({pickup,onPickup}:{pickup:boolean;onPickup:()=>void}){
 return <section className="delivery-alternatives" aria-label="Afhalen"><div className="delivery-alternative"><h3>Gratis afhalen</h3><p>Remmerdenplein 100, Amsterdam.</p><button type="button" className="pickup-choice-button" onClick={onPickup} disabled={pickup}>{pickup?'Afhalen gekozen ✓':'Kies gratis afhalen'}</button><p className="pickup-checkout-hint">Kies ook ‘Afhalen’ bij het afrekenen.</p></div></section>;
}
