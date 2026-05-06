"use client";

import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { Smartphone, Copy, ExternalLink, RefreshCw } from "lucide-react";

export default function QRPage() {
  const [formUrl, setFormUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setFormUrl("https://blood-bank-rho-ten.vercel.app/donate");
  }, []);

  function handleCopy() {
    navigator.clipboard.writeText(formUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center p-8">
      <div className="w-full max-w-lg space-y-8">

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gray-100 dark:bg-white/5 mb-2">
            <Smartphone className="w-7 h-7 text-black dark:text-white" />
          </div>
          <h1 className="text-3xl font-bold text-black dark:text-white">Donor Registration QR</h1>
          <p className="text-gray-500 dark:text-white/40 text-sm">
            Scan this code to open the donor registration form. Each scan starts a fresh form.
          </p>
        </div>

        {/* QR Code Card */}
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-transparent flex flex-col items-center gap-6">
          {formUrl ? (
            <div className="p-4 bg-white rounded-2xl">
              <QRCode
                value={formUrl}
                size={240}
                bgColor="#ffffff"
                fgColor="#000000"
                level="H"
              />
            </div>
          ) : (
            <div className="w-[240px] h-[240px] flex items-center justify-center">
              <RefreshCw className="w-8 h-8 text-gray-300 animate-spin" />
            </div>
          )}

          {/* URL bar */}
          <div className="w-full flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
            <span className="flex-1 text-sm text-gray-600 font-mono truncate">{formUrl}</span>
            <button
              onClick={handleCopy}
              title="Copy link"
              className="shrink-0 text-gray-400 hover:text-black transition-colors"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
          {copied && (
            <p className="text-xs text-green-600 font-semibold -mt-4">Link copied!</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <a
            href={formUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-4 bg-black dark:bg-white text-white dark:text-black font-bold rounded-2xl hover:opacity-80 transition-opacity"
          >
            <ExternalLink className="w-4 h-4" />
            Open Form
          </a>
          <button
            onClick={() => window.print()}
            className="flex-1 py-4 bg-gray-100 dark:bg-white/5 text-black dark:text-white font-bold rounded-2xl hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
          >
            Print / Save
          </button>
        </div>

        <p className="text-center text-xs text-gray-400 dark:text-white/20">
          The form is publicly accessible — no login required for donors.
          All submitted data is visible only to authorised admin users.
        </p>
      </div>
    </div>
  );
}
