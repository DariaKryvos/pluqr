import { fullIngredients as ingredients } from '../data/ingredients';
export default function IngredientList() {
  return <p className="detail-ingredients">{ingredients.map((ingredient,index)=><span key={ingredient}>{index>0?', ':''}{ingredient.includes('lupine')?<strong>{ingredient}</strong>:ingredient}{index===ingredients.length-1?'.':''}</span>)}</p>;
}
