"use client";

import { useState } from "react";
import { format } from "date-fns";
import { X, CheckCircle, XCircle, Pencil, Save, Trash2 } from "lucide-react";
import { Donor, DonorStatus, BloodGroup, BLOOD_GROUPS } from "@/types/donor";
import { Field, Input, Toggle, Select } from "@/components/Formelements";
import { StepIcon, ReportToggle, Section, InfoItem, TestResult } from "./ModalHelpers";

const STAGE_LEVEL: Record<DonorStatus, number> = {
  pending:   0,
  verified:  1,
  approved:  2,
  donated:   3,
  issued:    4,
  completed: 5,
  rejected:  99,
};

function DonorInfoSections({ donor }: { donor: Donor }) {
  const level = STAGE_LEVEL[donor.status] ?? 0;
  const isRejected  = donor.status === "rejected";

  const showVerification = level >= 1 || (isRejected && !!donor.type_of_donor);
  const showMedical      = level >= 4 || (isRejected && donor.hemoglobin != null);
  const showDonationRoom = level >= 4 || (isRejected && (!!donor.blood_bag_no || !!donor.segment_no));
  const showLabTests     = level >= 4 || (isRejected && donor.test_hiv != null);
  const showIssueRecord  = level >= 5;

  return (
    <>
      <Section title="Personal Information">
        <InfoItem label="Full Name"     value={donor.full_name} />
        <InfoItem label="Father's Name" value={donor.father_name} />
        <InfoItem label="Date of Birth" value={donor.dob ? format(new Date(donor.dob), "dd MMM yyyy") : "-"} />
        <InfoItem label="Age"           value={donor.age ? `${donor.age} yrs` : "-"} />
        <InfoItem label="Gender"        value={donor.gender} />
        <InfoItem label="Blood Group"   value={donor.blood_group} />
        <InfoItem label="Occupation"    value={donor.occupation} />
        <InfoItem label="Wedding Date"  value={donor.date_of_wedding ? format(new Date(donor.date_of_wedding), "dd MMM yyyy") : "-"} />
      </Section>

      <Section title="Contact & Address">
        <InfoItem label="Mobile No."   value={donor.phone} />
        <InfoItem label="WhatsApp No." value={donor.whatsapp_no || "-"} />
        <InfoItem label="Email"        value={donor.email || "-"} />
        <div className="col-span-2">
          <InfoItem label="Address" value={donor.address ? `${donor.address} – ${donor.pincode}` : "-"} />
        </div>
      </Section>

      <Section title="Donation History">
        <InfoItem label="Total Donations"       value={donor.total_donations ?? 0} />
        <InfoItem label="Apheresis Donations"   value={donor.total_apheresis_donations ?? 0} />
        <InfoItem label="Vein Suitable for SDP" value={donor.vein_suitable_for_sdp == null ? "-" : donor.vein_suitable_for_sdp ? "Yes" : "No"} />
        <InfoItem label="Signature"             value={donor.signature} />
      </Section>

      {showVerification && (
        <Section title="Verification Details">
          <InfoItem label="Donor Type"    value={donor.type_of_donor    || "-"} />
          <InfoItem label="Donation Type" value={donor.type_of_donation || "-"} />
          <InfoItem label="Donation Time" value={donor.donation_time ? format(new Date(donor.donation_time), "dd MMM yyyy, hh:mm a") : "-"} />
        </Section>
      )}

      {showMedical && (
        <Section title="Medical Checkup">
          <InfoItem label="Blood Group (confirmed)" value={donor.blood_group || "-"} />
          <InfoItem label="Hemoglobin (g/dL)"       value={donor.hemoglobin  != null ? `${donor.hemoglobin} g/dL` : "-"} />
          <InfoItem label="Blood Pressure"          value={donor.blood_pressure || "-"} />
          <InfoItem label="Pulse (bpm)"             value={donor.pulse != null ? `${donor.pulse} bpm` : "-"} />
          <InfoItem label="Temperature (°F)"        value={donor.temperature != null ? `${donor.temperature} °F` : "-"} />
          <InfoItem label="Weight (kg)"             value={donor.weight  != null ? `${donor.weight} kg`  : "-"} />
          <InfoItem label="Height (cm)"             value={donor.height  != null ? `${donor.height} cm`  : "-"} />
        </Section>
      )}

      {showDonationRoom && (
        <Section title="Donation Room">
          <InfoItem label="Unit No."      value={donor.unit_no      || "-"} />
          <InfoItem label="Blood Bag No." value={donor.blood_bag_no || "-"} />
          <InfoItem label="Segment No."   value={donor.segment_no   || "-"} />
        </Section>
      )}

      {showLabTests && (
        <Section title="Lab Test Results">
          <InfoItem label="Test Method" value={donor.test_method || "-"} />
          <TestResult label="HIV"                 value={donor.test_hiv} />
          <TestResult label="HBsAg (Hepatitis B)" value={donor.test_hbsag} />
          <TestResult label="HCV (Hepatitis C)"   value={donor.test_hcv} />
          <TestResult label="VDRL (Syphilis)"     value={donor.test_vdrl} />
          <TestResult label="Malaria"             value={donor.test_malaria} />
        </Section>
      )}

      {showIssueRecord && (
        <Section title="Issue Record">
          <InfoItem label="Patient Name"          value={donor.patient_name       || "-"} />
          <InfoItem label="Patient City"          value={donor.patient_city       || "-"} />
          <InfoItem label="Attender Name"         value={donor.attender_name      || "-"} />
          <InfoItem label="Attender Contact"      value={donor.attender_contact   || "-"} />
          <InfoItem label="Reason for Transfusion" value={donor.transfusion_reason || "-"} />
          <InfoItem label="Hospital"              value={donor.hospital           || "-"} />
          <InfoItem label="Amount Received"       value={donor.amount_received    || "-"} />
          <InfoItem label="Issued On"             value={donor.issued_at ? format(new Date(donor.issued_at), "dd MMM yyyy, hh:mm a") : "-"} />
        </Section>
      )}
    </>
  );
}

