import { divideAsDecimal, pow } from "./bigIntMath";

export function calculateFormattedTokenPrice(price: bigint | string, tokenDecimals: number, precision?: number) {
  return divideAsDecimal(
    BigInt(price),
    pow(10n, tokenDecimals),
    precision ?? 10_000_00
  );
}