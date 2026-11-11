'use client';
import {useEffect,useState,type RefObject} from 'react';
interface VideoSource {src:string;media?:string}
interface Props {videoRef:RefObject<HTMLVideoElement|null>;src:string;sources?:VideoSource[];poster?:string;status:'loading'|'ready'|'error'}
export default function ProductVideo({videoRef,src,sources,poster='/videos/oliebol-slicing-poster.webp',status}:Props){
 const [needsStart,setNeedsStart]=useState(false);
 const [activeSrc,setActiveSrc]=useState<string>();
 // Browsers ignore <source media> on <video>, so pick the file before any bytes load.
 useEffect(()=>{
  setActiveSrc(sources?.find(source=>!source.media||window.matchMedia(source.media).matches)?.src??src);
 },[src,sources]);
 useEffect(()=>{
  if(status==='ready'){setNeedsStart(false);return;}
  const timer=setTimeout(()=>setNeedsStart(true),4000);
  return()=>clearTimeout(timer);
 },[status]);
 function startVideo(){
  const media=videoRef.current;if(!media)return;
  media.muted=true;media.playsInline=true;
  if(media.error||media.networkState===HTMLMediaElement.NETWORK_NO_SOURCE)media.load();
  void media.play().then(()=>{media.pause();setNeedsStart(false);}).catch(()=>setNeedsStart(true));
 }
 return <><div className="product-stage"><video ref={videoRef} src={activeSrc} muted playsInline preload="auto" poster={poster} aria-label="Van een schaal verse oliebollen naar één oliebol die opent en zijn luchtige binnenkant onthult."/><span className="media-status" role="status">{status==='loading'&&!needsStart?'Even opwarmen…':status==='error'?'Tik om de video opnieuw te laden.':''}</span></div>{(needsStart||status==='error')&&<button type="button" className="story-video-start" onClick={startVideo}>Video starten <span aria-hidden="true">▷</span></button>}</>;
}
