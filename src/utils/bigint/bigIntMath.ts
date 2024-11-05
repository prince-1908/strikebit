export function pow(x: bigint, power: number): bigint {
  if (power == 0)
    return 1n;

  if (power < 0)
    throw new Error("power can't be < 0");

  let result = x;
  for (let i = 1; i < power; i++) {
    result *= x;
  }

  return result;
}

export function divideAsDecimal(x: bigint, y: bigint, precision: number) {
  return Number(x * BigInt(precision) / y) / precision;
}

export function max(...args: bigint[]) {
  return args.reduce((m, e) => e > m ? e : m);
}

export function min(...args: bigint[]) {
  return args.reduce((m, e) => e < m ? e : m);
}