"use client";

import React from "react";
import { type FieldError } from "react-hook-form";

interface FieldProps {
  label: string;
  required?: boolean;
  error?: FieldError;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}

export function Field({ label, required, error, hint, children, className }: FieldProps) {
  return (
    <div className={`flex flex-col gap-1.5 ${className ?? ""}`}>
      <label className="text-[13px] font-semibold text-white/70 tracking-wide uppercase">
        {label}
        {required && <span className="text-white ml-1">*</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="text-[11px] text-white/40">{hint}</p>
      )}
      {error && (
        <p className="text-[12px] text-white flex items-center gap-1 font-medium">
          <span>⚠</span> {error.message}
        </p>
      )}
    </div>
  );
}

// ─── Input ────────────────────────────────────────────────────────────────────

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ error, className, ...props }, ref) => (
    <input
      ref={ref}
      className={`
        w-full px-4 py-3 rounded-xl text-[14px] text-white bg-[#111]
        transition-all duration-150 outline-none
        placeholder:text-white/30
        ${error
          ? "border-2 border-red-500 bg-[#222]" // Usually error shouldn't be white if we want it to be noticeable, but keeping to theme let's make it border-white only on error.
          : "focus:bg-[#222] hover:bg-[#1a1a1a]"
        }
        ${className ?? ""}
      `}
      {...props}
    />
  )
);
Input.displayName = "Input";

// ─── Select ───────────────────────────────────────────────────────────────────

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
  placeholder?: string;
  options: { value: string; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ error, placeholder, options, className, ...props }, ref) => (
    <select
      ref={ref}
      className={`
        w-full px-4 py-3 rounded-xl text-[14px] text-white bg-[#111]
        transition-all duration-150 outline-none appearance-none
        cursor-pointer
        ${error
          ? "border-2 border-white bg-[#222]"
          : "focus:bg-[#222] hover:bg-[#1a1a1a]"
        }
        ${className ?? ""}
      `}
      {...props}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  )
);
Select.displayName = "Select";

// ─── Textarea ─────────────────────────────────────────────────────────────────

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ error, className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={`
        w-full px-4 py-3 rounded-xl text-[14px] text-white bg-[#111]
        transition-all duration-150 outline-none resize-none
        placeholder:text-white/30
        ${error
          ? "border-2 border-white bg-[#222]"
          : "focus:bg-[#222] hover:bg-[#1a1a1a]"
        }
        ${className ?? ""}
      `}
      rows={3}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";

// ─── Toggle Switch ────────────────────────────────────────────────────────────

interface ToggleProps {
  checked: boolean;
  onChange: (val: boolean) => void;
  label: string;
  description?: string;
}

export function Toggle({ checked, onChange, label, description }: ToggleProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-start gap-4 w-full text-left group"
    >
      <div
        className={`
          relative flex-shrink-0 w-12 h-6 rounded-full mt-0.5 transition-all duration-200
          ${checked ? "bg-white" : "bg-[#333]"}
        `}
      >
        <span
          className={`
            absolute top-0.5 left-0.5 w-5 h-5 rounded-full shadow-sm
            transition-all duration-200
            ${checked ? "translate-x-6 bg-black" : "translate-x-0 bg-white/50"}
          `}
        />
      </div>
      <div>
        <p className="text-[14px] font-medium text-white">{label}</p>
        {description && (
          <p className="text-[12px] text-white/50 mt-0.5">{description}</p>
        )}
      </div>
    </button>
  );
}

// ─── Blood Group Picker ───────────────────────────────────────────────────────

interface BloodGroupPickerProps {
  value: string;
  onChange: (val: string) => void;
  error?: boolean;
}

const GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export function BloodGroupPicker({ value, onChange, error }: BloodGroupPickerProps) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {GROUPS.map((g) => (
        <button
          key={g}
          type="button"
          onClick={() => onChange(g)}
          className={`
            py-3 rounded-xl text-[15px] font-bold transition-all duration-150
            ${value === g
              ? "bg-white text-black shadow-md shadow-white/10"
              : `bg-[#111] text-white/50 hover:bg-[#222]
                 hover:text-white ${error ? "border-2 border-white" : ""}`
            }
          `}
        >
          {g}
        </button>
      ))}
    </div>
  );
}

// ─── Gender Picker ────────────────────────────────────────────────────────────

interface GenderPickerProps {
  value: string;
  onChange: (val: string) => void;
  error?: boolean;
}

export function GenderPicker({ value, onChange, error }: GenderPickerProps) {
  const options = [
    { value: "male",   label: "Male",   icon: "♂" },
    { value: "female", label: "Female", icon: "♀" },
    { value: "other",  label: "Other",  icon: "⊕" },
  ];

  return (
    <div className="flex gap-3">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`
            flex-1 flex flex-col items-center gap-1 py-3 rounded-xl
            text-[13px] font-semibold transition-all duration-150
            ${value === o.value
              ? "bg-white text-black"
              : `bg-[#111] text-white/50 hover:bg-[#222]
                 ${error ? "border-2 border-white" : ""}`
            }
          `}
        >
          <span className="text-xl">{o.icon}</span>
          {o.label}
        </button>
      ))}
    </div>
  );
}

// ─── Step Indicator ───────────────────────────────────────────────────────────

interface StepIndicatorProps {
  current: number;
  total: number;
  labels: string[];
}

export function StepIndicator({ current, total, labels }: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-0">
      {Array.from({ length: total }, (_, i) => i + 1).map((s) => (
        <React.Fragment key={s}>
          <div className="flex flex-col items-center gap-1.5">
            <div
              className={`
                w-9 h-9 rounded-full flex items-center justify-center
                text-[13px] font-bold transition-all duration-300
                ${s < current
                  ? "bg-white text-black"
                  : s === current
                  ? "bg-[#222] text-white shadow-md shadow-white/10"
                  : "bg-[#111] text-white/30"
                }
              `}
            >
              {s < current ? "✓" : s}
            </div>
            <span
              className={`text-[10px] font-semibold hidden sm:block tracking-wide ${
                s === current ? "text-white" : "text-white/30"
              }`}
            >
              {labels[s - 1]}
            </span>
          </div>
          {s < total && (
            <div
              className={`
                flex-1 h-0.5 mx-2 mb-5 sm:mb-0 transition-all duration-300
                ${s < current ? "bg-white" : "bg-white/20"}
              `}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}