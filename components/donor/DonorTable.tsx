"use client";

import React from "react";
import { format } from "date-fns";
import { Search, Trash2, RotateCcw } from "lucide-react";
import { Donor } from "@/types/donor";
import { BLOOD_GROUPS } from "@/types/donor";
import { statusColors, STATUS_LABEL, TABS } from "./constants";

interface DonorTableProps {
  donors: Donor[];
  binDonors: Donor[];
  statusFilter: string | null;
  isBinTab: boolean;
  search: string;
  setSearch: (v: string) => void;
  filterBloodGroup: string;
  setFilterBloodGroup: (v: string) => void;
  filterGender: string;
  setFilterGender: (v: string) => void;
  filterDonationType: string;
  setFilterDonationType: (v: string) => void;
  filteredDonors: Donor[];
  sendingEmailId: string | null;
  onRowClick: (donor: Donor) => void;
  onDelete: (e: React.MouseEvent, id: string) => void;
  onRestore: (id: string) => void;
  onPermanentDelete: (id: string) => void;
  onSendBirthday: (e: React.MouseEvent, id: string) => void;
}

export function DonorTable({
  binDonors,
  statusFilter,
  isBinTab,
  search,
  setSearch,
  filterBloodGroup,
  setFilterBloodGroup,
  filterGender,
  setFilterGender,
  filterDonationType,
  setFilterDonationType,
  filteredDonors,
  sendingEmailId,
  onRowClick,
  onDelete,
  onRestore,
  onPermanentDelete,
  onSendBirthday,
}: DonorTableProps) {
  const tableTitle = statusFilter
    ? `${TABS.find(t => t.value === statusFilter)?.label ?? statusFilter} Donors`
    : "All Registrations";

  const displayCount = isBinTab
    ? binDonors.filter(d =>
        d.full_name.toLowerCase().includes(search.toLowerCase()) ||
        d.donor_code.toLowerCase().includes(search.toLowerCase())
      ).length
    : filteredDonors.length;

  return (
    <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-white/5 rounded-3xl overflow-hidden flex flex-col shadow-sm">
      {/* Table header */}
      <div className="p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-black dark:text-white">{tableTitle}</h2>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white/60">
            {displayCount}
          </span>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-white/30" />
          <input
            type="text"
            placeholder="Search donor..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-gray-100 dark:bg-black rounded-xl py-2 pl-10 pr-4 text-sm text-black dark:text-white outline-none focus:bg-gray-200 dark:focus:bg-[#222] transition-colors"
          />
        </div>
      </div>

      {/* Filters bar */}
      {!isBinTab && (
        <div className="px-5 pb-5 border-b border-gray-100 dark:border-white/5 flex items-center gap-4 flex-wrap">
          <select
            value={filterBloodGroup}
            onChange={e => setFilterBloodGroup(e.target.value)}
            className="bg-gray-100 dark:bg-black border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm outline-none text-black dark:text-white/70 appearance-none cursor-pointer hover:bg-gray-200 dark:hover:bg-white/5 transition-colors"
          >
            <option value="">All Blood Groups</option>
            {BLOOD_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
          </select>

          <select
            value={filterGender}
            onChange={e => setFilterGender(e.target.value)}
            className="bg-gray-100 dark:bg-black border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm outline-none text-black dark:text-white/70 appearance-none cursor-pointer hover:bg-gray-200 dark:hover:bg-white/5 transition-colors"
          >
            <option value="">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>

          <select
            value={filterDonationType}
            onChange={e => setFilterDonationType(e.target.value)}
            className="bg-gray-100 dark:bg-black border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm outline-none text-black dark:text-white/70 appearance-none cursor-pointer hover:bg-gray-200 dark:hover:bg-white/5 transition-colors"
          >
            <option value="">All Donation Types</option>
            <option value="Whole Blood">Whole Blood</option>
            <option value="SDP (Platelets)">SDP (Platelets)</option>
            <option value="FFP (Plasma)">FFP (Plasma)</option>
          </select>

          {(filterBloodGroup || filterGender || filterDonationType) && (
            <button
              onClick={() => { setFilterBloodGroup(""); setFilterGender(""); setFilterDonationType(""); }}
              className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-white/40 hover:text-black dark:hover:text-white transition-colors ml-2"
            >
              Clear Filters
            </button>
          )}
        </div>
      )}

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-[#0a0a0a] text-white/50 sticky top-0 uppercase text-xs tracking-wider">
            <tr>
              {isBinTab ? (
                <>
                  <th className="px-6 py-4 font-medium">Donor Code</th>
                  <th className="px-6 py-4 font-medium">Full Name</th>
                  <th className="px-6 py-4 font-medium">Blood Group</th>
                  <th className="px-6 py-4 font-medium">Status at Deletion</th>
                  <th className="px-6 py-4 font-medium">Deleted</th>
                  <th className="px-6 py-4 font-medium">Actions</th>
                </>
              ) : (
                <>
                  <th className="px-6 py-4 font-medium">Donor Code</th>
                  <th className="px-6 py-4 font-medium">Full Name</th>
                  <th className="px-6 py-4 font-medium">Blood Group</th>
                  <th className="px-6 py-4 font-medium">Contact</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium w-10"></th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {isBinTab ? (
              <>
                {binDonors
                  .filter(d =>
                    d.full_name.toLowerCase().includes(search.toLowerCase()) ||
                    d.donor_code.toLowerCase().includes(search.toLowerCase())
                  )
                  .map(donor => (
                    <tr key={donor.id} className="transition-colors">
                      <td className="px-6 py-4 font-mono text-white/70">{donor.donor_code}</td>
                      <td className="px-6 py-4 font-medium text-white">{donor.full_name}</td>
                      <td className="px-6 py-4">
                        <span className="bg-white/10 text-white font-bold px-2.5 py-1 rounded-md text-xs border border-white/20">
                          {donor.blood_group}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border uppercase tracking-wider ${statusColors[donor.status]}`}>
                          {STATUS_LABEL[donor.status] ?? donor.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-white/50 text-sm">
                        {donor.deleted_at ? format(new Date(donor.deleted_at), "dd MMM yyyy") : "-"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onRestore(donor.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-lg transition"
                          >
                            <RotateCcw className="w-3 h-3" /> Restore
                          </button>
                          <button
                            onClick={() => onPermanentDelete(donor.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs font-bold rounded-lg transition"
                          >
                            <Trash2 className="w-3 h-3" /> Delete Forever
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                {binDonors.length === 0 && (
                  <tr><td colSpan={6} className="px-6 py-12 text-center text-white/30">Bin is empty.</td></tr>
                )}
              </>
            ) : (
              <>
                {filteredDonors.map(donor => (
                  <tr
                    key={donor.id}
                    onClick={() => onRowClick(donor)}
                    className="hover:bg-white/5 cursor-pointer transition-colors group"
                  >
                    <td className="px-6 py-4 font-mono text-white/70">{donor.donor_code}</td>
                    <td className="px-6 py-4 font-medium text-white">{donor.full_name}</td>
                    <td className="px-6 py-4">
                      <span className="bg-white/10 text-white font-bold px-2.5 py-1 rounded-md text-xs border border-white/20">
                        {donor.blood_group}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-white/60">{donor.phone}</td>
                    <td className="px-6 py-4 text-white/50">
                      {statusFilter === "birthdays"
                        ? format(new Date(donor.dob!), "dd MMM")
                        : format(new Date(donor.created_at || new Date()), "dd MMM yyyy")}
                    </td>
                    <td className="px-6 py-4">
                      {statusFilter === "birthdays" ? (
                        <button
                          onClick={e => onSendBirthday(e, donor.id)}
                          disabled={sendingEmailId === donor.id}
                          className="px-4 py-1.5 bg-white hover:bg-gray-200 text-black text-[11px] font-bold uppercase tracking-wider rounded-full transition-colors disabled:opacity-50"
                        >
                          {sendingEmailId === donor.id ? "Sending..." : "Send Invite"}
                        </button>
                      ) : (
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border uppercase tracking-wider ${statusColors[donor.status]}`}>
                          {STATUS_LABEL[donor.status] ?? donor.status}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={e => onDelete(e, donor.id)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredDonors.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-white/30">No donors found.</td>
                  </tr>
                )}
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
