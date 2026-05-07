import { Donor } from "@/types/donor";
import { format } from "date-fns";

const REACTION = (val: boolean | null | undefined) =>
  val === true ? "Reactive" : val === false ? "Non-Reactive" : "—";

export function downloadTestReport(donor: Donor) {
  const testedOn = donor.tested_at
    ? format(new Date(donor.tested_at), "dd MMMM yyyy")
    : donor.donation_time
    ? format(new Date(donor.donation_time), "dd MMMM yyyy")
    : format(new Date(donor.created_at || ""), "dd MMMM yyyy");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Test Report — ${donor.full_name}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; background: #fff; padding: 40px; color: #111; }
    .header { text-align: center; border-bottom: 2px solid #c00; padding-bottom: 20px; margin-bottom: 28px; }
    .header h1 { font-size: 22px; color: #c00; letter-spacing: 1px; }
    .header p { font-size: 12px; color: #888; margin-top: 4px; letter-spacing: 2px; text-transform: uppercase; }
    .section-title { font-size: 11px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; color: #888; margin-bottom: 12px; }
    .info-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 28px; }
    .info-item label { font-size: 10px; color: #aaa; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 3px; }
    .info-item span { font-size: 14px; font-weight: 600; color: #111; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 28px; }
    thead tr { background: #f5f5f5; }
    th { text-align: left; padding: 10px 14px; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #666; font-weight: 700; }
    td { padding: 12px 14px; font-size: 13px; border-bottom: 1px solid #eee; }
    .reactive { color: #c00; font-weight: 700; }
    .non-reactive { color: #15803d; font-weight: 700; }
    .na { color: #aaa; }
    .badge { display: inline-block; padding: 3px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; }
    .badge-method { background: #eff6ff; color: #1d4ed8; }
    .footer { margin-top: 48px; display: flex; justify-content: space-between; }
    .sig-line { width: 180px; border-top: 1px solid #333; padding-top: 8px; font-size: 10px; color: #888; letter-spacing: 2px; text-transform: uppercase; text-align: center; }
    @media print { body { padding: 24px; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>🩸 Apna Blood Centre</h1>
    <p>Blood Screening Test Report</p>
  </div>

  <div class="section-title">Donor Information</div>
  <div class="info-grid">
    <div class="info-item"><label>Donor Name</label><span>${donor.full_name}</span></div>
    <div class="info-item"><label>Father's Name</label><span>${donor.father_name || "—"}</span></div>
    <div class="info-item"><label>Donor Code</label><span>${donor.donor_code}</span></div>
    <div class="info-item"><label>Blood Group</label><span>${donor.blood_group}</span></div>
    <div class="info-item"><label>Unit No.</label><span>${donor.unit_no || "—"}</span></div>
    <div class="info-item"><label>Segment / Lot No.</label><span>${donor.segment_no || "—"}</span></div>
    <div class="info-item"><label>Donation Type</label><span>${donor.type_of_donation || "—"}</span></div>
    <div class="info-item"><label>Tested On</label><span>${testedOn}</span></div>
    <div class="info-item"><label>Test Method</label><span>${
      donor.test_method
        ? `<span class="badge badge-method">${donor.test_method}</span>`
        : "—"
    }</span></div>
  </div>

  <div class="section-title">Screening Results</div>
  <table>
    <thead>
      <tr>
        <th>Test</th>
        <th>Result</th>
      </tr>
    </thead>
    <tbody>
      ${[
        ["HIV (Human Immunodeficiency Virus)", donor.test_hiv],
        ["Hepatitis B (HBsAg)", donor.test_hbsag],
        ["Hepatitis C (HCV)", donor.test_hcv],
        ["Syphilis (VDRL)", donor.test_vdrl],
        ["Malaria", donor.test_malaria],
      ]
        .map(
          ([label, val]) => `
        <tr>
          <td>${label}</td>
          <td class="${val === true ? "reactive" : val === false ? "non-reactive" : "na"}">${REACTION(val as boolean | null)}</td>
        </tr>`
        )
        .join("")}
    </tbody>
  </table>

  <div class="footer">
    <div class="sig-line">Lab Technician</div>
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
