import { describe, expect, it } from "vitest";
import { addPaise, formatInr, multiplyPaise, rupeesToPaise } from "./money";

describe("money", () => {
  it("converts rupees to paise without floats", () => {
    expect(rupeesToPaise("1299.50")).toBe(129950);
    expect(rupeesToPaise("10")).toBe(1000);
  });

  it("formats INR using Indian grouping", () => {
    expect(formatInr(129950)).toBe("₹1,299.50");
    expect(formatInr(10000000)).toBe("₹1,00,000");
  });

  it("adds and multiplies integer paise", () => {
    expect(addPaise([100, 250])).toBe(350);
    expect(multiplyPaise(49900, 3)).toBe(149700);
  });
});
