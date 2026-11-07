interface Props { className?: string }
export default function BrandLogo({ className = '' }: Props) {
  return <a className={`brand-logo ${className}`} href="/#experience" aria-label="PLUQR — home"><img src={className.includes('brand-logo-footer')&&!className.includes('brand-logo-inverse')?'/pluqr-logo.svg':'/pluqr-logo-white.svg'} alt="PLUQR" width={1600} height={537}/></a>;
}
