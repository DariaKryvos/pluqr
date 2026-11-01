import type { RefObject } from 'react';
interface Props { videoRef: RefObject<HTMLVideoElement|null>; src: string; status: 'loading'|'ready'|'error' }
export default function ProductVideo({videoRef,src,status}:Props) {
 return <div className="product-stage"><video ref={videoRef} src={src} muted playsInline preload="auto" poster="/videos/oliebol-slicing-poster.webp" aria-label="A whole oliebol slowly separates into two halves, revealing its soft interior and floating ingredients."/><span className="media-status" role="status">{status==='loading'?'Preparing the experience…':status==='error'?'Video unavailable. Enjoy the still composition.':''}</span></div>;
}
