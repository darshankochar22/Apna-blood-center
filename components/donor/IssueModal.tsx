"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Donor } from "@/types/donor";
import { Field, Input } from "@/components/Formelements";

export interface IssueFormData {
  patient_name: string;
  patient_city: string;
  attender_name: string;
  attender_contact: string;
  transfusion_reason: string;
  amount_received: string;
  hospital: string;
  issued_at: string | null;
}

interface IssueModalProps {
  donor: Donor;
  onClose: () => void;
  onSubmit: (id: string, data: Partial<Donor>, formData: IssueFormData) => Promise<void>;
}

export function IssueModal({ donor, onClose, onSubmit }: IssueModalProps) {
  const [patientName, setPatientName]         = useState(donor.patient_name        || "");
  const [patientCity, setPatientCity]         = useState(donor.patient_city        || "");
  const [attenderName, setAttenderName]       = useState(donor.attender_name       || "");
  const [attenderContact, setAttenderContact] = useState(donor.attender_contact    || "");
  const [reason, setReason]                   = useState(donor.transfusion_reason  || "");
  const [amount, setAmount]                   = useState(donor.amount_received     || "");
  const [hospital, setHospital]               = useState(donor.hospital            || "");
  const [useCustomTime, setUseCustomTime]     = useState(false);
  const [issuedAt, setIssuedAt]               = useState(
    donor.issued_at ? donor.issued_at.slice(0, 16) : ""
  );
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!patientName.trim())  e.patientName = "Patient name is required.";
    if (!reason.trim())       e.reason      = "Reason for transfusion is required.";
    if (!amount.trim())       e.amount      = "Amount received is required.";
    if (!hospital.trim())     e.hospital    = "Hospital is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    const finalIssuedAt = useCustomTime && issuedAt ? issuedAt : null;
    const formData: IssueFormData = {
      patient_name:       patientName,
      patient_city:       patientCity,
      attender_name:      attenderName,
      attender_contact:   attenderContact,
      transfusion_reason: reason,
      amount_received:    amount,
      hospital,
      issued_at:          finalIssuedAt,
    };
    await onSubmit(donor.id, {
      patient_name:       patientName       || null,
      patient_city:       patientCity       || null,
      attender_name:      attenderName      || null,
      attender_contact:   attenderContact   || null,
      transfusion_reason: reason            || null,
      amount_received:    amount            || null,
      hospital:           hospital          || null,
      issued_at:          finalIssuedAt,
    }, formData);
    setSaving(false);
  };

  const bloodGroupLabel: Record<string, string> = {
    "A+": "A Positive",  "A-": "A Negative",
    "B+": "B Positive",  "B-": "B Negative",
    "AB+": "AB Positive","AB-": "AB Negative",
    "O+": "O Positive",  "O-": "O Negative",
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-[#111] rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-white/10">
          <div>
            <h2 className="text-lg font-bold text-white">Update Issue Record</h2>
            <p className="text-sm text-white/40 mt-0.5">{donor.full_name} · {donor.donor_code}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
            <X className="w-5 h-5 text-white/50" />
          </button>
        </div>

        {/* Donor info strip */}
        <div className="mx-7 mt-5 grid grid-cols-2 gap-3">
          {[
            ["Name",             donor.full_name],
            ["Unit No.",         donor.unit_no        || "—"],
            ["Blood Group",      bloodGroupLabel[donor.blood_group] || donor.blood_group],
            ["Segment / Lot No.",donor.segment_no     || "—"],
          ].map(([label, val]) => (
            <div key={label} className="bg-white/5 rounded-2xl px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1">{label}</p>
              <p className="text-sm font-semibold text-white">{val}</p>
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="px-7 py-5 space-y-4 max-h-[55vh] overflow-y-auto">

          <Field label="Patient Name *" error={errors.patientName}>
            <Input
              value={patientName}
              onChange={e => setPatientName(e.target.value)}
              placeholder="Enter patient name"
              className="bg-[#1a1a1a] text-white"
            />
          </Field>

          <Field label="Patient City (optional)">
            <Input
              value={patientCity}
              onChange={e => setPatientCity(e.target.value)}
              placeholder="e.g. Ahmedabad"
              className="bg-[#1a1a1a] text-white"
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Attender Name">
              <Input
                value={attenderName}
                onChange={e => setAttenderName(e.target.value)}
                placeholder="Name"
                className="bg-[#1a1a1a] text-white"
              />
            </Field>
            <Field label="Attender Contact (optional)">
              <Input
                value={attenderContact}
                onChange={e => setAttenderContact(e.target.value)}
                placeholder="Mobile No."
                className="bg-[#1a1a1a] text-white"
              />
            </Field>
          </div>

          <Field label="Reason for Transfusion *" error={errors.reason}>
            <Input
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="e.g. Surgery, Anaemia, Accident"
              className="bg-[#1a1a1a] text-white"
            />
          </Field>

          <Field label="Amount Received (For Single Unit) *" error={errors.amount}>
            <Input
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="e.g. ₹1500"
              className="bg-[#1a1a1a] text-white"
            />
          </Field>

          <Field label="Hospital *" error={errors.hospital}>
            <Input
              value={hospital}
              onChange={e => setHospital(e.target.value)}
              placeholder="Hospital or clinic name"
              className="bg-[#1a1a1a] text-white"
            />
          </Field>

          {/* Custom Date Time toggle */}
          <div className="bg-[#1a1a1a] rounded-2xl p-4 border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-white/70">Set Custom Date Time?</span>
              <div className="flex gap-2">
                {(["No", "Yes"] as const).map(opt => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setUseCustomTime(opt === "Yes")}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      (opt === "Yes") === useCustomTime
                        ? "bg-white text-black border-white"
                        : "bg-transparent text-white/40 border-white/10 hover:border-white/20"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
            {useCustomTime && (
              <Input
                type="datetime-local"
                value={issuedAt}
                onChange={e => setIssuedAt(e.target.value)}
                className="bg-[#222] text-white w-full"
              />
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-7 py-5 border-t border-white/10">
          <button
            onClick={onClose}
            className="flex-1 py-3.5 rounded-xl bg-[#222] hover:bg-[#333] text-white font-bold transition-colors"
          >
            Close
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 py-3.5 rounded-xl bg-white hover:bg-gray-200 text-black font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? "Saving…" : "Save & Print Issue Slip"}
          </button>
        </div>
      </div>
    </div>
  );
}
