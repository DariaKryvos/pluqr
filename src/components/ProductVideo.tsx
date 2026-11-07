import type { RefObject } from 'react';
interface VideoSource { src: string; type: string }
interface Props { videoRef: RefObject<HTMLVideoElement|null>; src: string; sources?: VideoSource[]; poster?: string; status: 'loading'|'ready'|'error' }
// Transparent sources go first: Safari picks the HEVC-alpha .mov, Chrome/Firefox skip it for the VP9-alpha .webm; `src` is the opaque fallback.
export default function ProductVideo({videoRef,src,sources,poster='/videos/oliebol-slicing-poster.webp',status}:Props) {
 return <div className="product-stage"><video ref={videoRef} src={sources?undefined:src} muted playsInline preload="auto" poster={poster} aria-label="Van een schaal verse oliebollen naar één oliebol die opent en zijn luchtige binnenkant onthult.">{sources&&<>{sources.map(source=><source key={source.src} src={source.src} type={source.type}/>)}<source src={src} type="video/mp4"/></>}</video><span className="media-status" role="status">{status==='loading'?'Even opwarmen…':status==='error'?'De video is niet beschikbaar. Je ziet de afbeelding.':''}</span></div>;
}
