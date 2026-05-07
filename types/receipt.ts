export type ReceiptComponent =
  | "PRBC"
  | "PC"
  | "FFP"
  | "SDP"
  | "Whole Blood"
  | "Other";

export interface Receipt {
  id: string;

  receipt_no: string;
  receipt_datetime: string; // ISO string

  receiver_name: string;
  relationship_with_patient: string;
  patient_name: string;
  blood_group: string;
  hospital_name: string;

  issue_no: string;
  bag_id: string;
  components: ReceiptComponent | string;
  unit: string;

  processing_charges: number;
  actual_charges: number;
  discount_amount: number;
  amount_paid: number;

  created_at?: string;
}

export type ReceiptCreateInput = Omit<Receipt, "id" | "created_at" | "amount_paid">;

