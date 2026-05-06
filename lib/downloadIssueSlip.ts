import { Donor } from "@/types/donor";
import { IssueFormData } from "@/components/donor/IssueModal";
import { format } from "date-fns";

export function downloadIssueSlip(donor: Donor, formData: IssueFormData) {
  const issuedOn = formData.issued_at
    ? format(new Date(formData.issued_at), "dd MMMM yyyy, hh:mm a")
    : format(new Date(), "dd MMMM yyyy, hh:mm a");

  const donationDate = donor.donation_time
    ? format(new Date(donor.donation_time), "dd MMMM yyyy")
    : "—";

  const bloodGroupLabel: Record<string, string> = {
    "A+": "A Positive",  "A-": "A Negative",
    "B+": "B Positive",  "B-": "B Negative",
    "AB+": "AB Positive","AB-": "AB Negative",
    "O+": "O Positive",  "O-": "O Negative",
  };

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Blood Issue Slip — ${donor.donor_code}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; background: #fff; padding: 40px; color: #111; }
    .header { text-align: center; border-bottom: 2px solid #c00; padding-bottom: 18px; margin-bottom: 24px; }
    .header h1 { font-size: 20px; color: #c00; letter-spacing: 1px; }
    .header p { font-size: 11px; color: #888; letter-spacing: 2px; text-transform: uppercase; margin-top: 4px; }
    .slip-title { font-size: 15px; font-weight: 700; text-align: center; background: #c00; color: #fff; padding: 10px; border-radius: 6px; margin-bottom: 24px; letter-spacing: 2px; text-transform: uppercase; }
    .section { margin-bottom: 22px; }
    .section-label { font-size: 10px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; color: #888; margin-bottom: 10px; padding-bottom: 6px; border-bottom: 1px solid #eee; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
    .field { padding: 10px 14px; background: #f9f9f9; border-radius: 6px; border: 1px solid #eee; }
    .field label { font-size: 10px; color: #aaa; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 3px; }
    .field span { font-size: 14px; font-weight: 600; color: #111; }
    .field.highlight span { color: #c00; font-size: 16px; }
    .note { background: #fffbeb; border: 1px solid #fde68a; border-radius: 6px; padding: 12px 16px; font-size: 12px; color: #92400e; margin-bottom: 24px; }
    .footer { margin-top: 48px; display: flex; justify-content: space-between; }
    .sig-line { width: 160px; border-top: 1px solid #333; padding-top: 8px; font-size: 10px; color: #888; letter-spacing: 2px; text-transform: uppercase; text-align: center; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>🩸 Apna Blood Centre</h1>
    <p>Licensed Blood Bank</p>
  </div>

  <div class="slip-title">Blood Issue Slip</div>

  <!-- Blood Unit Details -->
  <div class="section">
    <div class="section-label">Blood Unit Details</div>
    <div class="grid-3">
      <div class="field highlight">
        <label>Blood Group</label>
        <span>${bloodGroupLabel[donor.blood_group] || donor.blood_group}</span>
      </div>
      <div class="field highlight">
        <label>Unit No.</label>
        <span>${donor.unit_no || "—"}</span>
      </div>
      <div class="field">
        <label>Segment / Lot No.</label>
        <span>${donor.segment_no || "—"}</span>
      </div>
      <div class="field">
        <label>Blood Bag No.</label>
        <span>${donor.blood_bag_no || "—"}</span>
      </div>
      <div class="field">
        <label>Donation Type</label>
        <span>${donor.type_of_donation || "—"}</span>
      </div>
      <div class="field">
        <label>Donation Date</label>
        <span>${donationDate}</span>
      </div>
    </div>
  </div>

  <!-- Donor Details -->
  <div class="section">
    <div class="section-label">Donor Details</div>
    <div class="grid">
      <div class="field">
        <label>Donor Name</label>
        <span>${donor.full_name}</span>
      </div>
      <div class="field">
        <label>Donor Code</label>
        <span>${donor.donor_code}</span>
      </div>
    </div>
  </div>

  <!-- Patient / Recipient Details -->
  <div class="section">
    <div class="section-label">Patient / Recipient Details</div>
    <div class="grid">
      <div class="field">
        <label>Patient Name</label>
        <span>${formData.patient_name || "—"}</span>
      </div>
      <div class="field">
        <label>Patient City</label>
        <span>${formData.patient_city || "—"}</span>
      </div>
      <div class="field">
        <label>Attender Name</label>
        <span>${formData.attender_name || "—"}</span>
      </div>
      <div class="field">
        <label>Attender Contact</label>
        <span>${formData.attender_contact || "—"}</span>
      </div>
      <div class="field">
        <label>Reason for Transfusion</label>
        <span>${formData.transfusion_reason || "—"}</span>
      </div>
      <div class="field">
        <label>Hospital</label>
        <span>${formData.hospital || "—"}</span>
      </div>
    </div>
  </div>

  <!-- Billing -->
  <div class="section">
    <div class="section-label">Billing</div>
    <div class="grid">
      <div class="field">
        <label>Amount Received (Single Unit)</label>
        <span>${formData.amount_received || "—"}</span>
      </div>
      <div class="field">
        <label>Issued On</label>
        <span>${issuedOn}</span>
      </div>
    </div>
  </div>

  <div class="note">
    ⚠️ All screening tests completed. This unit is cleared for issue. Please verify blood group before transfusion.
  </div>

  <div class="footer">
    <div class="sig-line">Issued By</div>
    <div class="sig-line">Attender / Recipient</div>
    <div class="sig-line">Medical Officer</div>
  </div>

  <script>window.onload = () => window.print();</script>
</body>
</html>`;

  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, "_blank");
  if (win) win.focus();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
