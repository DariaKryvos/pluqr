'use client';
import {useEffect,useState} from 'react';
const key='pluqr-delivery-method';
const eventName='pluqr-delivery-method-change';
export function useDeliveryPreference(){
 const [pickup,setPickup]=useState(false);
 useEffect(()=>{const read=()=>{try{setPickup(sessionStorage.getItem(key)==='pickup');}catch{}};read();window.addEventListener(eventName,read);return()=>window.removeEventListener(eventName,read);},[]);
 function choosePickup(value:boolean){try{sessionStorage.setItem(key,value?'pickup':'delivery');}catch{}setPickup(value);window.dispatchEvent(new Event(eventName));}
 return {pickup,choosePickup};
}
