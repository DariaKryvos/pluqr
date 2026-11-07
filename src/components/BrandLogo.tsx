interface Props { className?: string }
export default function BrandLogo({ className = '' }: Props) {
  return <a className={`brand-logo ${className}`} href="/#experience" aria-label="PLUQR — home"><img src={className.includes('brand-logo-footer')&&!className.includes('brand-logo-inverse')?'/pluqr-logo-optimized.webp':'/pluqr-logo-white-optimized.webp'} alt="PLUQR" width={1600} height={537}/></a>;
}
