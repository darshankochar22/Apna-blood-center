import { z } from "zod";
import { BLOOD_GROUPS } from "@/types/donor";

const indianPhone = z
  .string()
  .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number");

export const step1Schema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters").max(100),
  father_name: z.string().min(2, "Father's name is required").max(100),
  dob: z.string().min(1, "Date of birth is required"),
  age: z.number().min(18, "Must be at least 18 years old").max(65, "Must be under 65 years old"),
  date_of_wedding: z.string().optional().default(""),
  gender: z.enum(["male", "female", "other"], { message: "Please select gender" }),
  blood_group: z.enum(BLOOD_GROUPS as [string, ...string[]], { message: "Select a blood group" }),
  occupation: z.string().min(2, "Occupation is required").max(100),
});

export const step2Schema = z.object({
  total_donations: z.number().min(0, "Invalid number").default(0),
  total_apheresis_donations: z.number().min(0, "Invalid number").default(0),
});

export const step3Schema = z.object({
  phone: indianPhone,
  whatsapp_no: indianPhone.or(z.literal("")),
  email: z.union([z.string().email("Invalid email"), z.literal("")]),
  address: z.string().min(5, "Address is required").max(200),
  pincode: z.string().regex(/^\d{6}$/, "Enter a valid 6-digit pincode"),
  signature: z.string().min(2, "Signature is required"),
});

export const donorFullSchema = step1Schema.merge(step2Schema).merge(step3Schema);

export type DonorFormValues = z.infer<typeof donorFullSchema>;

export const STEP_FIELDS: Record<number, (keyof DonorFormValues)[]> = {
  1: ["full_name", "father_name", "dob", "age", "date_of_wedding", "gender", "blood_group", "occupation"],
  2: ["total_donations", "total_apheresis_donations"],
  3: ["phone", "whatsapp_no", "email", "address", "pincode", "signature"],
};