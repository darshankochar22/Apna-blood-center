
export type BloodGroup = "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
export type DonorStatus = "pending" | "verified" | "approved" | "rejected" | "donated" | "issued" | "completed";
export type Gender = "male" | "female" | "other";
export type DoctorSource = "qr" | "direct" | "admin";

export interface DonorFormData {
    full_name: string;
    father_name: string;
    dob: string;
    age: number;
    date_of_wedding: string;
    gender: Gender;

    blood_group: BloodGroup;
    phone: string;
    whatsapp_no: string;
    email: string;
    occupation: string;

    address: string;
    area?: string;
    city?: string;
    state?: string;
    pincode: string;

    if_donated?: boolean | null;
    previous_donation_date?: string | null;
    total_donations: number;
    total_apheresis_donations: number;
    vein_suitable_for_sdp?: boolean | null;

    signature: string;
}

export interface Donor extends DonorFormData{
    id: string;
    donor_code: string;
    full_name: string;
    blood_group: BloodGroup;
    status: DonorStatus;
    created_at?: string;
    deleted_at?: string | null;

    // Remark
    remark?: string | null;

    // Verification
    type_of_donor?: string | null;
    type_of_donation?: string | null;
    verified_at?: string | null;
    processed_at?: string | null;
    donation_time?: string | null;

    // Pre-checkup
    blood_pressure?: string | null;
    pulse?: number | null;
    hemoglobin?: number | null;
    temperature?: number | null;
    weight?: number | null;
    height?: number | null;

    // Donation Room
    unit_no?: string | null;
    blood_bag_no?: string | null;
    segment_no?: string | null;

    // Test Reports
    test_method?: string | null;
    tested_at?: string | null;
    test_hiv?: boolean | null;
    test_hbsag?: boolean | null;
    test_hcv?: boolean | null;
    test_vdrl?: boolean | null;
    test_malaria?: boolean | null;

    // Issue Record
    patient_name?: string | null;
    patient_city?: string | null;
    attender_name?: string | null;
    attender_contact?: string | null;
    transfusion_reason?: string | null;
    amount_received?: string | null;
    hospital?: string | null;
    issued_at?: string | null;
}

export interface ApiResponse<T = unknown> {
    success: boolean;
    data ?:T;
    error ?: string;
    message ?: string;
}

export interface DonorSubmitResponse {
    donor_id: string;
    donor_code: string;
    full_name: string;
    blood_group: BloodGroup;
}

export const BLOOD_GROUPS: BloodGroup[] = [
    "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-",
];

export const GENDER_OPTIONS: {
    value: Gender, label: string
}[] = [
    { value: "male", label:"Male" },
    { value: "female", label:"Female" },
    { value: "other", label:"Other" },
];

export const RELATION_OPTIONS = [
    "Spouse", "Parent", "Sibling", "Child", "Friend", "Relative", 'Other'
];

export const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Jammu & Kashmir", "Ladakh", "Chandigarh", "Puducherry",
];