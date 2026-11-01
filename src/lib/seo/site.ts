export const site = {
  name: 'PLUQR',
  title: 'Glutenvrije & vegan oliebollen | PLUQR',
  description: 'Geniet zonder compromis. Ambachtelijke, glutenvrije en vegan oliebollen, vers gebakken in Amsterdam. Bekijk ons assortiment en check jouw bezorgpostcode.',
  telephone: '+31853015920',
  email: 'info@pluqr.nl',
  street: 'Remmerdenplein 100',
  postcode: '1106 AK',
  city: 'Amsterdam',
  kvk: '80502679',
};
export function siteOrigin() {
  const url = new URL(process.env.SITE_URL || 'https://pluqr.nl');
  if (!['http:','https:'].includes(url.protocol)) throw new Error('SITE_URL must use HTTP or HTTPS');
  return url.origin;
}
export function absoluteUrl(path='/') { return new URL(path,siteOrigin()).toString(); }
export function productPath(handle:string) { return `/producten/${encodeURIComponent(handle)}`; }
export function allowIndexing() { return process.env.NODE_ENV === 'production' && process.env.SITE_INDEXABLE !== 'false'; }
