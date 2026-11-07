'use client';
import {useEffect,useId,useState} from 'react';
import {AlertCircle,CheckCircle2} from 'lucide-react';
import type {DeliveryResult} from '../lib/delivery/check';
interface Props{pickup:boolean;onPickup:(value:boolean)=>void;onVerified:(postcode:string|null)=>void}
export default function CartDeliveryOptions({pickup,onPickup,onVerified}:Props){
 const id=useId();
 const [postcode,setPostcode]=useState('');
 const [result,setResult]=useState<DeliveryResult|null>(null);
 const [checking,setChecking]=useState(false);
 const [blurred,setBlurred]=useState(false);
 useEffect(()=>{try{setPostcode(sessionStorage.getItem('pluqr-delivery-postcode')||'');}catch{}},[]);
 useEffect(()=>{
  onVerified(null);setResult(null);
  const normalized=postcode.replace(/\s/g,'').toUpperCase();
  if(pickup||!(/^[1-9][0-9]{3}[A-Z]{2}$/).test(normalized)){setChecking(false);return;}
  const controller=new AbortController();setChecking(true);
  const timer=setTimeout(async()=>{
   try{
    const response=await fetch('/api/delivery/check',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({postcode:normalized}),signal:controller.signal});
    if(!response.ok)throw new Error();
    const data:DeliveryResult=await response.json();
    if(controller.signal.aborted)return;
    setResult(data);onVerified(data.status==='available'?normalized:null);
   }catch{if(!controller.signal.aborted)setResult({status:'error'});}
   finally{if(!controller.signal.aborted)setChecking(false);}
  },0);
  return()=>{clearTimeout(timer);controller.abort();};
 },[postcode,pickup,onVerified]);
 const normalized=postcode.replace(/\s/g,'').toUpperCase();
 const formatInvalid=!!normalized&&!/^[1-9][0-9]{3}[A-Z]{2}$/.test(normalized)&&(blurred||normalized.length>=6);
 const invalid=formatInvalid||result?.status==='invalid';
 const outside=result?.status==='unavailable';
 const failed=result?.status==='error'||result?.status==='unconfigured';
 const available=result?.status==='available';
 const warning=invalid||outside||failed;
 const heading=checking?'Postcode controleren…':formatInvalid?'Ongeldige postcode':invalid?'Postcode niet gevonden':outside?'Buiten ons bezorggebied':failed?'Controle tijdelijk niet beschikbaar':available?'We bezorgen bij jou':'Waar mogen we bezorgen?';
 const detail=checking?'Even geduld.':formatInvalid?'Vul 4 cijfers en 2 letters in, bijvoorbeeld 1106 AK.':invalid?'We vinden geen adres bij deze postcode. Controleer de cijfers en letters.':outside?'Op deze postcode bezorgen we niet. Je kunt wel gratis afhalen in Amsterdam.':failed?'Probeer het opnieuw of kies gratis afhalen.':available?'Je kunt verder naar adres en betaling.':'Vul je postcode in. We controleren deze automatisch.';
 return <section className="cart-delivery-options" aria-label="Bezorgen of afhalen">
  {pickup?<p className="cart-delivery-message"><strong>Gratis afhalen gekozen</strong><br/>Remmerdenplein 100, Amsterdam.<br/><small>Kies ook ‘Afhalen’ bij het afrekenen.</small><br/><button type="button" className="cart-change-postcode" onClick={()=>onPickup(false)}>Andere postcode controleren</button></p>:<>
   <label htmlFor={id}>Jouw bezorgpostcode</label>
   <input id={id} aria-invalid={invalid||outside} aria-describedby={`${id}-result`} autoComplete="postal-code" name="postal-code" placeholder="1234 AB" maxLength={7} value={postcode} onBlur={()=>setBlurred(true)} onChange={event=>{onVerified(null);setResult(null);setBlurred(false);setPostcode(event.target.value);try{sessionStorage.setItem('pluqr-delivery-postcode',event.target.value);}catch{}}}/>
   <div id={`${id}-result`} className={`cart-delivery-feedback cart-delivery-feedback-clear${warning?' is-warning':''}${available?' is-available':''}`} role="status" aria-live="polite" aria-atomic="true">
    {warning?<AlertCircle size={20} aria-hidden="true"/>:available?<CheckCircle2 size={20} aria-hidden="true"/>:null}
    <div><strong>{heading}</strong><p>{detail}</p></div>
    {(outside||failed)&&<button type="button" className="cart-outside-pickup" onClick={()=>onPickup(true)}>Kies gratis afhalen</button>}
   </div>
  </>}
 </section>;
}
