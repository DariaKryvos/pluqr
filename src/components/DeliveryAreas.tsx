const areas = [
 {city:'Amsterdam',towns:['Diemen','Duivendrecht','Halfweg','Weesp','Zwanenburg']},
 {city:'Zaandam',towns:['Landsmeer','Oostzaan','Den Ilp']},
 {city:'Amstelveen',towns:['Ouderkerk aan de Amstel']},
 {city:'Schiphol-Rijk',towns:['Badhoevedorp','Hoofddorp','Lijnden']},
];
export default function DeliveryAreas(){
 return <section className="footer-delivery-areas" lang="nl"><details className="footer-areas-details"><summary>Bezorggebieden <span>Amsterdam en omgeving</span></summary><div className="footer-delivery-grid">{areas.map(area=><div key={area.city}><h3>{area.city}</h3><ul>{area.towns.map(town=><li key={town}>{town}</li>)}</ul></div>)}</div></details><p className="footer-delivery-note">Buiten het bezorggebied? Gratis afhalen in Amsterdam.</p></section>;
}
