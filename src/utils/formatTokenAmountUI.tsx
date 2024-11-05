import { uiFloatNumberNiceFormat } from "./uiNiceFormat";
import { calculateFormattedTokenPrice } from "@/utils/bigint/bigIntMathUI";

export const formatTokenAmountUI = (amount: bigint | string, decimals: number) =>
  uiFloatNumberNiceFormat(calculateFormattedTokenPrice(amount, decimals));

