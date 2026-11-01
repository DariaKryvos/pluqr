import type { Money } from './types';
export function formatMoney(money: Money, quantity = 1) {
  return new Intl.NumberFormat('nl-NL', {style:'currency',currency:money.currencyCode}).format(Number(money.amount)*quantity);
}
