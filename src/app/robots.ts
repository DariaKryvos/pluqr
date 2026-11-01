import type { MetadataRoute } from 'next';
import { absoluteUrl, allowIndexing } from '../lib/seo/site';
export default function robots():MetadataRoute.Robots {
 return {rules:{userAgent:'*',...(allowIndexing()?{allow:'/',disallow:['/api/']}:{disallow:'/'})},sitemap:absoluteUrl('/sitemap.xml')};
}
