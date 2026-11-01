// Add confirmed four-digit Dutch postcode ranges, inclusive. Empty means unconfigured.
export const deliveryPostcodeRanges: ReadonlyArray<readonly [number, number]> = [];
export function checkDelivery(postcode: string): 'invalid' | 'unconfigured' | 'available' | 'unavailable' {
  const normalized = postcode.replace(/\s/g, '').toUpperCase();
  if (!/^[1-9][0-9]{3}[A-Z]{2}$/.test(normalized)) return 'invalid';
  if (!deliveryPostcodeRanges.length) return 'unconfigured';
  const area = Number(normalized.slice(0, 4));
  return deliveryPostcodeRanges.some(([start, end]) => area >= start && area <= end) ? 'available' : 'unavailable';
}
