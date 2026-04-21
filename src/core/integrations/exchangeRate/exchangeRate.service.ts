import { ExchangeRateApiResponse } from "./exchangeRate.types";

export async function getExchangeRates() : Promise<{ [key: string]: number;}> {
  const res = await fetch("https://open.er-api.com/v6/latest/USD");
  const data :ExchangeRateApiResponse= await res.json();
  return data.rates;
}
