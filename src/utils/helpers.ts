import { getExchangeRates } from "../core/integrations/exchangeRate/exchangeRate.service";

export function normalizeTagName(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "") // remove special chars
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
}

export async function convertCurrency(
  amount: number,
  from: string,
  to: string,
): Promise<{
  baseAmount: number;
  exchangeRate: number;
}> {
  if (from === to) {
    return { baseAmount: amount, exchangeRate: 1 };
  }

  const rates: { [key: string]: number } = await getExchangeRates(); // gives from usd to other currencies
  const exchangeRate = rates[to] / rates[from];
  const baseAmount = amount * exchangeRate;
  return { baseAmount, exchangeRate };
}
