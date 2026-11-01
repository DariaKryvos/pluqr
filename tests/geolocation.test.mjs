import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import { getCurrentLocation, hasLocationPermission } from '../src/lib/delivery/geolocation.ts';
const original=Object.getOwnPropertyDescriptor(globalThis,'navigator');
function navigator(value){Object.defineProperty(globalThis,'navigator',{configurable:true,value});}
afterEach(()=>{if(original)Object.defineProperty(globalThis,'navigator',original);else delete globalThis.navigator;});
test('existing location permission is reused without requesting permission',async()=>{
 let calls=0;
 navigator({permissions:{query:async()=>({state:'prompt'})},geolocation:{getCurrentPosition:()=>calls++}});
 assert.equal(await hasLocationPermission(),false);assert.equal(calls,0);
 navigator({permissions:{query:async()=>({state:'granted'})},geolocation:{getCurrentPosition:()=>calls++}});
 assert.equal(await hasLocationPermission(),true);assert.equal(calls,0);
});
test('unsupported permission checks do not stop the page',async()=>{
 navigator({geolocation:{}});assert.equal(await hasLocationPermission(),false);
 navigator({permissions:{query:async()=>{throw Error();}},geolocation:{}});assert.equal(await hasLocationPermission(),false);
});
test('GPS is a bounded, one-time lookup and returns no extra device data',async()=>{
 navigator({geolocation:{getCurrentPosition:(resolve,_reject,options)=>{assert.equal(options.timeout,8000);resolve({coords:{latitude:52,longitude:5,accuracy:10}});}}});
 assert.deepEqual(await getCurrentLocation(),{latitude:52,longitude:5});
});
test('denied or unavailable GPS gives a non-blocking postcode fallback',async()=>{
 navigator({geolocation:{getCurrentPosition:(_resolve,reject)=>reject({code:1})}});
 await assert.rejects(getCurrentLocation(),error=>error.message.includes('verder winkelen'));
 navigator({});await assert.rejects(getCurrentLocation(),error=>error.message.includes('postcode'));
});
