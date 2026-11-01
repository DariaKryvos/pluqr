import assert from 'node:assert/strict';
import { afterEach, beforeEach, test } from 'node:test';
import { absoluteUrl, allowIndexing, productPath } from '../src/lib/seo/site.ts';
import { homepageSchema, productSchema, serializeJsonLd } from '../src/lib/seo/structured-data.ts';
const keys=['SITE_URL','SITE_INDEXABLE','NODE_ENV','DELIVERY_LOCALITIES'];
const original=Object.fromEntries(keys.map(key=>[key,process.env[key]]));
beforeEach(()=>{process.env.SITE_URL='https://pluqr.nl';process.env.NODE_ENV='production';delete process.env.SITE_INDEXABLE;process.env.DELIVERY_LOCALITIES='Amsterdam, Weesp';});
afterEach(()=>{for(const[key,value]of Object.entries(original)){if(value===undefined)delete process.env[key];else process.env[key]=value;}});
const product={id:'gid://shopify/Product/123',handle:'naturel',title:'Oliebollen Naturel',description:'Vers gebakken oliebollen.',featuredImage:{url:'https://cdn.shopify.com/test.jpg'},variants:{nodes:[{id:'gid://shopify/ProductVariant/1',title:'Default Title',price:{amount:'19.50',currencyCode:'EUR'},availableForSale:true}]}};
test('canonical and product URLs use the configured origin with safe handle encoding',()=>{
 assert.equal(absoluteUrl('/producten/naturel'),'https://pluqr.nl/producten/naturel');
 assert.equal(productPath('test?x=1'),'/producten/test%3Fx%3D1');
 process.env.SITE_URL='https://example.test/path';assert.equal(absoluteUrl('/'),'https://example.test/');
});
test('development and explicitly disabled deployments are not indexable',()=>{
 assert.equal(allowIndexing(),true);process.env.NODE_ENV='development';assert.equal(allowIndexing(),false);
 process.env.NODE_ENV='production';process.env.SITE_INDEXABLE='false';assert.equal(allowIndexing(),false);
});
test('homepage schema contains verified business details and crawlable catalog links',()=>{
 const data=homepageSchema([product]);const business=data['@graph'].find(node=>node['@type']==='Bakery');
 assert.equal(business.address.streetAddress,'Remmerdenplein 100');assert.equal(business.address.postalCode,'1106 AK');assert.equal(business.telephone,'+31853015920');assert.equal(business.identifier.value,'80502679');
 assert.deepEqual(business.areaServed.map(area=>area.name),['Amsterdam','Weesp']);
 assert.ok(!('openingHours'in business));assert.ok(!('aggregateRating'in business));
 const items=data['@graph'].find(node=>node['@type']==='ItemList');assert.equal(items.itemListElement[0].url,'https://pluqr.nl/producten/naturel');
});
test('product offers reflect live currency, price and stock without invented reviews',()=>{
 const node=productSchema(product)['@graph'].find(node=>node['@type']==='Product');
 assert.equal(node.offers.price,'19.50');assert.equal(node.offers.priceCurrency,'EUR');assert.equal(node.offers.availability,'https://schema.org/InStock');assert.equal(node.url,'https://pluqr.nl/producten/naturel');
 assert.ok(!('review'in node));assert.ok(!('aggregateRating'in node));assert.ok(!('priceValidUntil'in node.offers));
 const unavailable=structuredClone(product);unavailable.variants.nodes[0].availableForSale=false;
 assert.equal(productSchema(unavailable)['@graph'].find(node=>node['@type']==='Product').offers.availability,'https://schema.org/OutOfStock');
});
test('JSON-LD escapes script-closing strings without corrupting the data',()=>{
 const data={name:'</script><script>alert(1)</script>\u2028text'};const serialized=serializeJsonLd(data);
 assert.ok(!serialized.includes('<'));assert.ok(!serialized.includes('\u2028'));assert.deepEqual(JSON.parse(serialized),data);
});
