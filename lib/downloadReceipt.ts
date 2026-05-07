import { format } from "date-fns";
import type { Receipt } from "@/types/receipt";
import { amountToWordsINR } from "./numberToWordsINR";

const money = (n: number) =>
  `Rs. ${Number.isFinite(n) ? n.toFixed(2) : "0.00"}`;

function buildCopyHtml(receipt: Receipt, copyLabel: string) {
  const dt = receipt.receipt_datetime ? new Date(receipt.receipt_datetime) : new Date();
  const dateStr = format(dt, "dd-MM-yyyy");
  const timeStr = format(dt, "hh:mm a");

  return `
  <div class="receipt">
    <div class="top">
      <div class="left">
        <div class="no">No.</div>
        <div class="title">RECEIPT</div>
        <div class="copy">${copyLabel}</div>
      </div>
      <div class="right">
        <div class="receipt-no">${receipt.receipt_no}</div>
        <div class="org">APNA BLOOD CENTRE</div>
        <div class="sub">MANAGED BY OM SAI RAKT-DATA SEWARTH SAMITI, RAIPUR (REGD. NO.29283)</div>
        <div class="sub">24/7 Helpline Number: 0771 422 3311 | +91 97131 75950</div>
        <div class="sub">Licence No. CG/28-C/102/2023</div>
      </div>
    </div>

    <div class="meta">
      <div><b>Date:</b> ${dateStr}</div>
      <div><b>Time:</b> ${timeStr}</div>
    </div>

    <div class="body">
      <p>
        Received with thanks from Mr./Mrs. <b>${receipt.receiver_name}</b>
        towards the Blood Testing Charges (HIV I &amp; II, HBsAg, HCV, MP, VDRL, Cross Matching &amp; Other) <b>BLOOD IS FREE</b>
      </p>

      <div class="grid">
        <div><span>Patient's Name</span><b>${receipt.patient_name}</b></div>
        <div><span>Blood Group</span><b>${receipt.blood_group}</b></div>
        <div><span>Relationship with Patient</span><b>${receipt.relationship_with_patient}</b></div>
        <div><span>Issue No.</span><b>${receipt.issue_no}</b></div>
        <div><span>Bag ID</span><b>${receipt.bag_id}</b></div>
        <div><span>Admitted in</span><b>${receipt.hospital_name}</b></div>
        <div><span>Components</span><b>${receipt.components}</b></div>
        <div><span>Unit</span><b>${receipt.unit}</b></div>
      </div>

      <div class="amounts">
        <div class="row"><span>Subtotal:</span><b>${money(receipt.actual_charges)}</b></div>
        <div class="row"><span>Discount:</span><b>${money(receipt.discount_amount)}</b></div>
        <div class="row"><span>Amt Paid:</span><b>${money(receipt.amount_paid)}</b></div>
        <div class="words">Rs. (In Words) <b>${amountToWordsINR(receipt.amount_paid)}</b> (Cash/Online)</div>
      </div>
    </div>

    <div class="footer">
      <div class="sig">Receiver’s Signature</div>
      <div class="sig">For, APNA BLOOD CENTRE</div>
    </div>
  </div>`;
}

export function downloadReceipt(receipt: Receipt) {
  const html = `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Receipt ${receipt.receipt_no}</title>
    <style>
      * { box-sizing: border-box; }
      body { font-family: Arial, sans-serif; margin: 18px; color: #111; }
      .page { display: grid; grid-template-columns: 1fr; gap: 16px; }
      .receipt { border: 2px solid #111; padding: 16px; }
      .top { display: grid; grid-template-columns: 130px 1fr; gap: 12px; }
      .left .no { font-size: 12px; }
      .left .title { font-size: 22px; font-weight: 800; letter-spacing: 1px; margin-top: 2px; }
      .left .copy { font-size: 12px; font-weight: 700; margin-top: 2px; }
      .right { text-align: center; }
      .receipt-no { font-size: 22px; font-weight: 800; margin-bottom: 4px; }
      .org { font-size: 18px; font-weight: 800; }
      .sub { font-size: 11px; margin-top: 2px; color: #333; }
      .meta { display:flex; justify-content: space-between; margin: 12px 0 8px; font-size: 12px; }
      .body p { font-size: 12px; line-height: 1.35; margin: 0 0 10px; }
      .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px 14px; margin-top: 6px; }
      .grid div span { display:block; font-size: 10px; color: #555; text-transform: uppercase; letter-spacing: .8px; }
      .grid div b { display:block; font-size: 13px; margin-top: 2px; }
      .amounts { margin-top: 14px; border-top: 1px solid #111; padding-top: 10px; }
      .row { display:flex; justify-content: space-between; font-size: 13px; margin: 4px 0; }
      .words { margin-top: 6px; font-size: 12px; }
      .footer { display:flex; justify-content: space-between; margin-top: 20px; font-size: 12px; }
      .sig { width: 45%; border-top: 1px solid #111; padding-top: 6px; text-align: center; }
      @media print {
        body { margin: 10mm; }
        .receipt { break-inside: avoid; }
      }
    </style>
  </head>
  <body>
    <div class="page">
      ${buildCopyHtml(receipt, "Patient’s Copy")}
      ${buildCopyHtml(receipt, "Blood Centre’s Copy")}
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

