'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import BrandLogo from './BrandLogo';
import { CartButton } from './CartProvider';
export default function Navbar() {
 const [open,setOpen] = useState(false);
 const [scrolled,setScrolled]=useState(false);
 useEffect(()=>{
  const update=()=>setScrolled(window.scrollY>24);
  update();window.addEventListener('scroll',update,{passive:true});
  return()=>window.removeEventListener('scroll',update);
 },[]);
 const button = useRef<HTMLButtonElement>(null);
 const headerRef=useRef<HTMLElement>(null);
 useEffect(()=>{
  if(!open)return;
  const closeOutside=(event:PointerEvent)=>{if(event.target instanceof Node&&!headerRef.current?.contains(event.target))setOpen(false);};
  document.addEventListener('pointerdown',closeOutside);
  return()=>document.removeEventListener('pointerdown',closeOutside);
 },[open]);
 useLayoutEffect(()=>{
  const header=button.current?.closest('.opening-header');
  if(!header)return;
  let frame=0;
  let previousHeight=-1;
  const update=()=>{
   const height=header.getBoundingClientRect().height;
   if(height===previousHeight)return;
   previousHeight=height;
   document.documentElement.style.setProperty('--site-header-height',`${height}px`);
   cancelAnimationFrame(frame);
   frame=requestAnimationFrame(()=>ScrollTrigger.refresh());
  };
  update();
  const observer=new ResizeObserver(update);observer.observe(header);
  return()=>{observer.disconnect();cancelAnimationFrame(frame);};
 },[]);
 useEffect(() => { const close=(e:KeyboardEvent)=>{if(e.key==='Escape' && open){setOpen(false);button.current?.focus();}};window.addEventListener('keydown',close);return()=>window.removeEventListener('keydown',close);},[open]);
 return <header ref={headerRef} className={`cinema-nav${scrolled?' is-scrolled':''}`}><button className="nav-menu-button" ref={button} aria-expanded={open} aria-controls="cinema-menu" aria-label={open?'Menu sluiten':'Menu openen'} onClick={()=>setOpen(!open)}>{open?<X size={21}/>:<Menu size={21}/>}</button><BrandLogo/><div className="nav-right"><CartButton/></div>{open&&<nav id="cinema-menu" aria-label="Hoofdnavigatie"><a href="/#experience" onClick={()=>setOpen(false)}>De beleving</a><a href="/#producten" onClick={()=>setOpen(false)}>Onze oliebollen</a><a href="/over-pluqr" onClick={()=>setOpen(false)}>Over PLUQR</a><a href="mailto:info@pluqr.nl?subject=Zakelijke%20bestelling%20PLUQR" onClick={()=>setOpen(false)}>Zakelijk bestellen</a></nav>}</header>;
}
