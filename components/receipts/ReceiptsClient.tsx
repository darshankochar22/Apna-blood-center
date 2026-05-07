"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { Plus, Printer } from "lucide-react";
import { createReceiptAction, fetchReceiptsAction } from "@/app/actions";
import type { Receipt, ReceiptCreateInput } from "@/types/receipt";
import { ReceiptFormModal } from "./ReceiptFormModal";
import { downloadReceipt } from "@/lib/downloadReceipt";

export default function ReceiptsClient() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    const res = await fetchReceiptsAction();
    if (res.success && res.data) {
      setReceipts(res.data as Receipt[]);
      setError("");
    } else {
      setError(res.error || "Failed to load receipts");
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const rows = useMemo(() => receipts, [receipts]);

  const handleCreate = async (input: ReceiptCreateInput) => {
    const res = await createReceiptAction(input);
    if (!res.success || !res.data) {
      alert("Failed: " + (res.error || "Unknown error"));
      return null;
    }
    const created = res.data as Receipt;
    setReceipts((prev) => [created, ...prev]);
    return created;
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 bg-gray-50 dark:bg-black min-h-screen text-black dark:text-white transition-colors duration-200">
      <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-white/5 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-5 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-xl font-semibold text-black dark:text-white">Receipts</h2>
            <p className="text-sm text-gray-500 dark:text-white/40 mt-1">
              Create and print receipts (Patient + Blood Centre copies).
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="px-4 py-2.5 rounded-xl bg-black dark:bg-white text-white dark:text-black font-bold text-sm flex items-center gap-2 hover:opacity-90 transition"
          >
            <Plus className="w-4 h-4" /> Create New Receipt
          </button>
        </div>

        <div className="overflow-auto border-t border-gray-100 dark:border-white/5">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 dark:bg-[#0a0a0a] text-gray-500 dark:text-white/40 sticky top-0 uppercase text-[11px] tracking-wider border-b border-gray-200 dark:border-white/5">
              <tr>
                <th className="px-5 py-4 font-semibold">Receipt No</th>
                <th className="px-5 py-4 font-semibold">Date</th>
                <th className="px-5 py-4 font-semibold">Patient</th>
                <th className="px-5 py-4 font-semibold">Blood Group</th>
                <th className="px-5 py-4 font-semibold">Hospital</th>
                <th className="px-5 py-4 font-semibold">Amount Paid</th>
                <th className="px-5 py-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-gray-400 dark:text-white/30">
                    Loading…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-gray-400 dark:text-white/30">
                    No receipts yet
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-white/2 transition-colors">
                    <td className="px-5 py-4 font-semibold">{r.receipt_no}</td>
                    <td className="px-5 py-4 text-gray-500 dark:text-white/40 text-xs">
                      {r.receipt_datetime ? format(new Date(r.receipt_datetime), "dd MMM yyyy, hh:mm a") : "—"}
                    </td>
                    <td className="px-5 py-4">{r.patient_name}</td>
                    <td className="px-5 py-4">{r.blood_group}</td>
                    <td className="px-5 py-4">{r.hospital_name}</td>
                    <td className="px-5 py-4 font-semibold">₹{Number(r.amount_paid || 0).toFixed(0)}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => downloadReceipt(r)}
                          className="px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-white/90 border border-gray-300 dark:border-white/20 bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/15 rounded-lg transition-colors flex items-center gap-1"
                        >
                          <Printer className="w-3 h-3" /> Print
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {error && (
          <div className="px-5 py-4 border-t border-gray-100 dark:border-white/5 text-sm text-red-500">
            {error}
          </div>
        )}
      </div>

      {showCreate && (
        <ReceiptFormModal
          onClose={() => setShowCreate(false)}
          onCreate={handleCreate}
        />
      )}
    </div>
  );
}

