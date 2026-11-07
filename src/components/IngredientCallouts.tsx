const callouts = [
 {name:'Spliterwtenmelk',kind:'peas',detail:'De plantaardige basis'},
 {name:'Maïszetmeel & rijstmeel',kind:'flour',detail:'Voor een zachte binnenkant'},
 {name:'Appel & kaneel',kind:'apple',detail:'Een warme, vertrouwde smaak'},
 {name:'Lupine-eiwit',kind:'lupine',detail:'Plantaardig eiwit'},
 {name:'Zonnebloemolie',kind:'oil',detail:'Biologisch'},
 {name:'Psylliumvezel',kind:'fibre',detail:'Gemalen vlozaadvezel'},
];
export default function IngredientCallouts(){
 return <div lang="nl" className="ingredients ingredient-orbit"><div className="ingredient-intro"><p className="scene-eyebrow">Bewust gekozen ingrediënten</p><h2>Plantaardig.<br/><span className="story-gold-accent">Vol van smaak.</span></h2></div>{callouts.map((item,index)=><div className={`ingredient ingredient-${index+1}`} key={item.name}><span className={`ingredient-photo ingredient-photo-${item.kind}`} aria-hidden="true"/><div><span className="ingredient-name">{item.name}</span><span className="ingredient-description">{item.detail}</span></div></div>)}</div>;
}
