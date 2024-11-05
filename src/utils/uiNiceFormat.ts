export function uiIntNumberNiceFormat(value: bigint | number | string) {
  if (typeof value === "string") {
    value = BigInt(value);
  }

  if (typeof value === "bigint") {
    return value.toLocaleString('en-US');
  } else {
    return value.toLocaleString('en-US', {maximumFractionDigits: 0});
  }
}

export function uiFloatNumberNiceFormat(value: number | string, maximumFractionDigits: number = 4) {
  if (typeof value === "string") {
    value = parseFloat(value);
  }

  return value.toLocaleString('en-US', {maximumFractionDigits: maximumFractionDigits});
}

export function uiPercentageNumberNiceFormat(value: number, fractionDigits: number = 2) {
  if (!Number.isFinite(value)) {
    value = 1.0;
  }

  return value.toLocaleString('en-US', {style: 'percent', maximumFractionDigits: fractionDigits});
}

export function uiDateNiceFormat(value: Date | string, locale: Intl.LocalesArgument | undefined, utc?: boolean) {
  if (typeof value === 'string') {
    value = new Date(Date.parse(value as string));
  }

  let result = value.toLocaleString(
    locale,
    {
      timeZone: utc === true ? 'UTC' : undefined
    });

  if (utc === true) {
    result = `${result} UTC`;
  }

  return result;
}