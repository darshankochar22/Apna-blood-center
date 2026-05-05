import type { DonorStatus } from "@/types/donor";

export const statusColors: Record<DonorStatus, string> = {
  pending:  "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  verified: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  approved: "bg-green-500/20 text-green-300 border-green-500/30",
  donated:  "bg-white/20 text-white border-white/30",
  issued:   "bg-white text-black border-white",
  rejected: "bg-transparent text-white/50 border-white/10",
};

export const STATUS_LABEL: Record<DonorStatus, string> = {
  pending:  "Unverified",
  verified: "Verified",
  approved: "Accepted",
  donated:  "Donated",
  issued:   "Issued",
  rejected: "Rejected",
};

export const TABS: { label: string; value: string | null; statKey?: string; isBin?: boolean }[] = [
  { label: "All",        value: null },
  { label: "Unverified", value: "pending",  statKey: "pending" },
  { label: "Verified",   value: "verified", statKey: "verified" },
  { label: "Accepted",   value: "approved", statKey: "approved" },
  { label: "Donated",    value: "donated",  statKey: "donated" },
  { label: "Issued",     value: "issued",   statKey: "issued" },
  { label: "Rejected",   value: "rejected", statKey: "rejected" },
  { label: "Birthdays",  value: "birthdays" },
  { label: "Bin",        value: "bin",      statKey: "bin",     isBin: true },
];
