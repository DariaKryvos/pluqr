import DeliveryAreas from './DeliveryAreas';
import IngredientList from './IngredientList';
import {ArrowUpRight} from 'lucide-react';
export default function PurchaseHelp(){
 const fee=process.env.DELIVERY_FEE_TEXT?.trim();
 const deadline=process.env.NEW_YEAR_ORDER_DEADLINE?.trim();
 return <section className="purchase-help purchase-help-minimal" aria-labelledby="purchase-help-title" lang="nl"><h2 id="purchase-help-title">Bezorgen & afhalen</h2><p className="purchase-help-summary">Dezelfde dag bezorgd · Gratis afhalen in Amsterdam</p><DeliveryAreas/><div className="purchase-faq"><details><summary>Bezorging en kosten</summary><p>Check je postcode bovenaan de pagina. {fee||'De bezorgkosten zie je bij het afrekenen, vóór betaling.'}</p></details><details><summary>Waar kan ik afhalen?</summary><p>Remmerdenplein 100, 1106 AK Amsterdam. Kies gratis afhalen in je winkelmand en bij het afrekenen.</p></details>{deadline&&<details><summary>Bestellen voor 31 december</summary><p>{deadline}</p></details>}<details><summary>Ingrediënten & allergenen</summary><div className="faq-ingredient-content"><p className="faq-allergen-note">Vegan · Glutenvrij · Bevat <strong>lupine</strong></p><IngredientList/></div></details></div><a className="business-order-link" href="mailto:info@pluqr.nl?subject=Zakelijke%20bestelling%20PLUQR">Zakelijk bestellen <ArrowUpRight size={14} aria-hidden="true"/></a></section>;
}
