'use client';

import { useRef } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowDown, Leaf, WheatOff, Croissant } from 'lucide-react';
import { useScrollVideo } from '../hooks/useScrollVideo';
import ProductVideo from './ProductVideo';
import IngredientCallouts from './IngredientCallouts';
import FinaleTypography from './FinaleTypography';
interface Props { videoSrc?: string }
export default function ScrollExperience({videoSrc='/videos/oliebol-slicing.mp4'}:Props) {
 const root=useRef<HTMLElement>(null);
 const video=useRef<HTMLVideoElement>(null);
 const status=useScrollVideo(root,video);
 function exploreStory(){
  const story=ScrollTrigger.getById('pluqr-story');
  if(story){window.scrollTo({top:story.start+(story.end-story.start)*.3,behavior:'smooth'});}
  else root.current?.querySelector('.slice-copy')?.scrollIntoView({behavior:'auto',block:'center'});
 }
 return <section ref={root} className="cinematic-scene" id="experience" aria-label="The oliebol experience">
   <div className="scene-grain" aria-hidden="true"/>
   <div className="scene-hero"><p className="scene-eyebrow">A Dutch original. A new perspective.</p><h1>Not just<br/>an oliebol.</h1></div>
   <ul className="product-promises" aria-label="About our oliebollen">
     <li><Leaf size={20} strokeWidth={1.4} aria-hidden="true"/><span>Vegan</span></li>
     <li><WheatOff size={20} strokeWidth={1.4} aria-hidden="true"/><span>Gluten-free</span></li>
     <li><Croissant size={20} strokeWidth={1.4} aria-hidden="true"/><span>Freshly baked</span></li>
   </ul>
   <ProductVideo videoRef={video} src={videoSrc} status={status}/>
   <div className="slice-copy"><p className="scene-eyebrow">Made for everyone</p><h2>All the taste.<br/>No compromise.</h2><span className="slice-line"/><p>Vegan. Gluten-free. Freshly baked.<br/>An oliebol that fits your preferences,<br/>with all the flavour you love.</p></div>
   <IngredientCallouts/><FinaleTypography/>
   <div className="scene-footer"><div className="scene-counter" aria-label="Three chapters"><span className="counter-first">01</span><span className="counter-second">02</span><span className="counter-third">03</span><i>/ 03</i></div><button className="scene-scroll" type="button" onClick={exploreStory}>Scroll om te ontdekken <ArrowDown size={14}/></button></div>
 </section>;
}
