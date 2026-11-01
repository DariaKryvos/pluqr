interface Props { className?: string }
export default function BrandLogo({ className = '' }: Props) {
  return <a className={`brand-logo ${className}`} href="/#experience" aria-label="PLUQR — home"><img src="/pluqr-logo.avif" alt="PLUQR" width={100} height={71}/></a>;
}
