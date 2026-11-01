'use client';

import { useState } from 'react';
import { ingredientCallouts } from '../data/ingredients';
export default function IngredientCallouts() {
 const [selected,setSelected] = useState<number|null>(null);
 return <div lang="nl" className={`ingredients ${selected!==null?'has-selection':''}`}><div className="ingredient-intro"><p className="scene-eyebrow">Onze ingrediënten</p><h2>Dit zit erin.</h2><a className="ingredient-list-link" href="#ingredienten">Bekijk alle ingrediënten ↗</a></div>{ingredientCallouts.map(([title,description],index)=><div className={`ingredient ingredient-${index+1} ${selected===index?'is-selected':''}`} key={title}><span className="ingredient-line" aria-hidden="true"/><button aria-pressed={selected===index} onPointerEnter={event=>{if(event.pointerType==='mouse')setSelected(index);}} onPointerLeave={event=>{if(event.pointerType==='mouse')setSelected(null);}} onClick={()=>setSelected(selected===index?null:index)}><span className="ingredient-name"><small>0{index+1}</small>{title}</span><span className="ingredient-description">{description}</span></button></div>)}</div>;
}
