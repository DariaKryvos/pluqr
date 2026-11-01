'use client';

import { useEffect, useRef, useState } from 'react';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import BrandLogo from './BrandLogo';
import { CartButton } from './CartProvider';
export default function Navbar() {
 const [open,setOpen] = useState(false);
 const button = useRef<HTMLButtonElement>(null);
 useEffect(() => { const close=(e:KeyboardEvent)=>{if(e.key==='Escape' && open){setOpen(false);button.current?.focus();}};window.addEventListener('keydown',close);return()=>window.removeEventListener('keydown',close);},[open]);
 return <header className="cinema-nav"><button className="nav-menu-button" ref={button} aria-expanded={open} aria-controls="cinema-menu" aria-label={open?'Close menu':'Open menu'} onClick={()=>setOpen(!open)}>{open?<X size={21}/>:<Menu size={21}/>}</button><BrandLogo/><div className="nav-right"><CartButton/></div>{open&&<nav id="cinema-menu" aria-label="Main navigation"><a href="/#experience" onClick={()=>setOpen(false)}>The experience <ArrowUpRight size={17}/></a><a href="/#producten" onClick={()=>setOpen(false)}>Our oliebollen <ArrowUpRight size={17}/></a><a href="/#our-story" onClick={()=>setOpen(false)}>The Dutch tradition <ArrowUpRight size={17}/></a></nav>}</header>;
}
