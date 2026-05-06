import { z } from "zod";
import { BLOOD_GROUPS } from "@/types/donor";

const indianPhone = z
  .string()
  .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number");

export const step1Schema = z.object({
  first_name: z.string().min(1, "First name is required").max(60),
  last_name: z.string().min(1, "Last name is required").max(60),
  father_name: z.string().min(2, "Father's name is required").max(100),
  dob: z.string().min(1, "Date of birth is required"),
  age: z.number().min(18, "Must be at least 18 years old").max(65, "Must be under 65 years old"),
  date_of_wedding: z.string().optional().default(""),
  gender: z.enum(["male", "female", "other"], { message: "Please select gender" }),
  blood_group: z.enum(BLOOD_GROUPS as [string, ...string[]], { message: "Select a blood group" }),
});

export const step2Schema = z.object({
  occupation: z.string().min(2, "Occupation is required").max(100),
  if_donated: z.boolean().optional().default(false),
  previous_donation_date: z.string().optional().default(""),
  total_donations: z.number().min(0, "Invalid number").default(0),
  total_apheresis_donations: z.number().min(0, "Invalid number").default(0),
  vein_suitable_for_sdp: z.boolean().optional().default(false),
});

export const step3Schema = z.object({
  phone: indianPhone,
  whatsapp_no: indianPhone.or(z.literal("")).optional().default(""),
  email: z.union([z.string().email("Invalid email"), z.literal("")]).optional().default(""),
  area: z.string().min(1, "Area / locality is required").max(100),
  city: z.string().min(1, "City is required").max(100),
  state: z.string().min(1, "State is required").max(100),
  pincode: z.string().regex(/^\d{6}$/, "Enter a valid 6-digit pincode"),
  signature: z.string().min(1, "Signature is required"),
});

export const donorFullSchema = step1Schema.merge(step2Schema).merge(step3Schema);

export type DonorFormValues = z.infer<typeof donorFullSchema>;

export const STEP_FIELDS: Record<number, (keyof DonorFormValues)[]> = {
  1: ["first_name", "last_name", "father_name", "dob", "age", "date_of_wedding", "gender", "blood_group"],
  2: ["occupation", "if_donated", "previous_donation_date", "total_donations", "total_apheresis_donations", "vein_suitable_for_sdp"],
  3: ["phone", "whatsapp_no", "email", "area", "city", "state", "pincode", "signature"],
};
