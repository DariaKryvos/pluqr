'use client';

import { useRef } from 'react';
import { Leaf, WheatOff, Croissant } from 'lucide-react';
import { useScrollVideo } from '../hooks/useScrollVideo';
import ProductVideo from './ProductVideo';
import IngredientCallouts from './IngredientCallouts';
import FinaleTypography from './FinaleTypography';
interface Props { videoSrc?: string }
const storySources=[{src:'/videos/pluqr-plate-to-open-mobile.mp4',media:'(max-width: 760px)'}];
export default function ScrollExperience({videoSrc='/videos/pluqr-plate-to-open-clean.mp4'}:Props) {
 const root=useRef<HTMLElement>(null);
 const video=useRef<HTMLVideoElement>(null);
 const status=useScrollVideo(root,video);
 return <section ref={root} className="cinematic-scene" id="experience" lang="nl" aria-label="Het verhaal van onze oliebollen">
   <div className="scene-grain" aria-hidden="true"/>
   <div className="scene-hero"><p className="scene-eyebrow">Plantaardig. Dagvers.</p><h1 className="reference-headline"><span>Niet</span><span>zomaar</span><span>een</span><span>oliebol.</span></h1><p className="hero-description">Veganistisch. Glutenvrij.<br/>Elke dag vers gebakken.</p></div>
   <ul className="product-promises" aria-label="Onze oliebollen">
     <li><Leaf size={20} strokeWidth={1.4} aria-hidden="true"/><span>Veganistisch</span></li>
     <li><WheatOff size={20} strokeWidth={1.4} aria-hidden="true"/><span>Glutenvrij</span></li>
     <li><Croissant size={20} strokeWidth={1.4} aria-hidden="true"/><span>Vers gebakken</span></li>
   </ul>
   <ProductVideo videoRef={video} src={videoSrc} sources={videoSrc==='/videos/pluqr-plate-to-open-clean.mp4'?storySources:undefined} poster="/videos/pluqr-story-poster.webp" status={status}/>
   <div className="slice-copy"><p className="scene-eyebrow">Alle smaak. Voor iedereen.</p><h2><span>Volop</span><span>smaak.</span><span>Zonder</span><span>compromissen.</span></h2><span className="slice-line"/><p>Goudbruin van buiten. Heerlijk luchtig van binnen.</p></div>
   <IngredientCallouts/><FinaleTypography/>
 </section>;
}
