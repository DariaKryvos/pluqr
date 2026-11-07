const rows=[
 ['Energie (kJ)','1987','996'],
 ['Energie (kcal)','475','238'],
 ['Vetten','24,3 g','12,1 g'],
 ['Waarvan verzadigd','2,7 g','1,3 g'],
 ['Koolhydraten','59,6 g','34,8 g'],
 ['Waarvan suikers','6,1 g','6,7 g'],
 ['Toegevoegde suikers','0 g','0 g'],
 ['Voedingsvezels','1 g','0,7 g'],
 ['Eiwitten','2,6 g','1,5 g'],
 ['Zout','0,3 g','0,1 g'],
];
export default function NutritionFacts(){
 return <details className="nutrition-disclosure" lang="nl"><summary>Voedingswaarde</summary><div className="nutrition-table-wrap"><table className="nutrition-table"><caption>Gemiddelde voedingswaarde</caption><thead><tr><th scope="col">Voedingsstof</th><th scope="col">Per 100 g</th><th scope="col">Per portie</th></tr></thead><tbody>{rows.map(([label,per100,portion])=><tr key={label} className={label.startsWith('Waarvan')||label==='Toegevoegde suikers'?'nutrition-subrow':undefined}><th scope="row">{label}</th><td>{per100}</td><td>{portion}</td></tr>)}</tbody></table><p className="nutrition-source">Volgens de aangeleverde productinformatie.</p></div></details>;
}
