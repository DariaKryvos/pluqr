'use client';
import {useEffect,useState,type RefObject} from 'react';
interface VideoSource {src:string;type:string;media?:string}
interface Props {videoRef:RefObject<HTMLVideoElement|null>;src:string;sources?:VideoSource[];poster?:string;status:'loading'|'ready'|'error'}
export default function ProductVideo({videoRef,src,sources,poster='/videos/oliebol-slicing-poster.webp',status}:Props){
 const [needsStart,setNeedsStart]=useState(false);
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
 return <><div className="product-stage"><video ref={videoRef} src={sources?undefined:src} muted playsInline preload="auto" poster={poster} aria-label="Van een schaal verse oliebollen naar één oliebol die opent en zijn luchtige binnenkant onthult.">{sources&&<>{sources.map(source=><source key={source.src} src={source.src} type={source.type} media={source.media}/>)}<source src={src} type="video/mp4"/></>}</video><span className="media-status" role="status">{status==='loading'&&!needsStart?'Even opwarmen…':status==='error'?'Tik om de video opnieuw te laden.':''}</span></div>{(needsStart||status==='error')&&<button type="button" className="story-video-start" onClick={startVideo}>Video starten <span aria-hidden="true">▷</span></button>}</>;
}
