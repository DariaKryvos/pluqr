import { Star, ArrowUpRight } from 'lucide-react';
const reviewUrl='https://www.trustpilot.com/review/pluqr.nl?utm_medium=trustbox&utm_source=TrustBoxReviewCollector';
// Public business score checked on 1 November 2026; not a product rating or live feed.
const score=4.4;
export default function TrustpilotBadge({compact=false}:{compact?:boolean}){
 return <div className="product-trustpilot"><a className="trustpilot-rating" href={reviewUrl} target="_blank" rel="noopener noreferrer" aria-label="PLUQR op Trustpilot: 4,4 uit 5 op basis van 35 reviews. Opent in nieuw tabblad." title="Bedrijfsscore gecontroleerd op 1 november 2026"><span className="trustpilot-rating-top"><span className="trustpilot-stars" aria-hidden="true">{Array.from({length:5},(_,index)=><span className="trustpilot-star" key={index}><Star size={17}/><span className="trustpilot-star-fill" style={{width:`${Math.max(0,Math.min(1,score-index))*100}%`}}><Star size={17}/></span></span>)}</span><strong>4,4<span> / 5</span></strong></span>{!compact&&<span className="trustpilot-rating-caption">Trustpilot <span>· 35 reviews</span><ArrowUpRight size={12} aria-hidden="true"/></span>}</a></div>;
}
