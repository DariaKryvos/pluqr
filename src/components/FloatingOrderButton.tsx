'use client';
import {useEffect,useState,type MouseEvent} from 'react';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import {ArrowRight,ShoppingBag} from 'lucide-react';
export default function FloatingOrderButton(){
 const [overStory,setOverStory]=useState(true);
 const [productsVisible,setProductsVisible]=useState(false);
 useEffect(()=>{
  let frame=0;
  const update=()=>{
   frame=0;
   const products=document.querySelector('.shop-grid');
   const productRect=products?.getBoundingClientRect();
   setProductsVisible(!!productRect&&productRect.bottom>120&&productRect.top<window.innerHeight-60);
   const scene=document.querySelector('.cinematic-scene');
   if(!scene){setOverStory(false);return;}
   const rect=scene.getBoundingClientRect();
   const y=window.innerHeight-80;
   setOverStory(rect.top<=y&&rect.bottom>=y);
  };
  const schedule=()=>{if(!frame)frame=requestAnimationFrame(update);};
  update();window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule);
  return()=>{cancelAnimationFrame(frame);window.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule);};
 },[]);
 function jumpToProducts(event:MouseEvent<HTMLAnchorElement>){
  const products=document.getElementById('producten');
  if(!products)return;
  event.preventDefault();
  ScrollTrigger.refresh();
  const align=()=>{
   const header=document.querySelector('.opening-header')?.getBoundingClientRect().height||0;
   window.scrollTo({top:products.getBoundingClientRect().top+window.scrollY-header,behavior:'instant'});
   ScrollTrigger.update();
   ScrollTrigger.getById('pluqr-story')?.getTween()?.progress(1);
  };
  align();requestAnimationFrame(align);
  window.history.replaceState(null,'','#producten');
 }
 if(productsVisible)return null;
 return <a className={`story-order-button floating-order-button${overStory?' is-over-story':''}`} href="#producten" onClick={jumpToProducts} lang="nl">Bestel nu <ShoppingBag size={21} aria-hidden="true"/><ArrowRight size={20} aria-hidden="true"/></a>;
}
