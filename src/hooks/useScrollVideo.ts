import { useEffect, useState, type RefObject } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Media timing is isolated so an image-sequence renderer can replace it later.
export function useScrollVideo(root: RefObject<HTMLElement | null>, video: RefObject<HTMLVideoElement | null>) {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const element = root.current;
    const media = video.current;
    if (!element || !media) return;
    let duration = 0;
    let desiredTime = 0;
    let scope: gsap.MatchMedia | undefined;
    const seek = () => {
      if (!media.seeking && Math.abs(media.currentTime - desiredTime) > .025) media.currentTime = desiredTime;
    };
    const initialize = () => {
      if (!Number.isFinite(media.duration) || media.duration <= 0 || scope) return;
      duration = Math.max(0, media.duration - .05);
      scope = gsap.matchMedia();
      scope.add('(prefers-reduced-motion: no-preference)', () => {
        const q = gsap.utils.selector(element);
        const clock = { time: 0 };
        const timeline = gsap.timeline({scrollTrigger: {id: 'pluqr-story', trigger: element, start: () => `top top+=${parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--site-header-height'))||0}`, end: '+=400%', pin: true, scrub: .3, invalidateOnRefresh: true}});
        timeline.to(clock, { time: duration, duration: .56, ease: 'none', onUpdate: () => { desiredTime = clock.time; seek(); } }, .15);
        timeline.to(q('.product-promises'), { autoAlpha: 0, y: -10, duration: .08 }, .12);
        timeline.to(q('.scene-hero'), { yPercent: -35, opacity: 0, duration: .18 }, .02);
        timeline.to(q('.product-stage'), {scale:1.07,top:'50%',duration:.3}, .1);
        timeline.fromTo(q('.slice-copy'), {autoAlpha:0,y:25}, {autoAlpha:1,y:0,duration:.09}, .18);
        timeline.fromTo(q('.slice-line'), {scaleX:0}, {scaleX:1,duration:.12}, .2);
        timeline.to(q('.slice-copy'), {autoAlpha:0,y:-15,duration:.06}, .53);
        timeline.to(q('.product-stage'), {scale:.68,duration:.07}, .58);
        timeline.fromTo(q('.ingredient-intro'), {autoAlpha:0,y:12}, {autoAlpha:1,y:0,duration:.04}, .59);
        timeline.fromTo(q('.ingredient'), {autoAlpha:0,y:14}, {autoAlpha:1,y:0,stagger:.015,duration:.035}, .61);
        timeline.to(q('.ingredient, .ingredient-intro'), {autoAlpha:0,y:-10,duration:.04}, .83);
        timeline.to(q('.product-stage'), {scale:()=>window.innerWidth<=760?1:1.08,duration:.14}, .82);
        timeline.fromTo(q('.story-closing'), {autoAlpha:0,y:16}, {autoAlpha:1,y:0,duration:.1}, .84);
        return () => {
          desiredTime = 0;
          media.pause();
          media.currentTime = 0;
        };
      });
    };
    const ready = () => setStatus('ready');
    const error = () => setStatus('error');
    media.addEventListener('loadedmetadata', initialize);
    media.addEventListener('loadeddata', ready);
    media.addEventListener('seeked', seek);
    media.addEventListener('error', error);
    if (media.readyState >= 1) initialize();
    if (media.readyState >= 2) ready();
    return () => {
      scope?.revert();
      media.removeEventListener('loadedmetadata', initialize);
      media.removeEventListener('loadeddata', ready);
      media.removeEventListener('seeked', seek);
      media.removeEventListener('error', error);
    };
  }, [root, video]);
  return status;
}
