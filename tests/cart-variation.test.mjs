import test from 'node:test';
import assert from 'node:assert/strict';
import {parseAddLines} from '../src/lib/shopify/validation.ts';
test('flavour selections become Shopify line attributes without accepting arbitrary customizations',()=>{
 for(const variation of ['Naturel','Rozijnen','Mix van naturel & rozijnen']){
  const [line]=parseAddLines({lines:[{merchandiseId:'gid://shopify/ProductVariant/123',quantity:2,variation,price:'0.01'}]});
  assert.deepEqual(line,{merchandiseId:'gid://shopify/ProductVariant/123',quantity:2,attributes:[{key:'Variatie',value:variation}]});
 }
 assert.throws(()=>parseAddLines({lines:[{merchandiseId:'gid://shopify/ProductVariant/123',quantity:1,variation:'Something else'}]}));
});

test('cart flavour updates accept only known flavours and preserve quantity',async()=>{
 const {parseUpdateLines}=await import('../src/lib/shopify/validation.ts');
 const id='gid://shopify/CartLine/abc';
 assert.deepEqual(parseUpdateLines({lines:[{id,quantity:2,variation:'Rozijnen'}]}),[{id,quantity:2,attributes:[{key:'Variatie',value:'Rozijnen'}]}]);
 assert.throws(()=>parseUpdateLines({lines:[{id,quantity:2,variation:'Unknown'}]}));
 assert.deepEqual(parseUpdateLines({lines:[{id,quantity:3}]}),[{id,quantity:3}]);
});
