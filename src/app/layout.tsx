import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { absoluteUrl, allowIndexing, site } from '../lib/seo/site';
import '../styles/globals.css';
export const metadata: Metadata = {
  metadataBase:new URL(absoluteUrl()),
  title:{default:site.title,template:'%s | PLUQR'},description:site.description,
  applicationName:site.name,category:'food',creator:site.name,publisher:site.name,
  alternates:{canonical:'/'},
  robots:{index:allowIndexing(),follow:true,googleBot:{index:allowIndexing(),follow:true,'max-image-preview':'large','max-snippet':-1,'max-video-preview':-1}},
  openGraph:{type:'website',locale:'nl_NL',siteName:site.name,url:absoluteUrl(),title:site.title,description:site.description,images:[{url:'/pluqr-social.jpg',width:1200,height:630,alt:'Verse oliebollen van PLUQR'}]},
  twitter:{card:'summary_large_image',title:site.title,description:site.description,images:[{url:'/pluqr-social.jpg',alt:'Verse oliebollen van PLUQR'}]},
  formatDetection:{telephone:false},
};
export const viewport: Viewport = {themeColor:'#092B22'};
export default function RootLayout({children}:{children:ReactNode}) { return <html lang="nl"><body>{children}</body></html>; }
