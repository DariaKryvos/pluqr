import assert from 'node:assert/strict';
import { test } from 'node:test';
import { startLiveRefresh } from '../src/lib/shopify/live-refresh.ts';
import { shopifyApi } from '../src/lib/shopify/browser.ts';

test('refreshes every five seconds and on focus, pauses hidden tabs, and cleans up',()=>{
 const originalWindow=globalThis.window,originalDocument=globalThis.document;
 const window=new EventTarget(),document=new EventTarget();
 let timer,period,cleared=false,calls=0;
 document.visibilityState='visible';
 window.setInterval=(callback,interval)=>{timer=callback;period=interval;return 1;};
 window.clearInterval=id=>{assert.equal(id,1);cleared=true;};
 globalThis.window=window;globalThis.document=document;
 try{
  const stop=startLiveRefresh(()=>calls++);
  assert.equal(period,5000);
  timer();assert.equal(calls,1);
  document.visibilityState='hidden';timer();window.dispatchEvent(new Event('focus'));assert.equal(calls,1);
  document.visibilityState='visible';document.dispatchEvent(new Event('visibilitychange'));assert.equal(calls,2);
  window.dispatchEvent(new Event('focus'));assert.equal(calls,3);
  stop();assert.ok(cleared);
  window.dispatchEvent(new Event('focus'));document.dispatchEvent(new Event('visibilitychange'));assert.equal(calls,3);
 }finally{
  if(originalWindow===undefined)delete globalThis.window;else globalThis.window=originalWindow;
  if(originalDocument===undefined)delete globalThis.document;else globalThis.document=originalDocument;
 }
});

test('browser reads request fresh data and can be aborted before a cart mutation',async()=>{
 const original=globalThis.fetch;
 const controller=new AbortController();
 let calls=0;
 try{
  globalThis.fetch=async(url,options)=>{
   assert.equal(url,'/api/shopify/products');assert.equal(options.cache,'no-store');assert.equal(options.credentials,'same-origin');assert.equal(options.signal,controller.signal);
   return Response.json({products:[{title:++calls===1?'Old title':'Updated title'}]});
  };
  assert.equal((await shopifyApi('products','GET',undefined,controller.signal)).products[0].title,'Old title');
  assert.equal((await shopifyApi('products','GET',undefined,controller.signal)).products[0].title,'Updated title');
 }finally{globalThis.fetch=original;}
});
