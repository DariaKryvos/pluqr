'use client';
import {useEffect,useRef,useState} from 'react';
import {Share2,Check} from 'lucide-react';
import {productPath} from '../lib/seo/site';
export default function ProductShare({handle,title}:{handle:string;title:string}){
 const [status,setStatus]=useState('');
 const [busy,setBusy]=useState(false);
 const timer=useRef<ReturnType<typeof setTimeout>|null>(null);
 useEffect(()=>()=>{if(timer.current)clearTimeout(timer.current);},[]);
 function announce(message:string){setStatus(message);if(timer.current)clearTimeout(timer.current);timer.current=setTimeout(()=>setStatus(''),3500);}
 async function share(){
  const url=new URL(productPath(handle),window.location.origin).href;
  setBusy(true);
  try{
   if(navigator.share){await navigator.share({title:`${title} | PLUQR`,url});}
   else{await navigator.clipboard.writeText(url);announce('Link gekopieerd');}
  }catch(error){if(!(error instanceof DOMException&&error.name==='AbortError'))announce('Delen lukt niet. Probeer opnieuw.');}
  finally{setBusy(false);}
 }
 return <div className="product-share"><button type="button" onClick={()=>void share()} disabled={busy} aria-label={`${title} delen`} title="Product delen">{status==='Link gekopieerd'?<Check size={16} aria-hidden="true"/>:<Share2 size={16} aria-hidden="true"/>}<span className="sr-only">Delen</span></button><span className="product-share-status" role="status" aria-live="polite">{status}</span></div>;
}
