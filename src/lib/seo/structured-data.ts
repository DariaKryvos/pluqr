import { absoluteUrl, productPath, site } from './site.ts';
import type { ShopifyProduct } from '../shopify/types.ts';
export function serializeJsonLd(data:unknown) { return JSON.stringify(data).replace(/</g,'\\u003c').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029'); }
export function businessSchema(){
  return {
    '@type':'Bakery','@id':absoluteUrl('/#bakery'),name:site.name,url:absoluteUrl(),description:site.description,
    logo:{'@type':'ImageObject',url:absoluteUrl('/pluqr-logo.avif'),width:100,height:71},image:absoluteUrl('/pluqr-social.jpg'),
    telephone:site.telephone,email:site.email,
    address:{'@type':'PostalAddress',streetAddress:site.street,postalCode:site.postcode,addressLocality:site.city,addressCountry:'NL'},
    identifier:{'@type':'PropertyValue',propertyID:'KVK',value:site.kvk},
    contactPoint:{'@type':'ContactPoint',contactType:'klantenservice',telephone:site.telephone,email:site.email,availableLanguage:['nl','en'],url:'https://wa.me/31853015920'},
    hasMap:'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(`${site.street}, ${site.postcode} ${site.city}`),
    areaServed:(process.env.DELIVERY_LOCALITIES||'').split(',').map(value=>value.trim()).filter(Boolean).map(name=>({'@type':'Place',name})),
  };
}
export function homepageSchema(products:ShopifyProduct[]){
  return {'@context':'https://schema.org','@graph':[
    businessSchema(),
    {'@type':'WebSite','@id':absoluteUrl('/#website'),url:absoluteUrl(),name:site.name,inLanguage:'nl-NL',publisher:{'@id':absoluteUrl('/#bakery')}},
    {'@type':'CollectionPage','@id':absoluteUrl('/#webpage'),url:absoluteUrl(),name:site.title,description:site.description,inLanguage:'nl-NL',isPartOf:{'@id':absoluteUrl('/#website')},about:{'@id':absoluteUrl('/#bakery')},...(products.length?{mainEntity:{'@id':absoluteUrl('/#assortiment')}}:{})},
    ...(products.length?[{'@type':'ItemList','@id':absoluteUrl('/#assortiment'),name:'Onze oliebollen',numberOfItems:products.length,itemListElement:products.map((product,index)=>({'@type':'ListItem',position:index+1,name:product.title,url:absoluteUrl(productPath(product.handle))}))}]:[]),
  ]};
}
export function productSchema(product:ShopifyProduct){
  const url=absoluteUrl(productPath(product.handle));
  const offers=product.variants.nodes.map(variant=>({'@type':'Offer',url,price:variant.price.amount,priceCurrency:variant.price.currencyCode,availability:variant.availableForSale?'https://schema.org/InStock':'https://schema.org/OutOfStock',itemCondition:'https://schema.org/NewCondition',seller:{'@id':absoluteUrl('/#bakery')},...(variant.title!=='Default Title'?{name:variant.title}:{})}));
  return {'@context':'https://schema.org','@graph':[
    businessSchema(),
    {'@type':'Product','@id':url+'#product',url,name:product.title,description:product.description,productID:product.id,image:[product.featuredImage?.url||absoluteUrl('/pluqr-social.jpg')],brand:{'@type':'Brand',name:site.name},...(offers.length?{offers:offers.length===1?offers[0]:offers}:{})},
    {'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Home',item:absoluteUrl()},{'@type':'ListItem',position:2,name:product.title,item:url}]},
  ]};
}
