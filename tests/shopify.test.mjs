import assert from 'node:assert/strict';
import { afterEach, beforeEach, test } from 'node:test';
import { getShopifyConfig } from '../src/lib/shopify/config.ts';
import { storefrontQuery } from '../src/lib/shopify/client.ts';
import { ShopifyError } from '../src/lib/shopify/errors.ts';
import { addCartLines, updateCartLines, removeCartLines } from '../src/lib/shopify/cart.ts';
import { parseAddLines, parseUpdateLines, parseRemoveLines, parsePagination } from '../src/lib/shopify/validation.ts';
import { apiResponse, readMutation } from '../src/lib/shopify/http.ts';
const keys = ['SHOPIFY_STORE_DOMAIN','SHOPIFY_STOREFRONT_ACCESS_TOKEN','NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN','SHOPIFY_STOREFRONT_API_VERSION','SHOPIFY_ADMIN_ACCESS_TOKEN'];
const original = Object.fromEntries(keys.map(key=>[key,process.env[key]]));
const originalFetch = globalThis.fetch;
beforeEach(()=>{
 for(const key of keys) delete process.env[key];
 process.env.SHOPIFY_STORE_DOMAIN='pluqr-test.myshopify.com';
 process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN='test-public-storefront-token';
 process.env.SHOPIFY_ADMIN_ACCESS_TOKEN='test-admin-secret';
});
afterEach(()=>{
 globalThis.fetch=originalFetch;
 for(const [key,value] of Object.entries(original)) { if(value===undefined) delete process.env[key]; else process.env[key]=value; }
});
const response = data => new Response(JSON.stringify({data}),{status:200,headers:{'Content-Type':'application/json'}});
const line = {merchandiseId:'gid://shopify/ProductVariant/123',quantity:2};
const id = 'gid://shopify/CartLine/abc-123?cart=test';

test('configuration requires a store and prevents arbitrary credential destinations',()=>{
 assert.equal(getShopifyConfig().endpoint,'https://pluqr-test.myshopify.com/api/2026-10/graphql.json');
 for(const domain of ['', 'evil.example','pluqr.myshopify.com.evil.example','pluqr.myshopify.com@evil.example','pluqr.myshopify.com:443','http://pluqr.myshopify.com']) {
  process.env.SHOPIFY_STORE_DOMAIN=domain;
  assert.throws(getShopifyConfig,error=>error.code==='SHOPIFY_NOT_CONFIGURED'&&error.status===503);
 }
});
test('uses the existing public token fallback, never the Admin token',()=>{
 delete process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
 assert.throws(getShopifyConfig,error=>error.code==='SHOPIFY_NOT_CONFIGURED');
 process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN='existing-public-token';
 assert.equal(getShopifyConfig().token,'existing-public-token');
 process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN='shpat_not-a-storefront-token';
 assert.throws(getShopifyConfig,error=>error.status===503);
});
test('sends GraphQL variables and the correct public Storefront header',async()=>{
 globalThis.fetch=async(url,options)=>{
  assert.equal(url,'https://pluqr-test.myshopify.com/api/2026-10/graphql.json');
  assert.equal(options.headers['X-Shopify-Storefront-Access-Token'],'test-public-storefront-token');
  assert.ok(!JSON.stringify(options).includes('test-admin-secret'));
  assert.equal(options.cache,'no-store');
  assert.equal(options.redirect,'error');
  assert.deepEqual(JSON.parse(options.body).variables,{handle:'party-pack'});
  return response({product:{id:'123'}});
 };
 assert.deepEqual(await storefrontQuery('query Product($handle:String!){product(handle:$handle){id}}',{handle:'party-pack'}),{product:{id:'123'}});
});
test('network, HTTP, invalid JSON and GraphQL errors are sanitized',async()=>{
 for(const mock of [async()=>{throw Error('secret network context');},async()=>new Response('secret',{status:401}),async()=>new Response('invalid json'),async()=>Response.json({errors:[{message:'secret upstream details'}]})]){
  globalThis.fetch=mock;
  await assert.rejects(()=>storefrontQuery('query {shop{name}}'),error=>error instanceof ShopifyError&&!error.message.includes('secret'));
 }
});
test('cart input accepts variant IDs and bounded integers; ignores client prices',()=>{
 assert.deepEqual(parseAddLines({lines:[{...line,price:1,cartId:'untrusted'}]}),[line]);
 for(const quantity of [0,-1,1.5,100,'2',null]) assert.throws(()=>parseAddLines({lines:[{...line,quantity}]}));
 assert.throws(()=>parseAddLines({lines:[{...line,merchandiseId:'gid://shopify/Product/123'}]}));
 assert.throws(()=>parseAddLines({lines:[]}));
 assert.throws(()=>parseAddLines({lines:Array(51).fill(line)}));
 assert.deepEqual(parseUpdateLines({lines:[{id,quantity:0}]}),[{id,quantity:0}]);
 assert.deepEqual(parseRemoveLines({lineIds:[id]}),[id]);
 assert.throws(()=>parseRemoveLines({lineIds:['gid://shopify/Cart/123']}));
});
test('product pagination rejects unbounded or malformed limits',()=>{
 assert.deepEqual(parsePagination(new URL('https://example.test/api')), {first:12,after:null});
 assert.deepEqual(parsePagination(new URL('https://example.test/api?first=5&after=cursor')), {first:5,after:'cursor'});
 for(const limit of ['0','51','1.5','abc']) assert.throws(()=>parsePagination(new URL(`https://example.test/api?first=${limit}`)));
});
test('new carts are created; existing carts use add, update and remove mutations',async()=>{
 const cart={id:'gid://shopify/Cart/test?key=secret',totalQuantity:2};
 const operations=[];
 globalThis.fetch=async(_url,options)=>{
  const body=JSON.parse(options.body);operations.push(body);
  const key=body.query.includes('mutation CartCreate')?'cartCreate':body.query.includes('mutation CartAdd')?'cartLinesAdd':body.query.includes('mutation CartUpdate')?'cartLinesUpdate':'cartLinesRemove';
  return response({[key]:{cart,userErrors:[],warnings:[{code:'MERCHANDISE_NOT_ENOUGH_STOCK',message:'Adjusted',target:id}]}});
 };
 assert.equal((await addCartLines(null,[line])).cart.id,cart.id);
 await addCartLines(cart.id,[line]);
 await updateCartLines(cart.id,[{id,quantity:1}]);
 await removeCartLines(cart.id,[id]);
 assert.deepEqual(operations[0].variables,{lines:[line]});
 assert.equal(operations[1].variables.cartId,cart.id);
 assert.equal(operations[2].variables.lines[0].quantity,1);
 assert.deepEqual(operations[3].variables.lineIds,[id]);
});
test('Shopify cart user errors do not become false success or leak upstream text',async()=>{
 globalThis.fetch=async()=>response({cartCreate:{cart:null,userErrors:[{code:'INVALID',message:'secret upstream text'}],warnings:[]}});
 await assert.rejects(()=>addCartLines(null,[line]),error=>error.status===422&&!error.message.includes('secret'));
});
test('cart mutations reject cross-origin requests and malformed JSON',async()=>{
 const valid=()=>new Request('https://pluqr.test/api/shopify/cart',{method:'POST',headers:{'Content-Type':'application/json','Origin':'https://pluqr.test'},body:JSON.stringify({lines:[line]})});
 assert.deepEqual(await readMutation(valid()),{lines:[line]});
 assert.deepEqual(await readMutation(new Request('http://0.0.0.0:3000/api/shopify/cart',{method:'POST',headers:{Host:'localhost:3000',Origin:'http://localhost:3000','Content-Type':'application/json'},body:JSON.stringify({lines:[line]})})),{lines:[line]});
 await assert.rejects(()=>readMutation(new Request('https://pluqr.test/api/shopify/cart',{method:'POST',headers:{Origin:'https://evil.test','Content-Type':'application/json'},body:'{}'})),error=>error.status===403);
 await assert.rejects(()=>readMutation(new Request('https://pluqr.test/api/shopify/cart',{method:'POST',headers:{'Content-Type':'application/json'},body:'not json'})),error=>error.status===400);
});
test('API errors expose stable codes, not internals, and disable caching',async()=>{
 const result=await apiResponse(async()=>{throw Error('test-admin-secret');});
 assert.equal(result.status,500);
 assert.equal(result.headers.get('cache-control'),'no-store');
 assert.ok(!(await result.text()).includes('test-admin-secret'));
 const missing=await apiResponse(async()=>{throw new ShopifyError('SHOPIFY_NOT_CONFIGURED','Niet gekoppeld.',503);});
 assert.equal(missing.status,503);
});

