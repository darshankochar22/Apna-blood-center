"use client";

import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { donorFullSchema, STEP_FIELDS, type DonorFormValues } from "@/lib/validation";
import type { ApiResponse, DonorSubmitResponse } from "@/types/donor";

export type SubmitResult =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: DonorSubmitResponse }
  | { status: "error"; message: string };

export function useDonorForm() {
  const [step, setStep] = useState(1);
  const [result, setResult] = useState<SubmitResult>({ status: "idle" });

  const form = useForm<DonorFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(donorFullSchema) as any,
    mode: "onTouched",
    defaultValues: {
      first_name: "",
      last_name: "",
      father_name: "",
      dob: undefined,
      age: undefined,
      date_of_wedding: undefined,
      gender: undefined,
      blood_group: undefined,
      occupation: "",
      total_donations: 0,
      total_apheresis_donations: 0,
      vein_suitable_for_sdp: false,
      if_donated: false,
      previous_donation_date: undefined,
      phone: undefined,
      whatsapp_no: undefined,
      email: undefined,
      area: "",
      city: "",
      state: "",
      pincode: undefined,
      signature: "",
    },
  });

  const computeAge = useCallback((dob: string): number => {
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  }, []);

  const goNext = useCallback(async () => {
    const fields = STEP_FIELDS[step];
    const valid = await form.trigger(fields as Parameters<typeof form.trigger>[0]);
    if (valid) setStep((s) => Math.min(s + 1, 4));
  }, [form, step]);

  const goBack = useCallback(() => {
    setStep((s) => Math.max(s - 1, 1));
  }, []);

  const handleSubmit = form.handleSubmit(async (values) => {
    setResult({ status: "loading" });
    try {
      const res = await fetch("/api/donor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, source: "qr" }),
      });

      const json: ApiResponse<DonorSubmitResponse> = await res.json();

      if (!res.ok || !json.success) {
        setResult({ status: "error", message: json.error ?? "Submission failed" });
        return;
      }

      setResult({ status: "success", data: json.data! });
    } catch {
      setResult({ status: "error", message: "Network error. Please check connection and retry." });
    }
  });

  const resetForm = useCallback(() => {
    form.reset();
    setStep(1);
    setResult({ status: "idle" });
  }, [form]);

  return {
    form,
    step,
    result,
    goNext,
    goBack,
    handleSubmit,
    resetForm,
    computeAge,
    isLoading: result.status === "loading",
  };
}