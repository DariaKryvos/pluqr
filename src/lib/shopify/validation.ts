import { ShopifyError } from './errors.ts';
const invalid = () => new ShopifyError('INVALID_REQUEST', 'Controleer de productkeuze en het aantal.', 400);
function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw invalid();
  return value as Record<string, unknown>;
}
function list(value: unknown): unknown[] {
  if (!Array.isArray(value) || value.length < 1 || value.length > 50) throw invalid();
  return value;
}
function quantity(value: unknown, minimum: number): number {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < minimum || value > 99) throw invalid();
  return value;
}
function lineId(value: unknown): string {
  if (typeof value !== 'string' || value.length > 512 || !/^gid:\/\/shopify\/(CartLine|ComponentizableCartLine)\/[A-Za-z0-9_-]+(?:\?[A-Za-z0-9_=&%-]+)?$/.test(value)) throw invalid();
  return value;
}
export function parseAddLines(body: unknown) {
  return list(object(body).lines).map(value => {
    const item = object(value);
    if (typeof item.merchandiseId !== 'string' || !/^gid:\/\/shopify\/ProductVariant\/\d+$/.test(item.merchandiseId)) throw invalid();
    if(item.variation!==undefined&&!(typeof item.variation==='string'&&['Naturel','Rozijnen','Mix van naturel & rozijnen'].includes(item.variation)))throw invalid();
    return {merchandiseId:item.merchandiseId,quantity:quantity(item.quantity,1),...(item.variation?{attributes:[{key:'Variatie',value:item.variation as string}]}:{})};
  });
}
export function parseUpdateLines(body: unknown) {
  return list(object(body).lines).map(value => {
    const item=object(value);
    if(item.variation!==undefined&&!(typeof item.variation==='string'&&['Naturel','Rozijnen','Mix van naturel & rozijnen'].includes(item.variation)))throw invalid();
    return {id:lineId(item.id),quantity:quantity(item.quantity,0),...(item.variation?{attributes:[{key:'Variatie',value:item.variation as string}]}:{})};
  });
}
export function parseRemoveLines(body: unknown) { return list(object(body).lineIds).map(lineId); }
export function parsePagination(url: URL) {
  const raw = url.searchParams.get('first') ?? '12';
  if (!/^\d+$/.test(raw) || Number(raw) < 1 || Number(raw) > 50) throw new ShopifyError('INVALID_REQUEST', 'Kies tussen 1 en 50 producten per pagina.', 400);
  const after = url.searchParams.get('after');
  if (after && after.length > 1024) throw invalid();
  return {first: Number(raw), after};
}
