import React from "react";
import { CheckCircle } from "lucide-react";

export function StepIcon({ active, label }: { active: boolean; label: string }) {
  return (
    <div className="flex flex-col items-center gap-3 bg-black z-10 px-4">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 ${active ? "bg-white text-black" : "bg-[#111] text-white/30"}`}>
        {active ? <CheckCircle className="w-5 h-5" /> : <div className="w-2.5 h-2.5 rounded-full bg-white/30" />}
      </div>
      <span className={`text-[11px] font-bold uppercase tracking-wider ${active ? "text-white" : "text-white/40"}`}>{label}</span>
    </div>
  );
}

export function ReportToggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between p-5 rounded-2xl bg-[#222]">
      <span className="text-sm font-medium text-white">
        {label} Result:{" "}
        <span className={checked ? "text-white" : "text-white/50"}>{checked ? "Positive" : "Negative"}</span>
      </span>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-14 h-7 rounded-full transition-colors ${checked ? "bg-white" : "bg-black"}`}
      >
        <div className={`absolute top-1 left-1 w-5 h-5 rounded-full transition-transform ${checked ? "translate-x-7 bg-black" : "translate-x-0 bg-white/50"}`} />
      </button>
    </div>
  );
}

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#111] rounded-2xl p-6 border border-white/5">
      <h4 className="text-[11px] font-bold uppercase tracking-widest text-white/30 mb-5">{title}</h4>
      <div className="grid grid-cols-2 gap-x-8 gap-y-5">{children}</div>
    </div>
  );
}

export function InfoItem({ label, value }: { label: string; value: string | number | boolean | null | undefined }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wider text-white/40 font-semibold mb-1">{label}</p>
      <p className="text-sm text-white font-medium break-words">
        {value !== null && value !== undefined && value !== "" ? String(value) : "-"}
      </p>
    </div>
  );
}

export function TestResult({ label, value }: { label: string; value: boolean | null | undefined }) {
  const isPending = value === null || value === undefined;
  return (
    <div className="flex items-center justify-between col-span-2 py-2 border-b border-white/5 last:border-0">
      <p className="text-sm text-white/70 font-medium">{label}</p>
      {isPending ? (
        <span className="text-[11px] font-bold uppercase tracking-wider text-white/30 bg-white/5 px-2.5 py-1 rounded-full">
          Pending
        </span>
      ) : (
        <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${value ? "bg-red-500/20 text-red-300 border-red-500/30" : "bg-green-500/20 text-green-300 border-green-500/30"}`}>
          {value ? "Positive" : "Negative"}
        </span>
      )}
    </div>
  );
}
