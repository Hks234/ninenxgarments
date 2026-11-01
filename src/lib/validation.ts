import { z } from "zod";

export const indianMobile = z
  .string()
  .trim()
  .transform((value) => value.replace(/\s+/g, ""))
  .refine((value) => /^[6-9]\d{9}$/.test(value.replace(/^(\+91|91)/, "").slice(-10)) || /^[6-9]\d{9}$/.test(value), {
    message: "Enter a valid 10-digit Indian mobile number",
  })
  .transform((value) => value.replace(/^(\+91|91)/, "").slice(-10));

export const pinCode = z.string().trim().regex(/^[1-9][0-9]{5}$/, "Enter a valid Indian PIN code");

export const otpSchema = z.string().trim().regex(/^\d{6}$/, "Enter the 6-digit OTP");

export const productInput = z.object({
  name: z.string().trim().min(2).max(120),
  categoryId: z.string().min(1, "Category is required"),
  description: z.string().trim().max(8000).optional().or(z.literal("")),
  priceRupees: z.string().regex(/^\d+(\.\d{1,2})?$/, "Enter a valid price"),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  variants: z
    .array(
      z.object({
        sizeId: z.string(),
        colourId: z.string(),
        stock: z.number().int().min(0),
      }),
    )
    .min(1, "Select at least one size and colour combination"),
});

export const addressInput = z.object({
  fullName: z.string().trim().min(2).max(80),
  mobile: indianMobile,
  houseNumber: z.string().trim().min(1).max(80),
  street: z.string().trim().min(2).max(120),
  city: z.string().trim().min(2).max(80),
  state: z.string().trim().min(2).max(80),
  pinCode,
  landmark: z.string().trim().max(120).optional().or(z.literal("")),
  saveAddress: z.boolean().optional(),
});

export const reviewInput = z.object({
  displayName: z.string().trim().min(2).max(80),
  body: z.string().trim().min(8).max(1000),
  rating: z.number().int().min(1).max(5),
  isApproved: z.boolean().optional(),
  isVisible: z.boolean().optional(),
  displayOrder: z.number().int().optional(),
  reviewDate: z.string().optional(),
});
