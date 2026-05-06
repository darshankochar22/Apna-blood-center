"use client";

import { useState } from "react";
import { X, CheckCircle, XCircle } from "lucide-react";
import { Donor } from "@/types/donor";
import { Field, Input, Toggle } from "@/components/Formelements";

interface AcceptedProcessModalProps {
  donor: Donor;
  onClose: () => void;
  onSubmit: (id: string, data: Partial<Donor>) => Promise<void>;
}

export function AcceptedProcessModal({ donor, onClose, onSubmit }: AcceptedProcessModalProps) {
  const [isCompleted, setIsCompleted] = useState<boolean | null>(null);
  const [unitNo, setUnitNo]           = useState(donor.unit_no        || "");
  const [bloodBagNo, setBloodBagNo]   = useState(donor.blood_bag_no   || "");
  const [segmentNo, setSegmentNo]     = useState(donor.segment_no     || "");
  const [veinSuitable, setVeinSuitable] = useState(donor.vein_suitable_for_sdp || false);
  const [donationTime, setDonationTime] = useState(
    donor.donation_time ? donor.donation_time.slice(0, 16) : ""
  );
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState("");

  const handleSubmit = async () => {
    if (isCompleted === null) { setError("Please confirm if donation is completed."); return; }
    if (!isCompleted)         { setError("Donation must be marked as completed to proceed."); return; }
    setError("");
    setSaving(true);
    await onSubmit(donor.id, {
      unit_no:              unitNo        || null,
      blood_bag_no:         bloodBagNo    || null,
      segment_no:           segmentNo     || null,
      vein_suitable_for_sdp: veinSuitable,
      donation_time:        donationTime  || null,
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
            <h2 className="text-lg font-bold text-white">Donation Room — Process</h2>
            <p className="text-sm text-white/40 mt-0.5">{donor.full_name} · {donor.donor_code}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
            <X className="w-5 h-5 text-white/50" />
          </button>
        </div>

        {/* Form */}
        <div className="px-7 py-6 space-y-5 max-h-[70vh] overflow-y-auto">

          {/* Is Donation Completed? */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-white/30 mb-3">Is Donation Completed?</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setIsCompleted(true)}
                className={`flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm border-2 transition-all ${
                  isCompleted === true
                    ? "bg-green-500/10 border-green-500 text-green-400"
                    : "bg-transparent border-white/10 text-white/40 hover:border-white/20"
                }`}
              >
                <CheckCircle className="w-4 h-4" /> Yes
              </button>
              <button
                type="button"
                onClick={() => setIsCompleted(false)}
                className={`flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm border-2 transition-all ${
                  isCompleted === false
                    ? "bg-red-500/10 border-red-500 text-red-400"
                    : "bg-transparent border-white/10 text-white/40 hover:border-white/20"
                }`}
              >
                <XCircle className="w-4 h-4" /> No
              </button>
            </div>
          </div>

          <p className="text-[11px] font-bold uppercase tracking-widest text-white/30 pt-1">Bag &amp; Unit Details</p>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Unit No.">
              <Input value={unitNo} onChange={e => setUnitNo(e.target.value)} placeholder="e.g. U-001" className="bg-[#1a1a1a] text-white" />
            </Field>
            <Field label="Blood Bag No.">
              <Input value={bloodBagNo} onChange={e => setBloodBagNo(e.target.value)} placeholder="e.g. BB-2024-001" className="bg-[#1a1a1a] text-white" />
            </Field>
            <div className="col-span-2">
              <Field label="Segment No.">
                <Input value={segmentNo} onChange={e => setSegmentNo(e.target.value)} placeholder="e.g. SEG-001" className="bg-[#1a1a1a] text-white" />
              </Field>
            </div>
          </div>

          <div className="bg-[#1a1a1a] rounded-2xl p-4 border border-white/5">
            <Toggle
              label="Vein suitable for SDP?"
              description="Confirm vein suitability for apheresis donation"
              checked={veinSuitable}
              onChange={setVeinSuitable}
            />
          </div>

          <Field label="Custom Donation Date &amp; Time">
            <Input
              type="datetime-local"
              value={donationTime}
              onChange={e => setDonationTime(e.target.value)}
              className="bg-[#1a1a1a] text-white"
            />
          </Field>

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
            disabled={saving || isCompleted !== true}
            className="flex-2 py-3.5 rounded-xl bg-white hover:bg-gray-200 text-black font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? "Saving…" : "Mark as Donated"}
          </button>
        </div>
      </div>
    </div>
  );
}
