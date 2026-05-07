"use client";

import { useMemo, useState } from "react";
import { X, Printer, Save } from "lucide-react";
import { Field, Input, Select } from "@/components/Formelements";
import type { Receipt, ReceiptCreateInput } from "@/types/receipt";
import { downloadReceipt } from "@/lib/downloadReceipt";

const COMPONENT_OPTIONS = [
  { value: "PRBC", label: "PRBC" },
  { value: "PC", label: "PC" },
  { value: "FFP", label: "FFP" },
  { value: "SDP", label: "SDP" },
  { value: "Whole Blood", label: "Whole Blood" },
  { value: "Other", label: "Other" },
];

function combineDateTimeLocal(date: string, time: string) {
  if (!date || !time) return "";
  const dt = new Date(`${date}T${time}:00`);
  return Number.isNaN(dt.getTime()) ? "" : dt.toISOString();
}

export function ReceiptFormModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (input: ReceiptCreateInput) => Promise<Receipt | null>;
}) {
  const now = useMemo(() => new Date(), []);
  const [receiptNo, setReceiptNo] = useState("");
  const [receiptDate, setReceiptDate] = useState(now.toISOString().slice(0, 10));
  const [receiptTime, setReceiptTime] = useState(now.toTimeString().slice(0, 5));

  const [receiverName, setReceiverName] = useState("");
  const [relationship, setRelationship] = useState("");
  const [patientName, setPatientName] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [hospitalName, setHospitalName] = useState("");
  const [issueNo, setIssueNo] = useState("");
  const [bagId, setBagId] = useState("");
  const [components, setComponents] = useState("PRBC");
  const [unit, setUnit] = useState("01");

  const [processingCharges, setProcessingCharges] = useState("0");
  const [actualCharges, setActualCharges] = useState("");
  const [discountAmount, setDiscountAmount] = useState("0");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const amountPaid = Math.max(
    0,
    (Number(actualCharges) || 0) - (Number(discountAmount) || 0),
  );

  const submit = async (printAfter: boolean) => {
    setError("");

    const dtIso = combineDateTimeLocal(receiptDate, receiptTime);
    if (!receiptNo.trim()) return setError("Receipt No is required.");
    if (!dtIso) return setError("Receipt Date & Time is required.");
    if (!receiverName.trim()) return setError("Receiver Name is required.");
    if (!relationship.trim()) return setError("Relationship with Patient is required.");
    if (!patientName.trim()) return setError("Patient Name is required.");
    if (!bloodGroup.trim()) return setError("Blood Group is required.");
    if (!hospitalName.trim()) return setError("Hospital Name is required.");
    if (!issueNo.trim()) return setError("Issue No is required.");
    if (!bagId.trim()) return setError("Bag ID is required.");
    if (!components.trim()) return setError("Components is required.");
    if (!unit.trim()) return setError("Unit is required.");
    if (!actualCharges.trim()) return setError("Actual Charges is required.");

    const input: ReceiptCreateInput = {
      receipt_no: receiptNo.trim(),
      receipt_datetime: dtIso,
      receiver_name: receiverName.trim(),
      relationship_with_patient: relationship.trim(),
      patient_name: patientName.trim(),
      blood_group: bloodGroup.trim(),
      hospital_name: hospitalName.trim(),
      issue_no: issueNo.trim(),
      bag_id: bagId.trim(),
      components: components.trim(),
      unit: unit.trim(),
      processing_charges: Number(processingCharges) || 0,
      actual_charges: Number(actualCharges) || 0,
      discount_amount: Number(discountAmount) || 0,
    };

    setSaving(true);
    const created = await onCreate(input);
    setSaving(false);

    if (!created) return;
    if (printAfter) downloadReceipt(created);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-[#111] rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-7 py-5 border-b border-white/10">
          <div>
            <h2 className="text-lg font-bold text-white">Create New Receipt</h2>
            <p className="text-sm text-white/40 mt-0.5">Fill details and print both copies.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
            <X className="w-5 h-5 text-white/50" />
          </button>
        </div>

        <div className="px-7 py-6 space-y-6 max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-3 gap-4">
            <Field label="Receipt No" required>
              <Input value={receiptNo} onChange={(e) => setReceiptNo(e.target.value)} placeholder="e.g. 216" />
            </Field>
            <Field label="Receipt Date" required>
              <Input type="date" value={receiptDate} onChange={(e) => setReceiptDate(e.target.value)} />
            </Field>
            <Field label="Receipt Time" required>
              <Input type="time" value={receiptTime} onChange={(e) => setReceiptTime(e.target.value)} />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Receiver Name" required>
              <Input value={receiverName} onChange={(e) => setReceiverName(e.target.value)} placeholder="Mr./Mrs. ..." />
            </Field>
            <Field label="Relationship with Patient" required>
              <Input value={relationship} onChange={(e) => setRelationship(e.target.value)} placeholder="RELATIVE" />
            </Field>
            <Field label="Patient Name" required>
              <Input value={patientName} onChange={(e) => setPatientName(e.target.value)} placeholder="PURNIMA" />
            </Field>
            <Field label="Blood Group" required>
              <Input value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)} placeholder="O Pos" />
            </Field>
            <Field label="Hospital Name" required className="col-span-2">
              <Input value={hospitalName} onChange={(e) => setHospitalName(e.target.value)} placeholder="SHRI NANAK HOSPITAL" />
            </Field>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Field label="Issue No" required>
              <Input value={issueNo} onChange={(e) => setIssueNo(e.target.value)} placeholder="e.g. 858" />
            </Field>
            <Field label="Bag ID" required>
              <Input value={bagId} onChange={(e) => setBagId(e.target.value)} placeholder="e.g. 743" />
            </Field>
            <Field label="Unit" required>
              <Input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="01" />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Components" required>
              <Select
                value={components}
                onChange={(e) => setComponents(e.target.value)}
                options={COMPONENT_OPTIONS}
              />
            </Field>
            <Field label="Processing Charges">
              <Input
                type="number"
                value={processingCharges}
                onChange={(e) => setProcessingCharges(e.target.value)}
                placeholder="0"
              />
            </Field>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Field label="Actual Charges (₹)" required hint="Enter 0 if free">
              <Input type="number" value={actualCharges} onChange={(e) => setActualCharges(e.target.value)} placeholder="1550" />
            </Field>
            <Field label="Discount Amount (₹)" required hint="Enter 0 if no discount">
              <Input type="number" value={discountAmount} onChange={(e) => setDiscountAmount(e.target.value)} placeholder="0" />
            </Field>
            <Field label="Amount Paid (auto)">
              <Input value={String(amountPaid)} readOnly className="opacity-70" />
            </Field>
          </div>

          {error && <p className="text-sm text-red-400 font-semibold">{error}</p>}
        </div>

        <div className="flex gap-3 px-7 py-5 border-t border-white/10">
          <button
            onClick={() => submit(false)}
            disabled={saving}
            className="flex-1 py-3.5 rounded-xl bg-[#222] hover:bg-[#333] text-white font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" /> {saving ? "Saving…" : "Save"}
          </button>
          <button
            onClick={() => submit(true)}
            disabled={saving}
            className="flex-1 py-3.5 rounded-xl bg-white hover:bg-gray-200 text-black font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Printer className="w-4 h-4" /> {saving ? "Saving…" : "Save & Print"}
          </button>
        </div>
      </div>
    </div>
  );
}

