import { Donor } from "@/types/donor";
import { format } from "date-fns";

export function downloadCertificate(donor: Donor) {
  const donationDate = donor.donation_time
    ? format(new Date(donor.donation_time), "dd MMMM yyyy")
    : format(new Date(donor.created_at || ""), "dd MMMM yyyy");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Blood Donation Certificate — ${donor.full_name}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,600;1,400&family=Geist:wght@400;600;700&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Geist', sans-serif; background: #fff; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 40px; }
    .cert {
      width: 780px;
      border: 3px solid #c00;
      border-radius: 8px;
      padding: 60px 70px;
      text-align: center;
      position: relative;
    }
    .cert::before {
      content: '';
      position: absolute;
      inset: 8px;
      border: 1px solid #c0000040;
      border-radius: 4px;
      pointer-events: none;
    }
    .logo { font-size: 13px; font-weight: 700; letter-spacing: 4px; color: #c00; text-transform: uppercase; margin-bottom: 4px; }
    .drop { font-size: 40px; line-height: 1; }
    h1 { font-family: 'EB Garamond', serif; font-size: 38px; font-weight: 600; color: #111; margin: 24px 0 8px; letter-spacing: 1px; }
    .subtitle { font-size: 12px; letter-spacing: 5px; color: #888; text-transform: uppercase; margin-bottom: 40px; }
    .body-text { font-family: 'EB Garamond', serif; font-size: 18px; color: #444; line-height: 1.9; }
    .name { font-size: 32px; font-weight: 600; color: #111; border-bottom: 2px solid #c00; display: inline-block; padding: 0 12px 4px; margin: 8px 0 4px; }
    .meta { display: flex; justify-content: center; gap: 60px; margin-top: 44px; }
    .meta-item { text-align: center; }
    .meta-label { font-size: 10px; letter-spacing: 3px; color: #aaa; text-transform: uppercase; margin-bottom: 6px; }
    .meta-value { font-size: 14px; font-weight: 600; color: #111; }
    .footer { margin-top: 56px; display: flex; justify-content: space-between; align-items: flex-end; }
    .sig-line { width: 180px; border-top: 1px solid #333; padding-top: 8px; font-size: 11px; color: #888; letter-spacing: 2px; text-transform: uppercase; text-align: center; }
    .badge { background: #c00; color: #fff; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; padding: 4px 14px; border-radius: 20px; font-weight: 700; }
    @media print { body { padding: 0; } .cert { border-radius: 0; } }
  </style>
</head>
<body>
<div class="cert">
  <div class="drop">🩸</div>
  <div class="logo">Apna Blood Centre</div>
  <h1>Certificate of Donation</h1>
  <div class="subtitle">Blood Donor Recognition</div>

  <p class="body-text">This is to certify that</p>
  <div class="name">${donor.full_name}</div>
  <p class="body-text" style="margin-top:4px">
    has voluntarily donated blood on <strong>${donationDate}</strong><br/>
    and has contributed to saving lives through this noble act.
  </p>

  <div class="meta">
    <div class="meta-item">
      <div class="meta-label">Donor Code</div>
      <div class="meta-value">${donor.donor_code}</div>
    </div>
    <div class="meta-item">
      <div class="meta-label">Blood Group</div>
      <div class="meta-value">${donor.blood_group}</div>
    </div>
    ${donor.unit_no ? `<div class="meta-item"><div class="meta-label">Unit No.</div><div class="meta-value">${donor.unit_no}</div></div>` : ""}
    ${donor.blood_bag_no ? `<div class="meta-item"><div class="meta-label">Blood Bag No.</div><div class="meta-value">${donor.blood_bag_no}</div></div>` : ""}
  </div>

  <div class="footer">
    <div class="sig-line">Authorised Signatory</div>
    <div class="badge">Thank You, Hero</div>
    <div class="sig-line">Medical Officer</div>
  </div>
</div>
<script>window.onload = () => window.print();</script>
</body>
</html>`;

  const blob = new Blob([html], { type: "text/html" });
  const url  = URL.createObjectURL(blob);
  const win  = window.open(url, "_blank");
  if (win) win.focus();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
