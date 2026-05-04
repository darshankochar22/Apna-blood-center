"use client";

import { useState } from "react";
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
  Select, 
  Textarea, 
  Toggle, 
  BloodGroupPicker, 
  GenderPicker, 
  StepIndicator 
} from "@/components/Formelements";
const TOTAL_STEPS = 3;
const STEP_LABELS = [
  "Personal Info",
  "Medical & Donation",
  "Contact & Address"
];

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
    formState: { errors }
  } = useForm<DonorFormValues>({
    resolver: zodResolver(donorFullSchema) as any,
    defaultValues: {
      total_donations: 0,
      total_apheresis_donations: 0,
      vein_suitable_for_sdp: false,
    },
    mode: "onTouched",
  });

  const handleNext = async () => {
    if (isNavigating) return;
    setIsNavigating(true);
    const fieldsToValidate = STEP_FIELDS[step];
    const isStepValid = await trigger(fieldsToValidate);
    
    if (isStepValid) {
      setStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
      window.scrollTo(0, 0);
    }
    setIsNavigating(false);
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo(0, 0);
  };

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    setSubmitError("");
    
    try {
      const res = await createDonorAction(data);
      if (res.success) {
        setSubmitSuccess(true);
      } else {
        setSubmitError(res.error || "Failed to submit.");
      }
    } catch (err: any) {
      setSubmitError(err.message || "An error occurred while submitting.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onError = (formErrors: any) => {
    for (let i = 1; i <= TOTAL_STEPS; i++) {
      const stepFields = STEP_FIELDS[i];
      if (stepFields.some((field) => formErrors[field])) {
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
          <div className="w-20 h-20 bg-white text-black rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
            ✓
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Thank You!</h2>
          <p className="text-white/60 mb-8">
            Your form has been submitted successfully. Please wait for verification and acceptance from our staff.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full bg-white text-black font-semibold py-3 rounded-xl hover:bg-gray-200 transition-colors"
          >
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
          <p className="text-white/60">Complete the form to register as a donor.</p>
        </div>

        <div className="bg-[#111] text-white rounded-3xl p-6 sm:p-10 shadow-xl">
          <div className="mb-10">
            <StepIndicator current={step} total={TOTAL_STEPS} labels={STEP_LABELS} />
          </div>

          <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-6">
            
            {/* STEP 1: Personal Info */}
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Field label="Full Name" required error={errors.full_name}>
                  <Input {...register("full_name")} placeholder="e.g. John Doe" error={!!errors.full_name} />
                </Field>
                <Field label="Father's Name" required error={errors.father_name}>
                  <Input {...register("father_name")} placeholder="e.g. Richard Doe" error={!!errors.father_name} />
                </Field>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Field label="Date of Birth" required error={errors.dob}>
                    <Input {...register("dob")} type="date" error={!!errors.dob} />
                  </Field>
                  <Field label="Age" required error={errors.age}>
                    <Input {...register("age", { valueAsNumber: true })} type="number" placeholder="Years" error={!!errors.age} />
                  </Field>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Field label="Date of Wedding" error={errors.date_of_wedding}>
                    <Input {...register("date_of_wedding")} type="date" error={!!errors.date_of_wedding} />
                  </Field>
                  <Field label="Occupation" required error={errors.occupation}>
                    <Input {...register("occupation")} placeholder="e.g. Engineer" error={!!errors.occupation} />
                  </Field>
                </div>

                <Field label="Gender" required error={errors.gender}>
                  <Controller
                    name="gender"
                    control={control}
                    render={({ field }) => (
                      <GenderPicker value={field.value} onChange={field.onChange} error={!!errors.gender} />
                    )}
                  />
                </Field>

                <Field label="Blood Group" required error={errors.blood_group}>
                  <Controller
                    name="blood_group"
                    control={control}
                    render={({ field }) => (
                      <BloodGroupPicker value={field.value} onChange={field.onChange} error={!!errors.blood_group} />
                    )}
                  />
                </Field>
              </div>
            )}

            {/* STEP 2: Medical & Donation */}
            {step === 2 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Field label="Total Donations" error={errors.total_donations}>
                    <Input {...register("total_donations", { valueAsNumber: true })} type="number" min="0" error={!!errors.total_donations} />
                  </Field>
                  <Field label="Total Apheresis Donations" error={errors.total_apheresis_donations}>
                    <Input {...register("total_apheresis_donations", { valueAsNumber: true })} type="number" min="0" error={!!errors.total_apheresis_donations} />
                  </Field>
                </div>


              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Field label="Mobile No." required error={errors.phone}>
                    <Input {...register("phone")} placeholder="10-digit number" type="tel" error={!!errors.phone} />
                  </Field>
                  <Field label="WhatsApp No." error={errors.whatsapp_no}>
                    <Input {...register("whatsapp_no")} placeholder="10-digit number" type="tel" error={!!errors.whatsapp_no} />
                  </Field>
                </div>

                <Field label="Email Address" error={errors.email}>
                  <Input {...register("email")} placeholder="Optional" type="email" error={!!errors.email} />
                </Field>

                <Field label="Full Address" required error={errors.address}>
                  <Textarea {...register("address")} placeholder="House No, Building, Street, City, State" error={!!errors.address} />
                </Field>
                
                <Field label="Pin Code" required error={errors.pincode}>
                  <Input {...register("pincode")} placeholder="6-digit pincode" type="number" error={!!errors.pincode} />
                </Field>

                <div className="bg-[#1a1a1a] rounded-2xl p-5 space-y-4">
                  <Field label="Signature" required hint="Type your full name to sign electronically" error={errors.signature}>
                    <Input {...register("signature")} placeholder="Type Full Name" error={!!errors.signature} />
                  </Field>
                </div>

                {submitError && (
                  <div className="bg-[#222] text-white p-4 rounded-xl text-sm">
                    {submitError}
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-4 pt-6 border-t border-white/10 mt-10">
              {step > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 py-3.5 px-4 rounded-xl bg-[#222] text-white font-bold tracking-wide hover:bg-[#333] transition-colors"
                >
                  BACK
                </button>
              )}
              {step < TOTAL_STEPS ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-[2] py-3.5 px-4 rounded-xl bg-white text-black font-bold tracking-wide shadow-lg hover:bg-gray-200 transition-colors"
                >
                  NEXT
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-[2] py-3.5 px-4 rounded-xl bg-white text-black font-bold tracking-wide shadow-lg hover:bg-gray-200 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
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
