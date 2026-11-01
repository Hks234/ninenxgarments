export function rupeesToPaise(value: number | string): number {
  const n = typeof value === "string" ? value.trim() : String(value);
  if (!/^\d+(\.\d{1,2})?$/.test(n)) {
    throw new Error("Invalid amount");
  }
  const [rupees, paise = ""] = n.split(".");
  return Number(rupees) * 100 + Number(paise.padEnd(2, "0"));
}

export function paiseToRupeeNumber(paise: number): number {
  if (!Number.isInteger(paise)) {
    throw new Error("Paise must be an integer");
  }
  return paise / 100;
}

export function formatInr(paise: number): string {
  if (!Number.isInteger(paise)) {
    throw new Error("Paise must be an integer");
  }
  const negative = paise < 0;
  const abs = Math.abs(paise);
  const rupees = Math.floor(abs / 100);
  const remainder = abs % 100;
  const formatted = new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(rupees);
  const suffix = remainder === 0 ? "" : `.${String(remainder).padStart(2, "0")}`;
  return `${negative ? "-" : ""}₹${formatted}${suffix}`;
}

export function addPaise(values: number[]): number {
  return values.reduce((sum, value) => {
    if (!Number.isInteger(value)) {
      throw new Error("Paise must be an integer");
    }
    return sum + value;
  }, 0);
}

export function multiplyPaise(unitPaise: number, quantity: number): number {
  if (!Number.isInteger(unitPaise) || !Number.isInteger(quantity) || quantity < 0) {
    throw new Error("Invalid money multiplication");
  }
  return unitPaise * quantity;
}
