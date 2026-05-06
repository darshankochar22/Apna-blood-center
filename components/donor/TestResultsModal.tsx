"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Donor } from "@/types/donor";
import { Field, Input } from "@/components/Formelements";

interface TestResultsModalProps {
  donor: Donor;
  onClose: () => void;
  onSubmit: (id: string, data: Partial<Donor>) => Promise<void>;
}

const TEST_METHODS = ["CHEM", "ELISA", "RAPID"] as const;

type ReactiveState = "reactive" | "non-reactive" | null;

function RRToggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: ReactiveState;
  onChange: (v: ReactiveState) => void;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
      <span className="text-sm text-white/70 font-medium w-36">{label}</span>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onChange("reactive")}
          className={`px-4 py-1.5 text-xs font-bold rounded-lg border transition-all ${
            value === "reactive"
              ? "bg-red-500/15 border-red-500 text-red-400"
              : "bg-transparent border-white/10 text-white/30 hover:border-white/20"
          }`}
        >
          Reactive
        </button>
        <button
          type="button"
          onClick={() => onChange("non-reactive")}
          className={`px-4 py-1.5 text-xs font-bold rounded-lg border transition-all ${
            value === "non-reactive"
              ? "bg-green-500/15 border-green-500 text-green-400"
              : "bg-transparent border-white/10 text-white/30 hover:border-white/20"
          }`}
        >
          Non-Reactive
        </button>
      </div>
    </div>
  );
}

export function TestResultsModal({ donor, onClose, onSubmit }: TestResultsModalProps) {
  const [testMethod, setTestMethod] = useState<string>(donor.test_method || "");
  const [hiv, setHiv]         = useState<ReactiveState>(donor.test_hiv == null ? null : donor.test_hiv ? "reactive" : "non-reactive");
  const [hbsag, setHbsag]     = useState<ReactiveState>(donor.test_hbsag == null ? null : donor.test_hbsag ? "reactive" : "non-reactive");
  const [hcv, setHcv]         = useState<ReactiveState>(donor.test_hcv == null ? null : donor.test_hcv ? "reactive" : "non-reactive");
  const [vdrl, setVdrl]       = useState<ReactiveState>(donor.test_vdrl == null ? null : donor.test_vdrl ? "reactive" : "non-reactive");
  const [malaria, setMalaria] = useState<ReactiveState>(donor.test_malaria == null ? null : donor.test_malaria ? "reactive" : "non-reactive");
  const [testDate, setTestDate] = useState("");
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState("");

  const allFilled = hiv && hbsag && hcv && vdrl && malaria && testMethod;

  const handleSubmit = async () => {
    if (!testMethod) { setError("Please select a Test Method."); return; }
    if (!allFilled)  { setError("Please fill in all test results."); return; }
    setError("");
    setSaving(true);
    await onSubmit(donor.id, {
      test_method:   testMethod,
      test_hiv:      hiv      === "reactive",
      test_hbsag:    hbsag    === "reactive",
      test_hcv:      hcv      === "reactive",
      test_vdrl:     vdrl     === "reactive",
      test_malaria:  malaria  === "reactive",
      donation_time: testDate || undefined,
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
            <h2 className="text-lg font-bold text-white">Submit Test Results</h2>
            <p className="text-sm text-white/40 mt-0.5">{donor.full_name} · {donor.donor_code}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
            <X className="w-5 h-5 text-white/50" />
          </button>
        </div>

        {/* Body */}
        <div className="px-7 py-6 space-y-6 max-h-[70vh] overflow-y-auto">

          {/* Test Method */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-white/30 mb-3">Test Method</p>
            <div className="flex gap-3">
              {TEST_METHODS.map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setTestMethod(m)}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-sm border-2 transition-all ${
                    testMethod === m
                      ? "bg-white/10 border-white text-white"
                      : "bg-transparent border-white/10 text-white/40 hover:border-white/25"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* IV Reaction Results */}
          <div className="bg-[#1a1a1a] rounded-2xl px-5 py-2 border border-white/5">
            <p className="text-[11px] font-bold uppercase tracking-widest text-white/30 py-3">IV Reaction Results</p>
            <RRToggle label="HIV"          value={hiv}    onChange={setHiv} />
            <RRToggle label="Hepatitis B"  value={hbsag}  onChange={setHbsag} />
            <RRToggle label="Hepatitis C"  value={hcv}    onChange={setHcv} />
            <RRToggle label="Syphilis (VDRL)" value={vdrl} onChange={setVdrl} />
            <RRToggle label="Malaria"      value={malaria} onChange={setMalaria} />
          </div>

          {/* Custom Date/Time */}
          <Field label="Set Custom Date &amp; Time (optional)">
            <Input
              type="datetime-local"
              value={testDate}
              onChange={e => setTestDate(e.target.value)}
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
            disabled={saving || !allFilled}
            className="flex-2 py-3.5 rounded-xl bg-white hover:bg-gray-200 text-black font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? "Saving…" : "Submit & Issue"}
          </button>
        </div>
      </div>
    </div>
  );
}
