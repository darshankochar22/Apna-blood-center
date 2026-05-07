"use client";

import { useState } from "react";
import { X, CheckCircle, XCircle } from "lucide-react";
import { Donor, BloodGroup, BLOOD_GROUPS } from "@/types/donor";
import { Field, Input, Select } from "@/components/Formelements";

interface ProcessModalProps {
  donor: Donor;
  onClose: () => void;
  onSubmit: (
    id: string,
    decision: "approved" | "rejected",
    data: Partial<Donor>
  ) => Promise<void>;
}

export function ProcessModal({ donor, onClose, onSubmit }: ProcessModalProps) {
  const [hb, setHb]           = useState("");
  const [pulse, setPulse]     = useState("");
  const [bp, setBp]           = useState("");
  const [temp, setTemp]       = useState("");
  const [weight, setWeight]   = useState("");
  const [height, setHeight]   = useState("");
  const [bg, setBg]           = useState<BloodGroup | "">(donor.blood_group || "");
  const [remark, setRemark]   = useState("");
  const [processedAt, setProcessedAt] = useState(
    donor.processed_at ? donor.processed_at.slice(0, 16) : ""
  );
  const [decision, setDecision] = useState<"approved" | "rejected" | "">("");
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState("");

  const handleSubmit = async () => {
    if (!decision) { setError("Please select Accept or Reject."); return; }
    if (decision === "approved" && !hb) { setError("HB is required to accept."); return; }
    setError("");
    setSaving(true);
    await onSubmit(donor.id, decision, {
      hemoglobin:    Number(hb)     || null,
      pulse:         Number(pulse)  || null,
      blood_pressure: bp            || null,
      temperature:   Number(temp)   || null,
      weight:        Number(weight) || null,
      height:        Number(height) || null,
      blood_group:   (bg as BloodGroup) || donor.blood_group,
      remark:        remark         || null,
      processed_at:  processedAt    || null,
    });
    setSaving(false);
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
            <h2 className="text-lg font-bold text-white">Process Donor</h2>
            <p className="text-sm text-white/40 mt-0.5">{donor.full_name} · {donor.donor_code}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
            <X className="w-5 h-5 text-white/50" />
          </button>
        </div>

        {/* Form */}
        <div className="px-7 py-6 space-y-5 max-h-[70vh] overflow-y-auto">

          <p className="text-[11px] font-bold uppercase tracking-widest text-white/30">Medical Evaluation</p>

          <div className="grid grid-cols-2 gap-4">
            <Field label="HB (Hemoglobin) g/dL">
              <Input value={hb} onChange={e => setHb(e.target.value)} type="number" step="0.1" placeholder="e.g. 14.5" className="bg-[#1a1a1a] text-white" />
            </Field>
            <Field label="Pulse (bpm)">
              <Input value={pulse} onChange={e => setPulse(e.target.value)} type="number" placeholder="e.g. 72" className="bg-[#1a1a1a] text-white" />
            </Field>
            <Field label="BP (Blood Pressure)">
              <Input value={bp} onChange={e => setBp(e.target.value)} placeholder="e.g. 120/80" className="bg-[#1a1a1a] text-white" />
            </Field>
            <Field label="Temperature (°F)">
              <Input value={temp} onChange={e => setTemp(e.target.value)} type="number" step="0.1" placeholder="e.g. 98.6" className="bg-[#1a1a1a] text-white" />
            </Field>
            <Field label="Weight (kg)">
              <Input value={weight} onChange={e => setWeight(e.target.value)} type="number" placeholder="e.g. 70" className="bg-[#1a1a1a] text-white" />
            </Field>
            <Field label="Height (cm)">
              <Input value={height} onChange={e => setHeight(e.target.value)} type="number" placeholder="e.g. 175" className="bg-[#1a1a1a] text-white" />
            </Field>
            <div className="col-span-2">
              <Field label="Blood Group">
                <Select
                  value={bg}
                  onChange={e => setBg(e.target.value as BloodGroup)}
                  options={BLOOD_GROUPS.map(g => ({ value: g, label: g }))}
                  className="bg-[#1a1a1a] text-white"
                />
              </Field>
            </div>
            <div className="col-span-2">
              <Field label="Remark (optional)">
                <Input value={remark} onChange={e => setRemark(e.target.value)} placeholder="Any notes for this evaluation" className="bg-[#1a1a1a] text-white" />
              </Field>
            </div>
            <div className="col-span-2">
              <Field label="Custom Processed Date & Time (optional)">
                <Input
                  type="datetime-local"
                  value={processedAt}
                  onChange={e => setProcessedAt(e.target.value)}
                  className="bg-[#1a1a1a] text-white"
                />
              </Field>
            </div>
          </div>

          {/* Accept / Reject toggle */}
          <p className="text-[11px] font-bold uppercase tracking-widest text-white/30 pt-2">Decision</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setDecision("approved")}
              className={`flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm border-2 transition-all ${
                decision === "approved"
                  ? "bg-green-500/10 border-green-500 text-green-400"
                  : "bg-transparent border-white/10 text-white/40 hover:border-white/20"
              }`}
            >
              <CheckCircle className="w-4 h-4" /> Accept
            </button>
            <button
              type="button"
              onClick={() => setDecision("rejected")}
              className={`flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm border-2 transition-all ${
                decision === "rejected"
                  ? "bg-red-500/10 border-red-500 text-red-400"
                  : "bg-transparent border-white/10 text-white/40 hover:border-white/20"
              }`}
            >
              <XCircle className="w-4 h-4" /> Reject
            </button>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}
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
            disabled={saving || !decision}
            className="flex-2 py-3.5 rounded-xl bg-white hover:bg-gray-200 text-black font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? "Saving…" : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}