interface DonorModalProps {
  donor: Donor;
  onClose: () => void;
  onUpdate: (id: string, status: DonorStatus, extra?: Partial<Donor>) => void;
  onDelete: (e: React.MouseEvent, id: string) => void;
}

export function DonorModal({ donor, onClose, onUpdate, onDelete }: DonorModalProps) {
  const [typeOfDonor, setTypeOfDonor] = useState(donor.type_of_donor || "");
  const [typeOfDonation, setTypeOfDonation] = useState(donor.type_of_donation || "");
  const [bp, setBp] = useState(donor.blood_pressure || "");
  const [pulse, setPulse] = useState(String(donor.pulse || ""));
  const [hb, setHb] = useState(String(donor.hemoglobin || ""));
  const [temp, setTemp] = useState(String(donor.temperature || ""));
  const [weight, setWeight] = useState(String(donor.weight || ""));
  const [height, setHeight] = useState(String(donor.height || ""));
  const [checkupBloodGroup, setCheckupBloodGroup] = useState<BloodGroup | "">(donor.blood_group || "");
  const [veinSuitable, setVeinSuitable] = useState(donor.vein_suitable_for_sdp || false);
  const [donationTime, setDonationTime] = useState(donor.donation_time || "");
  const [bloodBagNo, setBloodBagNo] = useState(donor.blood_bag_no || "");
  const [segmentNo, setSegmentNo] = useState(donor.segment_no || "");
  const [testHiv, setTestHiv] = useState(donor.test_hiv || false);
  const [testHbsag, setTestHbsag] = useState(donor.test_hbsag || false);
  const [testHcv, setTestHcv] = useState(donor.test_hcv || false);
  const [testVdrl, setTestVdrl] = useState(donor.test_vdrl || false);
  const [testMalaria, setTestMalaria] = useState(donor.test_malaria || false);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [editData, setEditData] = useState<Partial<Donor>>({
    full_name: donor.full_name,
    father_name: donor.father_name,
    dob: donor.dob,
    age: donor.age,
    gender: donor.gender,
    blood_group: donor.blood_group,
    phone: donor.phone,
    whatsapp_no: donor.whatsapp_no,
    email: donor.email,
    occupation: donor.occupation,
    address: donor.address,
    pincode: donor.pincode,
    total_donations: donor.total_donations,
    total_apheresis_donations: donor.total_apheresis_donations,
    date_of_wedding: donor.date_of_wedding,
    signature: donor.signature,
  });

  const setEdit = (field: keyof Donor, value: string | number) =>
    setEditData(prev => ({ ...prev, [field]: value }));

  const wrap = async (fn: () => Promise<void>) => {
    setSaving(true);
    await fn();
    setSaving(false);
  };

  const handleSaveEdit = () => wrap(async () => {
    await onUpdate(donor.id, donor.status, editData);
    setIsEditing(false);
  });

  const handleVerify = () => wrap(async () => {
    if (!typeOfDonor || !typeOfDonation) {
      alert("Please select Type of Donor and Type of Donation.");
      return;
    }
    await onUpdate(donor.id, "verified", { type_of_donor: typeOfDonor, type_of_donation: typeOfDonation });
  });

  const handleProceed = () => wrap(async () => {
    await onUpdate(donor.id, "donated");
  });

  const handleComplete = () => wrap(async () => {
    await onUpdate(donor.id, "issued", {
      blood_pressure: bp,
      pulse: Number(pulse) || null,
      hemoglobin: Number(hb) || null,
      temperature: Number(temp) || null,
      weight: Number(weight) || null,
      height: Number(height) || null,
      blood_group: checkupBloodGroup as BloodGroup,
      vein_suitable_for_sdp: veinSuitable,
      donation_time: donationTime || donor.created_at,
      blood_bag_no: bloodBagNo || null,
      segment_no: segmentNo || null,
      test_hiv: testHiv,
      test_hbsag: testHbsag,
      test_hcv: testHcv,
      test_vdrl: testVdrl,
      test_malaria: testMalaria,
    });
  });

  const handleReject = () => wrap(async () => {
    if (confirm("Are you sure you want to reject this donor?")) {
      await onUpdate(donor.id, "rejected");
    }
  });

  return (
    <div className="fixed inset-0 z-50 bg-black animate-in fade-in duration-200 overflow-y-auto">
      <div className="w-full max-w-4xl mx-auto min-h-screen flex flex-col py-8 px-4 sm:px-8">

        <div className="py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white text-black rounded-2xl flex items-center justify-center text-xl font-bold">
              {donor.blood_group}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{donor.full_name}</h2>
              <p className="text-sm font-mono text-white/40">{donor.donor_code}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#111] rounded-xl hover:bg-[#1a1a1a] text-white/60 hover:text-white transition-colors text-sm font-semibold"
              >
                <Pencil className="w-4 h-4" /> Edit
              </button>
            ) : (
              <>
                <button
                  onClick={handleSaveEdit}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl hover:bg-gray-200 text-black transition-colors text-sm font-bold disabled:opacity-50"
                >
                  <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#111] rounded-xl hover:bg-[#222] text-white/60 hover:text-white transition-colors text-sm font-semibold"
                >
                  Cancel
                </button>
              </>
            )}
            <button
              onClick={e => { onClose(); onDelete(e, donor.id); }}
              className="p-2.5 bg-[#111] rounded-xl hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-colors"
              title="Move to Bin"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button onClick={onClose} className="p-3 bg-[#111] rounded-xl hover:bg-[#222] text-white/60 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex-1 space-y-12 pb-20 pt-4">

          <div className="flex items-center justify-between relative">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-[#333] -z-10" />
            <StepIcon active={true} label="Form Filled" />
            <StepIcon active={["verified","approved","donated","issued","completed"].includes(donor.status)} label="Verified" />
            <StepIcon active={["approved","donated","issued","completed"].includes(donor.status)} label="Accepted" />
            <StepIcon active={["donated","issued","completed"].includes(donor.status)} label="Donated" />
            <StepIcon active={["issued","completed"].includes(donor.status)} label="Tests OK" />
            <StepIcon active={donor.status === "completed"} label="Issued" />
          </div>

          <div className="space-y-8">
            {isEditing ? (
              <EditForm editData={editData} setEdit={setEdit} />
            ) : (
              <DonorInfoSections donor={donor} />
            )}
          </div>

          {/* Stage Actions */}
          <div className="bg-[#111] p-8 rounded-3xl space-y-6">

            {donor.status === "pending" && (
              <>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Verification Required</h3>
                  <p className="text-sm text-white/50 mb-6">Review the donor&apos;s submitted details physically and verify their identity.</p>
                </div>
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <Field label="Type of Donor">
                    <Select value={typeOfDonor} onChange={e => setTypeOfDonor(e.target.value)}
                      options={[{ value: "Voluntary", label: "Voluntary" }, { value: "Replacement", label: "Replacement" }, { value: "Directed", label: "Directed" }]}
                      placeholder="Select Donor Type" className="bg-[#222] text-white" />
                  </Field>
                  <Field label="Type of Donation">
                    <Select value={typeOfDonation} onChange={e => setTypeOfDonation(e.target.value)}
                      options={[{ value: "Whole Blood", label: "Whole Blood" }, { value: "SDP (Platelets)", label: "SDP (Platelets)" }, { value: "FFP (Plasma)", label: "FFP (Plasma)" }]}
                      placeholder="Select Donation Type" className="bg-[#222] text-white" />
                  </Field>
                </div>
                <div className="flex gap-4">
                  <button onClick={handleReject} disabled={saving} className="flex-1 py-4 bg-[#222] hover:bg-[#333] text-white font-bold rounded-xl transition">Reject</button>
                  <button onClick={handleVerify} disabled={saving} className="flex-2 py-4 bg-white hover:bg-gray-200 text-black font-bold rounded-xl transition shadow-lg shadow-white/10 text-lg">Verify Donor</button>
                </div>
              </>
            )}

            {/* STAGE 2 — Verified: view only, processing done via Process button in table */}
            {donor.status === "verified" && (
              <div className="flex items-center gap-4 bg-[#1a1a1a] border border-white/10 rounded-2xl p-5">
                <CheckCircle className="w-8 h-8 text-green-400 shrink-0" />
                <div>
                  <h3 className="text-base font-semibold text-white">Donor Verified</h3>
                  <p className="text-sm text-white/50 mt-0.5">To evaluate and accept or reject this donor, close this view and use the <strong className="text-white/70">Process</strong> button in the Verified table.</p>
                </div>
              </div>
            )}

            {/* STAGE 3 — Accepted: intermediate confirmation, no form */}
            {donor.status === "approved" && (
              <>
                <div className="flex items-center gap-4 bg-[#1a1a1a] border border-white/10 rounded-2xl p-5">
                  <CheckCircle className="w-8 h-8 text-blue-400 shrink-0" />
                  <div>
                    <h3 className="text-base font-semibold text-white">Donor Accepted</h3>
                    <p className="text-sm text-white/50 mt-0.5">Donor has been accepted for donation. Proceed to the donation room to complete medical checkup and collect the blood unit.</p>
                  </div>
                </div>
                <div className="flex gap-4 pt-2">
                  <button onClick={handleReject} disabled={saving} className="flex-1 py-4 bg-[#222] hover:bg-[#333] text-white font-bold rounded-xl transition">Reject</button>
                </div>
              </>
            )}

            {/* STAGE 4 — Donated: medical checkup + blood bag + lab tests */}
            {donor.status === "donated" && (
              <>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Donation Room</h3>
                  <p className="text-sm text-white/50 mb-6">Complete the medical checkup, fill blood bag details, and enter rapid test results.</p>
                </div>

                <p className="text-[11px] font-bold uppercase tracking-widest text-white/30 mb-3">Medical Checkup</p>
                <div className="grid grid-cols-2 gap-6">
                  <Field label="HB (Hemoglobin) (g/dL)"><Input value={hb} onChange={e => setHb(e.target.value)} type="number" step="0.1" placeholder="e.g. 14.5" className="bg-[#222] text-white" /></Field>
                  <Field label="Pulse (bpm)"><Input value={pulse} onChange={e => setPulse(e.target.value)} type="number" placeholder="e.g. 72" className="bg-[#222] text-white" /></Field>
                  <Field label="BP (Blood Pressure)"><Input value={bp} onChange={e => setBp(e.target.value)} placeholder="e.g. 120/80" className="bg-[#222] text-white" /></Field>
                  <Field label="Temperature (°F)"><Input value={temp} onChange={e => setTemp(e.target.value)} type="number" step="0.1" placeholder="e.g. 98.6" className="bg-[#222] text-white" /></Field>
                  <Field label="Weight (kg)"><Input value={weight} onChange={e => setWeight(e.target.value)} type="number" placeholder="e.g. 70" className="bg-[#222] text-white" /></Field>
                  <Field label="Height (cm)"><Input value={height} onChange={e => setHeight(e.target.value)} type="number" placeholder="e.g. 175" className="bg-[#222] text-white" /></Field>
                  <Field label="Blood Group">
                    <Select value={checkupBloodGroup} onChange={e => setCheckupBloodGroup(e.target.value as BloodGroup)}
                      options={BLOOD_GROUPS.map(g => ({ value: g, label: g }))} className="bg-[#222] text-white" />
                  </Field>
                  <Field label="Donation Time">
                    <Input type="datetime-local" value={donationTime} onChange={e => setDonationTime(e.target.value)} className="bg-[#222] text-white" />
                  </Field>
                </div>
                <div className="bg-[#1a1a1a] rounded-2xl p-5 border border-white/10 mt-4">
                  <Toggle label="Vein suitable for SDP?" description="Assess during physical checkup" checked={veinSuitable} onChange={setVeinSuitable} />
                </div>

                <p className="text-[11px] font-bold uppercase tracking-widest text-white/30 mt-8 mb-3">Blood Bag Details</p>
                <div className="grid grid-cols-2 gap-6">
                  <Field label="Blood Bag No."><Input value={bloodBagNo} onChange={e => setBloodBagNo(e.target.value)} placeholder="e.g. BB-2024-001" className="bg-[#222] text-white" /></Field>
                  <Field label="Segment No."><Input value={segmentNo} onChange={e => setSegmentNo(e.target.value)} placeholder="e.g. SEG-001" className="bg-[#222] text-white" /></Field>
                </div>

                <p className="text-[11px] font-bold uppercase tracking-widest text-white/30 mt-8 mb-3">Rapid Test Results</p>
                <div className="space-y-4">
                  <ReportToggle label="HIV" checked={testHiv} onChange={setTestHiv} />
                  <ReportToggle label="HBsAg (Hepatitis B)" checked={testHbsag} onChange={setTestHbsag} />
                  <ReportToggle label="HCV (Hepatitis C)" checked={testHcv} onChange={setTestHcv} />
                  <ReportToggle label="VDRL (Syphilis)" checked={testVdrl} onChange={setTestVdrl} />
                  <ReportToggle label="Malaria" checked={testMalaria} onChange={setTestMalaria} />
                </div>

                <div className="flex gap-4 pt-6">
                  <button onClick={handleReject} disabled={saving} className="flex-1 py-4 bg-[#222] hover:bg-[#333] text-white font-bold rounded-xl transition">Reject</button>
                  <button onClick={handleComplete} disabled={saving} className="flex-2 py-4 bg-white hover:bg-gray-200 text-black font-bold rounded-xl transition shadow-lg shadow-white/10 text-lg">Complete &amp; Issue</button>
                </div>
              </>
            )}

            {donor.status === "issued" && (
              <div className="text-center py-6">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 bg-white text-black">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Tests OK — Awaiting Issue</h3>
                <p className="text-white/40">All lab tests passed. Go to Tests OK section and click <strong className="text-white/60">Issue</strong> to complete the record.</p>
              </div>
            )}

            {donor.status === "completed" && (
              <div className="text-center py-6">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 bg-emerald-500/20 text-emerald-400">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Blood Unit Issued ✓</h3>
                <p className="text-white/40">The full donation journey is complete. All records are stored above.</p>
              </div>
            )}

            {donor.status === "rejected" && (
              <div className="text-center py-6">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 bg-[#222] text-white/50">
                  <XCircle className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Donor Rejected</h3>
                <p className="text-white/40">This donor has been rejected.</p>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

// ── Edit Form ────────────────────────────────────────────────────────────────

function EditForm({ editData, setEdit }: { editData: Partial<Donor>; setEdit: (field: keyof Donor, value: string | number) => void }) {
  return (
    <div className="bg-[#111] rounded-2xl p-6 border border-white/10 space-y-6">
      <h4 className="text-[11px] font-bold uppercase tracking-widest text-white/30">Edit Application</h4>
      <div className="grid grid-cols-2 gap-5">
        <Field label="Full Name"><Input value={editData.full_name || ""} onChange={e => setEdit("full_name", e.target.value)} className="bg-[#222] text-white" /></Field>
        <Field label="Father's Name"><Input value={editData.father_name || ""} onChange={e => setEdit("father_name", e.target.value)} className="bg-[#222] text-white" /></Field>
        <Field label="Date of Birth"><Input type="date" value={editData.dob || ""} onChange={e => setEdit("dob", e.target.value)} className="bg-[#222] text-white" /></Field>
        <Field label="Age"><Input type="number" value={editData.age ?? ""} onChange={e => setEdit("age", Number(e.target.value))} className="bg-[#222] text-white" /></Field>
        <Field label="Gender">
          <select value={editData.gender || ""} onChange={e => setEdit("gender", e.target.value)} className="w-full bg-[#222] text-white border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none">
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </Field>
        <Field label="Occupation"><Input value={editData.occupation || ""} onChange={e => setEdit("occupation", e.target.value)} className="bg-[#222] text-white" /></Field>
        <Field label="Phone"><Input value={editData.phone || ""} onChange={e => setEdit("phone", e.target.value)} className="bg-[#222] text-white" /></Field>
        <Field label="WhatsApp No."><Input value={editData.whatsapp_no || ""} onChange={e => setEdit("whatsapp_no", e.target.value)} className="bg-[#222] text-white" /></Field>
        <Field label="Email"><Input type="email" value={editData.email || ""} onChange={e => setEdit("email", e.target.value)} className="bg-[#222] text-white" /></Field>
        <Field label="Wedding Date"><Input type="date" value={editData.date_of_wedding || ""} onChange={e => setEdit("date_of_wedding", e.target.value)} className="bg-[#222] text-white" /></Field>
        <div className="col-span-2">
          <Field label="Address"><Input value={editData.address || ""} onChange={e => setEdit("address", e.target.value)} className="bg-[#222] text-white" /></Field>
        </div>
        <Field label="Pincode"><Input value={editData.pincode || ""} onChange={e => setEdit("pincode", e.target.value)} className="bg-[#222] text-white" /></Field>
        <Field label="Total Donations"><Input type="number" value={editData.total_donations ?? ""} onChange={e => setEdit("total_donations", Number(e.target.value))} className="bg-[#222] text-white" /></Field>
        <Field label="Total Apheresis Donations"><Input type="number" value={editData.total_apheresis_donations ?? ""} onChange={e => setEdit("total_apheresis_donations", Number(e.target.value))} className="bg-[#222] text-white" /></Field>
        <Field label="Signature"><Input value={editData.signature || ""} onChange={e => setEdit("signature", e.target.value)} className="bg-[#222] text-white" /></Field>
      </div>
    </div>
  );
}
