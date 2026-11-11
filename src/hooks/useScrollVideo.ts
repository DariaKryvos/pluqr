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
    let progress=0;
    let scope: gsap.MatchMedia | undefined;
    let active=true;
    let activating=false;
    let activated=false;
    let refreshFrame=0;
    let refreshed=false;
    let seekTimer=0;
    const applySeek = () => {
      if(Math.abs(media.currentTime-desiredTime)>.025){try{media.currentTime=desiredTime;}catch{/* Retry when the first video frame is available. */}}
    };
    // iOS can leave a seek pending forever without firing `seeked`; re-issue it so scrubbing never stalls.
    const watchSeek = () => {
      seekTimer=0;
      if(!active||!media.seeking)return;
      // currentTime already reports the pending target while seeking, so force the reissue.
      try{media.currentTime=desiredTime;}catch{/* Keep retrying until the decoder responds. */}
      seekTimer=window.setTimeout(watchSeek,300);
    };
    const seek = () => {
      if(!active||!duration||media.readyState<1)return;
      if(media.seeking){if(!seekTimer)seekTimer=window.setTimeout(watchSeek,300);return;}
      applySeek();
    };
    const seeked = () => {clearTimeout(seekTimer);seekTimer=0;seek();};
    const initialize = () => {
      if(Number.isFinite(media.duration)&&media.duration>0)duration=Math.max(0,media.duration-.05);
      if(scope){desiredTime=progress*duration;seek();return;}
      scope = gsap.matchMedia();
      scope.add('(prefers-reduced-motion: no-preference)', () => {
        const q = gsap.utils.selector(element);
        const clock = { time: 0 };
        const timeline = gsap.timeline({scrollTrigger: {id: 'pluqr-story', trigger: element, start: () => `top top+=${parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--site-header-height'))||0}`, end: '+=400%', pin: true, scrub: .3, invalidateOnRefresh: true}});
        timeline.to(clock, { time: 1, duration: .56, ease: 'none', onUpdate: () => { progress=clock.time; desiredTime = progress*duration; seek(); } }, .15);
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
    const ready = () => {
      initialize();seek();setStatus('ready');
      if(!refreshed){refreshed=true;refreshFrame=requestAnimationFrame(()=>{if(active)ScrollTrigger.refresh();});}
    };
    // iOS can postpone video decoding until the first real interaction.
    // Prime the muted inline decoder, then keep playback controlled by scrolling.
    const activate = () => {
      if(activated||activating||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
      activating=true;media.muted=true;media.playsInline=true;
      void media.play().then(()=>{
        if(!active){media.pause();return;}
        media.pause();activated=true;seek();
        window.removeEventListener('touchstart',activate);
        window.removeEventListener('pointerdown',activate);
        window.removeEventListener('touchend',activate);
        window.removeEventListener('click',activate);
      }).catch(()=>{/* A later gesture can retry if mobile playback was blocked. */}).finally(()=>{activating=false;});
    };
    const error = () => setStatus('error');
    window.addEventListener('touchstart',activate,{passive:true});
    window.addEventListener('pointerdown',activate,{passive:true});
    window.addEventListener('touchend',activate,{passive:true});
    window.addEventListener('click',activate,{passive:true});
    media.addEventListener('durationchange',initialize);
    media.addEventListener('canplay',ready);
    media.addEventListener('loadedmetadata', initialize);
    media.addEventListener('loadeddata', ready);
    media.addEventListener('seeked', seeked);
    media.addEventListener('error', error);
    initialize();
    if (media.readyState >= 2) ready();
    return () => {
      active=false;cancelAnimationFrame(refreshFrame);clearTimeout(seekTimer);
      window.removeEventListener('touchstart',activate);
      window.removeEventListener('pointerdown',activate);
      window.removeEventListener('touchend',activate);
      window.removeEventListener('click',activate);
      media.removeEventListener('durationchange',initialize);
      media.removeEventListener('canplay',ready);
      scope?.revert();
      media.removeEventListener('loadedmetadata', initialize);
      media.removeEventListener('loadeddata', ready);
      media.removeEventListener('seeked', seeked);
      media.removeEventListener('error', error);
    };
  }, [root, video]);
  return status;
}