test('checkout accepts only HTTPS URLs for this store or Shopify checkout',async()=>{
 const {validateCheckoutUrl}=await import('../src/lib/shopify/checkout.ts');
 const primary='https://pluqr.example';
 for(const url of ['https://pluqr-test.myshopify.com/checkouts/test','https://pluqr.example/checkouts/test','https://checkout.shopify.com/test']) assert.equal(validateCheckoutUrl(url,primary),url);
 for(const url of ['http://pluqr.example/checkouts/test','javascript:alert(1)','https://evil.example/checkout','https://pluqr.example.evil.example/checkout','https://user:password@pluqr.example/checkouts/test','https://pluqr.example:8443/checkout']) assert.throws(()=>validateCheckoutUrl(url,primary),error=>error.code==='CHECKOUT_UNAVAILABLE');
});
test('checkout fetches a fresh URL and rejects empty or expired carts',async()=>{
 const {getCheckoutUrl}=await import('../src/lib/shopify/checkout.ts');
 const url='https://pluqr-test.myshopify.com/checkouts/test';
 globalThis.fetch=async(_url,options)=>{
  const body=JSON.parse(options.body);assert.equal(body.variables.id,'cart-session-secret');assert.ok(body.query.includes('checkoutUrl'));assert.equal(options.cache,'no-store');
  return response({cart:{totalQuantity:1,checkoutUrl:url},shop:{primaryDomain:{url:'https://pluqr.example'}}});
 };
 assert.equal(await getCheckoutUrl('cart-session-secret'),url);
 globalThis.fetch=async()=>response({cart:{totalQuantity:0,checkoutUrl:url},shop:{primaryDomain:{url:'https://pluqr.example'}}});
 await assert.rejects(()=>getCheckoutUrl('cart-session-secret'),error=>error.code==='CART_EMPTY'&&error.status===400);
 globalThis.fetch=async()=>response({cart:null,shop:{primaryDomain:{url:'https://pluqr.example'}}});
 await assert.rejects(()=>getCheckoutUrl('cart-session-secret'),error=>error.code==='CART_NOT_FOUND'&&error.status===404);
});
