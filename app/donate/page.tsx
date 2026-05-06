"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  donorFullSchema,
  type DonorFormValues,
  STEP_FIELDS
} from "@/lib/validation";
import { createDonorAction } from "@/app/actions";
import {
  Field,
  Input,
  Toggle,
  BloodGroupPicker,
  GenderPicker,
  StepIndicator
} from "@/components/Formelements";
import { SignaturePad } from "@/components/SignaturePad";
import { INDIAN_STATES } from "@/types/donor";

const TOTAL_STEPS = 3;
const STEP_LABELS = ["Personal Info", "Donation Details", "Contact & Sign"];

export default function DonatePage() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isNavigating, setIsNavigating] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    trigger,
    watch,
    setValue,
    clearErrors,
    formState: { errors }
  } = useForm<DonorFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(donorFullSchema) as any,
    defaultValues: {
      first_name: "",
      last_name: "",
      father_name: "",
      dob: undefined,
      gender: undefined,
      blood_group: "",
      date_of_wedding: undefined,
      occupation: "",
      total_donations: 0,
      total_apheresis_donations: 0,
      vein_suitable_for_sdp: false,
      if_donated: false,
      previous_donation_date: undefined,
      phone: "",
      whatsapp_no: "",
      email: "",
      area: "",
      city: "",
      state: "",
      pincode: "",
      signature: "",
    },
    mode: "onSubmit",
    reValidateMode: "onChange"
  });

  // Auto-calculate age from DOB
  const dobValue = watch("dob");
  useEffect(() => {
    if (!dobValue) return;
    const birth = new Date(dobValue);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    if (age >= 0 && age <= 120) setValue("age", age, { shouldValidate: false });
  }, [dobValue, setValue]);

  const ifDonated = watch("if_donated");

  const handleNext = async () => {
    if (isNavigating) return;
    setIsNavigating(true);
    const isValid = await trigger(STEP_FIELDS[step]);
    if (isValid) {
      const next = Math.min(step + 1, TOTAL_STEPS);
      clearErrors(STEP_FIELDS[next] as any);
      setStep(next);
      window.scrollTo(0, 0);
    }
    setIsNavigating(false);
  };
  const handleBack = () => { setStep(s => Math.max(s - 1, 1)); window.scrollTo(0, 0); };

  const onSubmit = async (data: DonorFormValues) => {
    setIsSubmitting(true);
    setSubmitError("");
    try {
      const { first_name, last_name, ...rest } = data;  // ← this defines `rest`
      const payload = {
        ...rest,
        full_name: `${first_name.trim()} ${last_name.trim()}`,
        address: [data.area, data.city, data.state].filter(Boolean).join(", "),
        whatsapp_no: data.whatsapp_no || null,
        email: data.email || null,
        date_of_wedding: data.date_of_wedding || null,
        previous_donation_date: data.previous_donation_date || null,
      };
      const res = await createDonorAction(payload as any);
      if (res.success) setSubmitSuccess(true);
      else setSubmitError(res.error || "Failed to submit.");
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : "An error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onError = (formErrors: Record<string, unknown>) => {
    for (let i = 1; i <= TOTAL_STEPS; i++) {
      if (STEP_FIELDS[i].some(f => formErrors[f])) {
        setStep(i);
        setSubmitError("Please fill all required fields correctly.");
        break;
      }
    }
  };

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#111] rounded-3xl p-8 text-center shadow-xl">
          <div className="w-20 h-20 bg-white text-black rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">✓</div>
          <h2 className="text-2xl font-bold text-white mb-2">Thank You!</h2>
          <p className="text-white/60 mb-8">Your form has been submitted successfully. Please wait for verification and acceptance from our staff.</p>
          <button onClick={() => window.location.reload()} className="w-full bg-white text-black font-semibold py-3 rounded-xl hover:bg-gray-200 transition-colors">
            Submit Another Response
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white py-12 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-white mb-2">Blood Donation Form</h1>
          <p className="text-white/60">Complete all steps to register as a donor.</p>
        </div>

        <div className="bg-[#111] text-white rounded-3xl p-6 sm:p-10 shadow-xl">
          <div className="mb-10">
            <StepIndicator current={step} total={TOTAL_STEPS} labels={STEP_LABELS} />
          </div>

          <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-6">

            {/* STEP 1 — Personal Info */}
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Field label="First Name" required error={errors.first_name}>
                    <Input {...register("first_name")} placeholder="e.g. John" error={!!errors.first_name} />
                  </Field>
                  <Field label="Last Name" required error={errors.last_name}>
                    <Input {...register("last_name")} placeholder="e.g. Doe" error={!!errors.last_name} />
                  </Field>
                </div>

                <Field label="Father's Name" required error={errors.father_name}>
                  <Input {...register("father_name")} placeholder="e.g. Richard Doe" error={!!errors.father_name} />
                </Field>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Field label="Date of Birth" required error={errors.dob}>
                    <Input {...register("dob")} type="date" error={!!errors.dob} />
                  </Field>
                  <Field label="Age (years)" required error={errors.age} hint="Auto-filled from DOB">
                    <Input {...register("age", { valueAsNumber: true })} type="number" placeholder="Auto-calculated" error={!!errors.age} />
                  </Field>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Field label="Gender" required error={errors.gender}>
                    <Controller name="gender" control={control} render={({ field }) => (
                      <GenderPicker value={field.value} onChange={field.onChange} error={!!errors.gender} />
                    )} />
                  </Field>
                  <Field label="Date of Wedding" error={errors.date_of_wedding}>
                    <Input {...register("date_of_wedding")} type="date" error={!!errors.date_of_wedding} />
                  </Field>
                </div>

                <Field label="Blood Group" required error={errors.blood_group}>
                  <Controller name="blood_group" control={control} render={({ field }) => (
                    <BloodGroupPicker value={field.value} onChange={field.onChange} error={!!errors.blood_group} />
                  )} />
                </Field>

              </div>
            )}

            {/* STEP 2 — Donation Details */}
            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

                <Field label="Occupation" required error={errors.occupation}>
                  <Input {...register("occupation")} placeholder="e.g. Engineer" error={!!errors.occupation} />
                </Field>

                <div className="bg-[#1a1a1a] rounded-2xl p-5">
                  <Controller name="if_donated" control={control} render={({ field }) => (
                    <Toggle
                      label="Have you donated blood before?"
                      description="Select Yes if you have previously donated blood"
                      checked={!!field.value}
                      onChange={field.onChange}
                    />
                  )} />
                </div>

                {ifDonated && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <Field label="Previous Donation Date" error={errors.previous_donation_date}>
                      <Input {...register("previous_donation_date")} type="date" error={!!errors.previous_donation_date} />
                    </Field>
                    <Field label="Total No. of Donations" error={errors.total_donations}>
                      <Input {...register("total_donations", { valueAsNumber: true })} type="number" min="1" error={!!errors.total_donations} />
                    </Field>
                  </div>
                )}

                {!ifDonated && (
                  <Field label="Total No. of Donations" error={errors.total_donations}>
                    <Input {...register("total_donations", { valueAsNumber: true })} type="number" min="0" defaultValue={0} error={!!errors.total_donations} />
                  </Field>
                )}

                <Field label="Total Apheresis Donations" error={errors.total_apheresis_donations}>
                  <Input {...register("total_apheresis_donations", { valueAsNumber: true })} type="number" min="0" error={!!errors.total_apheresis_donations} />
                </Field>

                <div className="bg-[#1a1a1a] rounded-2xl p-5">
                  <Controller name="vein_suitable_for_sdp" control={control} render={({ field }) => (
                    <Toggle
                      label="Is vein suitable for SDP (Apheresis)?"
                      description="Self-assess before the donation — staff will confirm on arrival"
                      checked={!!field.value}
                      onChange={field.onChange}
                    />
                  )} />
                </div>

              </div>
            )}

            {/* STEP 3 — Contact & Sign */}
            {step === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Field label="Mobile No." required error={errors.phone}>
                    <Input {...register("phone")} placeholder="10-digit number" type="tel" error={!!errors.phone} />
                  </Field>
                  <Field label="WhatsApp No." error={errors.whatsapp_no}>
                    <Input {...register("whatsapp_no")} placeholder="10-digit number (optional)" type="tel" error={!!errors.whatsapp_no} />
                  </Field>
                </div>

                <Field label="Email Address" error={errors.email}>
                  <Input {...register("email")} placeholder="Optional" type="email" error={!!errors.email} />
                </Field>

                <Field label="Area / Locality" required error={errors.area}>
                  <Input {...register("area")} placeholder="e.g. Andheri West" error={!!errors.area} />
                </Field>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Field label="City" required error={errors.city}>
                    <Input {...register("city")} placeholder="e.g. Mumbai" error={!!errors.city} />
                  </Field>
                  <Field label="State" required error={errors.state}>
                    <select
                      {...register("state")}
                      className={`w-full bg-[#222] text-white rounded-xl border px-4 py-3 text-sm outline-none transition-colors appearance-none
                        ${errors.state ? "border-red-500" : "border-white/10 focus:border-white/40"}`}
                    >
                      <option value="">Select state</option>
                      {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    {errors.state && <p className="text-xs text-red-400 mt-1">{errors.state.message}</p>}
                  </Field>
                </div>

                <Field label="Pin Code" required error={errors.pincode}>
                  <Input {...register("pincode")} placeholder="6-digit pincode" type="number" error={!!errors.pincode} />
                </Field>

                <Field label="Signature" required error={errors.signature} hint="Draw your signature using mouse or finger">
                  <Controller name="signature" control={control} render={({ field }) => (
                    <SignaturePad value={field.value || ""} onChange={field.onChange} error={!!errors.signature} />
                  )} />
                  {errors.signature && <p className="text-xs text-red-400 mt-1">Signature is required — please draw your signature above</p>}
                </Field>

                {submitError && (
                  <div className="bg-[#222] text-white p-4 rounded-xl text-sm">{submitError}</div>
                )}

              </div>
            )}

            <div className="flex gap-4 pt-6 border-t border-white/10 mt-10">
              {step > 1 && (
                <button type="button" onClick={handleBack}
                  className="flex-1 py-3.5 px-4 rounded-xl bg-[#222] text-white font-bold tracking-wide hover:bg-[#333] transition-colors">
                  BACK
                </button>
              )}
              {step < TOTAL_STEPS ? (
                <button type="button" onClick={handleNext}
                  className="flex-2 py-3.5 px-4 rounded-xl bg-white text-black font-bold tracking-wide shadow-lg hover:bg-gray-200 transition-colors">
                  NEXT
                </button>
              ) : (
                <button type="submit" disabled={isSubmitting}
                  className="flex-2 py-3.5 px-4 rounded-xl bg-white text-black font-bold tracking-wide shadow-lg hover:bg-gray-200 transition-colors disabled:opacity-70 disabled:cursor-not-allowed">
                  {isSubmitting ? "SUBMITTING..." : "SUBMIT FORM"}
                </button>
              )}
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
