"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import {
  Search,
  Trash2,
  RotateCcw,
  CheckCircle,
  Eye,
  Stethoscope,
  FlaskConical,
  FileText,
  Mail,
} from "lucide-react";
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
  sendingAnnivEmailId: string | null;
  onRowClick: (donor: Donor) => void;
  onProcess: (donor: Donor) => void;
  onAcceptedProcess: (donor: Donor) => void;
  onTestResults: (donor: Donor) => void;
  onDownloadCert: (donor: Donor) => void;
  onDelete: (e: React.MouseEvent, id: string) => void;
  onRestore: (id: string) => void;
  onPermanentDelete: (id: string) => void;
  onSendBirthday: (e: React.MouseEvent, id: string) => void;
  onSendAnniversary: (e: React.MouseEvent, id: string) => void;
  onIssueSlip: (donor: Donor) => void;
  onDownloadTestReport: (donor: Donor) => void;
}

const PER_PAGE_OPTIONS = [10, 25, 50, 100];

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
  onRowClick,
  onProcess,
  onAcceptedProcess,
  onTestResults,
  onDownloadCert,
  onDelete,
  sendingEmailId,
  sendingAnnivEmailId,
  onSendBirthday,
  onSendAnniversary,
  onIssueSlip,
  onDownloadTestReport,
  onRestore,
  onPermanentDelete,
}: DonorTableProps) {
  const [perPage, setPerPage] = useState(10);
  const [page, setPage] = useState(1);

  const isUnverified = statusFilter === "pending";
  const isVerified   = statusFilter === "verified";
  const isAccepted   = statusFilter === "approved";
  const isDonated    = statusFilter === "donated";
  const isIssued     = statusFilter === "issued";
  const isCompleted  = statusFilter === "completed";

  const tableTitle = statusFilter
    ? `${TABS.find((t) => t.value === statusFilter)?.label ?? statusFilter} Donors`
    : "All Registrations";

  const visibleList = isBinTab
    ? binDonors.filter(
        (d) =>
          d.full_name.toLowerCase().includes(search.toLowerCase()) ||
          d.donor_code.toLowerCase().includes(search.toLowerCase()),
      )
    : filteredDonors;

  const totalPages = Math.max(1, Math.ceil(visibleList.length / perPage));
  const safePage = Math.min(page, totalPages);
  const pageRows = visibleList.slice(
    (safePage - 1) * perPage,
    safePage * perPage,
  );

  const handlePageChange = (p: number) =>
    setPage(Math.max(1, Math.min(p, totalPages)));

  const pageNumbers = () => {
    const pages: (number | "…")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (safePage > 3) pages.push("…");
      for (
        let i = Math.max(2, safePage - 1);
        i <= Math.min(totalPages - 1, safePage + 1);
        i++
      )
        pages.push(i);
      if (safePage < totalPages - 2) pages.push("…");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-white/5 rounded-3xl overflow-hidden flex flex-col shadow-sm">
      {/* Header */}
      <div className="p-5 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-black dark:text-white">
            {tableTitle}
          </h2>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white/60">
            {visibleList.length}
          </span>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Show X entries */}
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-white/40">
            <span>Show</span>
            <select
              value={perPage}
              onChange={(e) => {
                setPerPage(Number(e.target.value));
                setPage(1);
              }}
              className="bg-gray-100 dark:bg-black border border-gray-200 dark:border-white/10 rounded-lg px-2 py-1.5 text-sm text-black dark:text-white outline-none"
            >
              {PER_PAGE_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <span>entries</span>
          </div>
          {/* Search */}
          <div className="relative w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-white/30" />
            <input
              type="text"
              placeholder="Search donor..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full bg-gray-100 dark:bg-black rounded-xl py-2 pl-10 pr-4 text-sm text-black dark:text-white outline-none focus:bg-gray-200 dark:focus:bg-[#222] transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Filters */}
      {!isBinTab && (
        <div className="px-5 pb-4 border-b border-gray-100 dark:border-white/5 flex items-center gap-3 flex-wrap">
          <select
            value={filterBloodGroup}
            onChange={(e) => {
              setFilterBloodGroup(e.target.value);
              setPage(1);
            }}
            className="bg-gray-100 dark:bg-black border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm outline-none text-black dark:text-white/70 appearance-none cursor-pointer hover:bg-gray-200 dark:hover:bg-white/5 transition-colors"
          >
            <option value="">All Blood Groups</option>
            {BLOOD_GROUPS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
          <select
            value={filterGender}
            onChange={(e) => {
              setFilterGender(e.target.value);
              setPage(1);
            }}
            className="bg-gray-100 dark:bg-black border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm outline-none text-black dark:text-white/70 appearance-none cursor-pointer hover:bg-gray-200 dark:hover:bg-white/5 transition-colors"
          >
            <option value="">All Genders</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          <select
            value={filterDonationType}
            onChange={(e) => {
              setFilterDonationType(e.target.value);
              setPage(1);
            }}
            className="bg-gray-100 dark:bg-black border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm outline-none text-black dark:text-white/70 appearance-none cursor-pointer hover:bg-gray-200 dark:hover:bg-white/5 transition-colors"
          >
            <option value="">All Donation Types</option>
            <option value="Whole Blood">Whole Blood</option>
            <option value="SDP (Platelets)">SDP (Platelets)</option>
            <option value="FFP (Plasma)">FFP (Plasma)</option>
          </select>
          {(filterBloodGroup || filterGender || filterDonationType) && (
            <button
              onClick={() => {
                setFilterBloodGroup("");
                setFilterGender("");
                setFilterDonationType("");
                setPage(1);
              }}
              className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-white/40 hover:text-black dark:hover:text-white transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      )}

      {/* Table */}
      <div className="overflow-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-gray-50 dark:bg-[#0a0a0a] text-gray-500 dark:text-white/40 sticky top-0 uppercase text-[11px] tracking-wider border-b border-gray-200 dark:border-white/5">
            <tr>
              {isBinTab ? (
                <>
                  <th className="px-5 py-4 font-semibold">Donor Code</th>
                  <th className="px-5 py-4 font-semibold">Full Name</th>
                  <th className="px-5 py-4 font-semibold">Blood Group</th>
                  <th className="px-5 py-4 font-semibold">
                    Status at Deletion
                  </th>
                  <th className="px-5 py-4 font-semibold">Deleted</th>
                  <th className="px-5 py-4 font-semibold">Actions</th>
                </>
              ) : isCompleted ? (
                <>
                  <th className="px-3 py-4 font-semibold w-10">No.</th>
                  <th className="px-3 py-4 font-semibold">Unit No.</th>
                  <th className="px-3 py-4 font-semibold">Segment / Lot No.</th>
                  <th className="px-3 py-4 font-semibold">Donor (Father Name)</th>
                  <th className="px-3 py-4 font-semibold">Blood Group</th>
                  <th className="px-3 py-4 font-semibold">Patient Name</th>
                  <th className="px-3 py-4 font-semibold">Hospital</th>
                  <th className="px-3 py-4 font-semibold">Amount</th>
                  <th className="px-3 py-4 font-semibold">Issued On</th>
                  <th className="px-3 py-4 font-semibold">Actions</th>
                </>
              ) : isIssued ? (
                <>
                  <th className="px-3 py-4 font-semibold w-10">No.</th>
                  <th className="px-3 py-4 font-semibold">Unit No.</th>
                  <th className="px-3 py-4 font-semibold">Segment / Lot No.</th>
                  <th className="px-3 py-4 font-semibold">Donor (Father Name)</th>
                  <th className="px-3 py-4 font-semibold">Blood Group</th>
                  <th className="px-3 py-4 font-semibold">Donation Type</th>
                  <th className="px-3 py-4 font-semibold">Tested On</th>
                  <th className="px-3 py-4 font-semibold">Actions</th>
                </>
              ) : isDonated ? (
                <>
                  <th className="px-3 py-4 font-semibold w-10">No.</th>
                  <th className="px-3 py-4 font-semibold">
                    Donor (Father&apos;s Name)
                  </th>
                  <th className="px-3 py-4 font-semibold">Blood Group</th>
                  <th className="px-3 py-4 font-semibold">Unit No.</th>
                  <th className="px-3 py-4 font-semibold">Blood Bag No.</th>
                  <th className="px-3 py-4 font-semibold">Donation Date</th>
                  <th className="px-3 py-4 font-semibold">Actions</th>
                </>
              ) : isAccepted ? (
                <>
                  <th className="px-3 py-4 font-semibold w-10">No.</th>
                  <th className="px-3 py-4 font-semibold">
                    Donor (Father&apos;s Name)
                  </th>
                  <th className="px-3 py-4 font-semibold">Blood Group</th>
                  <th className="px-3 py-4 font-semibold">Donor Type</th>
                  <th className="px-3 py-4 font-semibold">Donation Type</th>
                  <th className="px-3 py-4 font-semibold">Address</th>
                  <th className="px-3 py-4 font-semibold">Total Donations</th>
                  <th className="px-3 py-4 font-semibold">Actions</th>
                </>
              ) : isVerified ? (
                <>
                  <th className="px-3 py-4 font-semibold w-10">No.</th>
                  <th className="px-3 py-4 font-semibold">
                    Donor (Father&apos;s Name)
                  </th>
                  <th className="px-3 py-4 font-semibold">Blood Group</th>
                  <th className="px-3 py-4 font-semibold">Address</th>
                  <th className="px-3 py-4 font-semibold">
                    Prev. Donation Date
                  </th>
                  <th className="px-3 py-4 font-semibold">Total Donations</th>
                  <th className="px-3 py-4 font-semibold">Actions</th>
                </>
              ) : isUnverified ? (
                <>
                  <th className="px-3 py-4 font-semibold w-10">No.</th>
                  <th className="px-3 py-4 font-semibold">Full Name</th>
                  <th className="px-3 py-4 font-semibold">
                    Father&apos;s Name
                  </th>
                  <th className="px-3 py-4 font-semibold">Blood Group</th>
                  <th className="px-3 py-4 font-semibold">Age</th>
                  <th className="px-3 py-4 font-semibold">Gender</th>
                  <th className="px-3 py-4 font-semibold">Address</th>
                  <th className="px-3 py-4 font-semibold">Prev. Donation</th>
                  <th className="px-3 py-4 font-semibold">Total Don.</th>
                  <th className="px-3 py-4 font-semibold">Actions</th>
                </>
              ) : (
                <>
                  <th className="px-5 py-4 font-semibold w-12">No.</th>
                  <th className="px-5 py-4 font-semibold">Donor Code</th>
                  <th className="px-5 py-4 font-semibold">Full Name</th>
                  <th className="px-5 py-4 font-semibold">Blood Group</th>
                  <th className="px-5 py-4 font-semibold">Contact</th>
                  <th className="px-5 py-4 font-semibold">
                    {statusFilter === "anniversaries" ? "Anniversary" : "Date"}
                  </th>
                  <th className="px-5 py-4 font-semibold">Status</th>
                  <th className="px-5 py-4 font-semibold">Actions</th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-white/5">
            {isBinTab ? (
              binDonors
                .filter(
                  (d) =>
                    d.full_name.toLowerCase().includes(search.toLowerCase()) ||
                    d.donor_code.toLowerCase().includes(search.toLowerCase()),
                )
                .map((donor) => (
                  <tr
                    key={donor.id}
                    className="hover:bg-gray-50 dark:hover:bg-white/2 transition-colors"
                  >
                    <td className="px-5 py-4 font-mono text-xs text-gray-500 dark:text-white/40">
                      {donor.donor_code}
                    </td>
                    <td className="px-5 py-4 font-semibold text-black dark:text-white">
                      {donor.full_name}
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400">
                        {donor.blood_group}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold ${statusColors[donor.status]}`}
                      >
                        {STATUS_LABEL[donor.status]}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-500 dark:text-white/40 text-xs">
                      {donor.deleted_at
                        ? format(new Date(donor.deleted_at), "dd MMM yyyy")
                        : "-"}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onRestore(donor.id)}
                          className="px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-white/80 border border-gray-300 dark:border-white/15 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg transition-colors flex items-center gap-1"
                        >
                          <RotateCcw className="w-3 h-3" /> Restore
                        </button>
                        <button
                          onClick={() => onPermanentDelete(donor.id)}
                          className="px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-white/80 border border-gray-300 dark:border-white/15 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg transition-colors flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
            ) : pageRows.length === 0 ? (
              <tr>
                <td
                  colSpan={10}
                  className="px-5 py-16 text-center text-gray-400 dark:text-white/20"
                >
                  No donors found
                </td>
              </tr>
            ) : isCompleted ? (
              pageRows.map((donor, idx) => (
                <tr
                  key={donor.id}
                  onClick={() => onRowClick(donor)}
                  className="group hover:bg-gray-50 dark:hover:bg-white/2 transition-colors cursor-pointer"
                >
                  <td className="px-3 py-3.5 text-gray-400 dark:text-white/30 text-xs">{(safePage - 1) * perPage + idx + 1}</td>
                  <td className="px-3 py-3.5 text-sm font-semibold text-black dark:text-white">{donor.unit_no || "—"}</td>
                  <td className="px-3 py-3.5 text-gray-600 dark:text-white/60 text-sm">{donor.segment_no || "—"}</td>
                  <td className="px-3 py-3.5">
                    <div className="font-semibold text-black dark:text-white text-sm">{donor.full_name}</div>
                    <div className="text-xs text-gray-400 dark:text-white/30 mt-0.5">{donor.father_name || "—"}</div>
                  </td>
                  <td className="px-3 py-3.5">
                    <span className="px-2 py-0.5 rounded-lg text-xs font-bold bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400">{donor.blood_group}</span>
                  </td>
                  <td className="px-3 py-3.5 text-gray-600 dark:text-white/60 text-sm">{donor.patient_name || "—"}</td>
                  <td className="px-3 py-3.5 text-gray-600 dark:text-white/60 text-sm">{donor.hospital || "—"}</td>
                  <td className="px-3 py-3.5 text-gray-600 dark:text-white/60 text-sm">{donor.amount_received || "—"}</td>
                  <td className="px-3 py-3.5 text-gray-500 dark:text-white/40 text-xs">
                    {donor.issued_at
                      ? format(new Date(donor.issued_at), "dd MMM yyyy")
                      : donor.donation_time
                        ? format(new Date(donor.donation_time), "dd MMM yyyy")
                        : "—"}
                  </td>
                  <td className="px-3 py-3.5">
                    <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => onDownloadCert(donor)}
                        className="px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-white/80 border border-gray-300 dark:border-white/15 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg transition-colors flex items-center gap-1 whitespace-nowrap"
                      >
                        <FileText className="w-3 h-3" /> Download Certificate
                      </button>
                      <button
                        onClick={e => onDelete(e, donor.id)}
                        className="px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-white/80 border border-gray-300 dark:border-white/15 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg transition-colors flex items-center gap-1 whitespace-nowrap"
                      >
                        <Trash2 className="w-3 h-3" /> Discard
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : isIssued ? (
              pageRows.map((donor, idx) => (
                <tr
                  key={donor.id}
                  className="group hover:bg-gray-50 dark:hover:bg-white/2 transition-colors"
                >
                  <td className="px-3 py-3.5 text-gray-400 dark:text-white/30 text-xs">
                    {(safePage - 1) * perPage + idx + 1}
                  </td>
                  <td className="px-3 py-3.5 text-gray-600 dark:text-white/60 text-sm font-semibold">
                    {donor.unit_no || "—"}
                  </td>
                  <td className="px-3 py-3.5 text-gray-600 dark:text-white/60 text-sm">
                    {donor.segment_no || "—"}
                  </td>
                  <td className="px-3 py-3.5">
                    <div className="font-semibold text-black dark:text-white text-sm">{donor.full_name}</div>
                    <div className="text-xs text-gray-400 dark:text-white/30 mt-0.5">{donor.father_name || "—"}</div>
                  </td>
                  <td className="px-3 py-3.5">
                    <span className="px-2 py-0.5 rounded-lg text-xs font-bold bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400">
                      {donor.blood_group}
                    </span>
                  </td>
                  <td className="px-3 py-3.5 text-gray-600 dark:text-white/60 text-sm">
                    {donor.type_of_donation || "—"}
                  </td>
                  <td className="px-3 py-3.5 text-gray-500 dark:text-white/40 text-xs">
                    {donor.tested_at
                      ? format(new Date(donor.tested_at), "dd MMM yyyy")
                      : donor.donation_time
                      ? format(new Date(donor.donation_time), "dd MMM yyyy")
                      : "—"}
                  </td>
                  <td className="px-3 py-3.5">
                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onRowClick(donor)}
                        className="px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-white/80 border border-gray-300 dark:border-white/15 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg transition-colors flex items-center gap-1 whitespace-nowrap"
                      >
                        <Eye className="w-3 h-3" /> View
                      </button>
                      <button
                        onClick={() => onIssueSlip(donor)}
                        className="px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-white/80 border border-gray-300 dark:border-white/15 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg transition-colors flex items-center gap-1 whitespace-nowrap"
                      >
                        <FileText className="w-3 h-3" /> Issue
                      </button>
                      <button
                        onClick={() => onDownloadCert(donor)}
                        className="px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-white/80 border border-gray-300 dark:border-white/15 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg transition-colors flex items-center gap-1 whitespace-nowrap"
                      >
                        <FileText className="w-3 h-3" /> Certificate
                      </button>
                      <button
                        onClick={() => onDownloadTestReport(donor)}
                        className="px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-white/80 border border-gray-300 dark:border-white/15 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg transition-colors flex items-center gap-1 whitespace-nowrap"
                      >
                        <FlaskConical className="w-3 h-3" /> Test Report
                      </button>
                      <button
                        onClick={(e) => onDelete(e, donor.id)}
                        className="px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-white/80 border border-gray-300 dark:border-white/15 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg transition-colors flex items-center gap-1 whitespace-nowrap"
                      >
                        <Trash2 className="w-3 h-3" /> Discard
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : isDonated ? (
              pageRows.map((donor, idx) => (
                <tr
                  key={donor.id}
                  className="group hover:bg-gray-50 dark:hover:bg-white/2 transition-colors"
                >
                  <td className="px-3 py-3.5 text-gray-400 dark:text-white/30 text-xs">
                    {(safePage - 1) * perPage + idx + 1}
                  </td>
                  <td className="px-3 py-3.5">
                    <div className="font-semibold text-black dark:text-white text-sm">
                      {donor.full_name}
                    </div>
                    <div className="text-xs text-gray-400 dark:text-white/30 mt-0.5">
                      {donor.father_name || "—"}
                    </div>
                  </td>
                  <td className="px-3 py-3.5">
                    <span className="px-2 py-0.5 rounded-lg text-xs font-bold bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400">
                      {donor.blood_group}
                    </span>
                  </td>
                  <td className="px-3 py-3.5 text-gray-600 dark:text-white/60 text-sm">
                    {donor.unit_no || "—"}
                  </td>
                  <td className="px-3 py-3.5 text-gray-600 dark:text-white/60 text-sm">
                    {donor.blood_bag_no || "—"}
                  </td>
                  <td className="px-3 py-3.5 text-gray-500 dark:text-white/40 text-xs">
                    {donor.donation_time
                      ? format(
                          new Date(donor.donation_time),
                          "dd MMM yyyy, hh:mm a",
                        )
                      : "—"}
                  </td>
                  <td className="px-3 py-3.5">
                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onRowClick(donor)}
                        className="px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-white/80 border border-gray-300 dark:border-white/15 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg transition-colors flex items-center gap-1 whitespace-nowrap"
                      >
                        <Eye className="w-3 h-3" /> View
                      </button>
                      <button
                        onClick={() => onTestResults(donor)}
                        className="px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-white/80 border border-gray-300 dark:border-white/15 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg transition-colors flex items-center gap-1 whitespace-nowrap"
                      >
                        <FlaskConical className="w-3 h-3" /> Test Results
                      </button>
                      <button
                        onClick={() => onDownloadCert(donor)}
                        className="px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-white/80 border border-gray-300 dark:border-white/15 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg transition-colors flex items-center gap-1 whitespace-nowrap"
                      >
                        <FileText className="w-3 h-3" /> Certificate
                      </button>
                      <button
                        onClick={(e) => onDelete(e, donor.id)}
                        className="px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-white/80 border border-gray-300 dark:border-white/15 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg transition-colors flex items-center gap-1 whitespace-nowrap"
                      >
                        <Trash2 className="w-3 h-3" /> Discard
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : isAccepted ? (
              pageRows.map((donor, idx) => (
                <tr
                  key={donor.id}
                  className="group hover:bg-gray-50 dark:hover:bg-white/2 transition-colors"
                >
                  <td className="px-3 py-3.5 text-gray-400 dark:text-white/30 text-xs">
                    {(safePage - 1) * perPage + idx + 1}
                  </td>
                  <td className="px-3 py-3.5">
                    <div className="font-semibold text-black dark:text-white text-sm">
                      {donor.full_name}
                    </div>
                    <div className="text-xs text-gray-400 dark:text-white/30 mt-0.5">
                      {donor.father_name || "—"}
                    </div>
                  </td>
                  <td className="px-3 py-3.5">
                    <span className="px-2 py-0.5 rounded-lg text-xs font-bold bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400">
                      {donor.blood_group}
                    </span>
                  </td>
                  <td className="px-3 py-3.5 text-gray-600 dark:text-white/60 text-sm">
                    {donor.type_of_donor || "—"}
                  </td>
                  <td className="px-3 py-3.5 text-gray-600 dark:text-white/60 text-sm">
                    {donor.type_of_donation || "—"}
                  </td>
                  <td className="px-3 py-3.5 text-gray-600 dark:text-white/60 text-sm">
                    {[donor.area, donor.city].filter(Boolean).join(", ") ||
                      donor.address ||
                      "—"}
                  </td>
                  <td className="px-3 py-3.5 text-gray-600 dark:text-white/60 text-sm">
                    {donor.total_donations ?? 0}
                  </td>
                  <td className="px-3 py-3.5">
                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onRowClick(donor)}
                        className="px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-white/80 border border-gray-300 dark:border-white/15 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg transition-colors flex items-center gap-1 whitespace-nowrap"
                      >
                        <Eye className="w-3 h-3" /> View
                      </button>
                      <button
                        onClick={() => onAcceptedProcess(donor)}
                        className="px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-white/80 border border-gray-300 dark:border-white/15 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg transition-colors flex items-center gap-1 whitespace-nowrap"
                      >
                        <Stethoscope className="w-3 h-3" /> Process
                      </button>
                      <button
                        onClick={(e) => onDelete(e, donor.id)}
                        className="px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-white/90 border border-gray-300 dark:border-white/20 bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/15 rounded-lg transition-colors flex items-center gap-1 whitespace-nowrap"
                      >
                        <Trash2 className="w-3 h-3" /> Discard
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : isVerified ? (
              pageRows.map((donor, idx) => (
                <tr
                  key={donor.id}
                  className="group hover:bg-gray-50 dark:hover:bg-white/2 transition-colors"
                >
                  <td className="px-3 py-3.5 text-gray-400 dark:text-white/30 text-xs">
                    {(safePage - 1) * perPage + idx + 1}
                  </td>
                  <td className="px-3 py-3.5">
                    <div className="font-semibold text-black dark:text-white text-sm">
                      {donor.full_name}
                    </div>
                    <div className="text-xs text-gray-400 dark:text-white/30 mt-0.5">
                      {donor.father_name || "—"}
                    </div>
                  </td>
                  <td className="px-3 py-3.5">
                    <span className="px-2 py-0.5 rounded-lg text-xs font-bold bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400">
                      {donor.blood_group}
                    </span>
                  </td>
                  <td className="px-3 py-3.5 text-gray-600 dark:text-white/60 text-sm">
                    {[donor.area, donor.city].filter(Boolean).join(", ") ||
                      donor.address ||
                      "—"}
                  </td>
                  <td className="px-3 py-3.5 text-gray-600 dark:text-white/60 text-xs">
                    {donor.previous_donation_date
                      ? format(
                          new Date(donor.previous_donation_date),
                          "dd MMM yyyy",
                        )
                      : "—"}
                  </td>
                  <td className="px-3 py-3.5 text-gray-600 dark:text-white/60 text-sm">
                    {donor.total_donations ?? 0}
                  </td>
                  <td className="px-3 py-3.5">
                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onRowClick(donor)}
                        className="px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-white/90 border border-gray-300 dark:border-white/20 bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/15 rounded-lg transition-colors flex items-center gap-1 whitespace-nowrap"
                      >
                        <Eye className="w-3 h-3" /> View
                      </button>
                      <button
                        onClick={() => onProcess(donor)}
                        className="px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-white/90 border border-gray-300 dark:border-white/20 bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/15 rounded-lg transition-colors flex items-center gap-1 whitespace-nowrap"
                      >
                        <Stethoscope className="w-3 h-3" /> Process
                      </button>
                      <button
                        onClick={(e) => onDelete(e, donor.id)}
                        className="px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-white/90 border border-gray-300 dark:border-white/20 bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/15 rounded-lg transition-colors flex items-center gap-1 whitespace-nowrap"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : isUnverified ? (
              pageRows.map((donor, idx) => (
                <tr
                  key={donor.id}
                  onClick={() => onRowClick(donor)}
                  className="group hover:bg-gray-50 dark:hover:bg-white/2 transition-colors cursor-pointer"
                >
                  <td className="px-3 py-3.5 text-gray-400 dark:text-white/30 text-xs">
                    {(safePage - 1) * perPage + idx + 1}
                  </td>
                  <td className="px-3 py-3.5 font-semibold text-black dark:text-white">
                    {donor.full_name}
                  </td>
                  <td className="px-3 py-3.5 text-gray-600 dark:text-white/60">
                    {donor.father_name || "-"}
                  </td>
                  <td className="px-3 py-3.5">
                    <span className="px-2 py-0.5 rounded-lg text-xs font-bold bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400">
                      {donor.blood_group}
                    </span>
                  </td>
                  <td className="px-3 py-3.5 text-gray-600 dark:text-white/60">
                    {donor.age ?? "-"}
                  </td>
                  <td className="px-3 py-3.5 text-gray-600 dark:text-white/60 capitalize">
                    {donor.gender || "-"}
                  </td>
                  <td className="px-3 py-3.5 text-gray-600 dark:text-white/60">
                    {[donor.area, donor.city].filter(Boolean).join(", ") ||
                      donor.address ||
                      "-"}
                  </td>
                  <td className="px-3 py-3.5 text-gray-600 dark:text-white/60 text-xs">
                    {donor.previous_donation_date
                      ? format(
                          new Date(donor.previous_donation_date),
                          "dd MMM yyyy",
                        )
                      : "-"}
                  </td>
                  <td className="px-3 py-3.5 text-gray-600 dark:text-white/60">
                    {donor.total_donations ?? 0}
                  </td>
                  <td className="px-3 py-3.5">
                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onRowClick(donor)}
                        className="px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-white/90 border border-gray-300 dark:border-white/20 bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/15 rounded-lg transition-colors flex items-center gap-1 whitespace-nowrap"
                      >
                        <CheckCircle className="w-3 h-3" /> Verify
                      </button>
                      <button
                        onClick={(e) => onDelete(e, donor.id)}
                        className="px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-white/90 border border-gray-300 dark:border-white/20 bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/15 rounded-lg transition-colors flex items-center gap-1 whitespace-nowrap"
                      >
                        <Trash2 className="w-3 h-3" /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              pageRows.map((donor, idx) => (
                <tr
                  key={donor.id}
                  onClick={() => onRowClick(donor)}
                  className="group hover:bg-gray-50 dark:hover:bg-white/2 transition-colors cursor-pointer"
                >
                  <td className="px-5 py-4 text-gray-400 dark:text-white/30 text-xs">
                    {(safePage - 1) * perPage + idx + 1}
                  </td>
                  <td className="px-5 py-4 font-mono text-xs text-gray-500 dark:text-white/40">
                    {donor.donor_code}
                  </td>
                  <td className="px-5 py-4 font-semibold text-black dark:text-white">
                    {donor.full_name}
                  </td>
                  <td className="px-5 py-4">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400">
                      {donor.blood_group}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-gray-600 dark:text-white/60">
                    {donor.phone}
                  </td>
                  <td className="px-5 py-4 text-gray-500 dark:text-white/40 text-xs">
                    {statusFilter === "anniversaries"
                      ? donor.date_of_wedding
                        ? format(new Date(donor.date_of_wedding), "dd MMM")
                        : "—"
                      : donor.created_at
                        ? format(new Date(donor.created_at), "dd MMM yyyy")
                        : "—"}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold ${statusColors[donor.status]}`}
                    >
                      {STATUS_LABEL[donor.status]}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div
                      className="flex items-center gap-1.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {statusFilter === "birthdays" && (
                        <button
                          onClick={(e) => onSendBirthday(e, donor.id)}
                          disabled={sendingEmailId === donor.id}
                          className="px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-white/90 border border-gray-300 dark:border-white/20 bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/15 rounded-lg transition-colors flex items-center gap-1 whitespace-nowrap disabled:opacity-40"
                        >
                          <Mail className="w-3 h-3" />
                          {sendingEmailId === donor.id
                            ? "Sending…"
                            : "Send Email"}
                        </button>
                      )}
                      {statusFilter === "anniversaries" && (
                        <button
                          onClick={(e) => onSendAnniversary(e, donor.id)}
                          disabled={sendingAnnivEmailId === donor.id}
                          className="px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-white/90 border border-gray-300 dark:border-white/20 bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/15 rounded-lg transition-colors flex items-center gap-1 whitespace-nowrap disabled:opacity-40"
                        >
                          <Mail className="w-3 h-3" />
                          {sendingAnnivEmailId === donor.id
                            ? "Sending…"
                            : "Send Email"}
                        </button>
                      )}
                      <button
                        onClick={(e) => onDelete(e, donor.id)}
                        className="px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-white/90 border border-gray-300 dark:border-white/20 bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/15 rounded-lg transition-colors flex items-center gap-1 whitespace-nowrap"
                      >
                        <Trash2 className="w-3 h-3" /> Discard
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination footer */}
      {!isBinTab && visibleList.length > 0 && (
        <div className="px-5 py-4 border-t border-gray-100 dark:border-white/5 flex items-center justify-between flex-wrap gap-3">
          <p className="text-xs text-gray-400 dark:text-white/30">
            Showing {Math.min((safePage - 1) * perPage + 1, visibleList.length)}
            –{Math.min(safePage * perPage, visibleList.length)} of{" "}
            {visibleList.length} entries
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => handlePageChange(safePage - 1)}
              disabled={safePage === 1}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white/70 hover:bg-gray-200 dark:hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              ← Prev
            </button>
            {pageNumbers().map((p, i) =>
              p === "…" ? (
                <span
                  key={`ellipsis-${i}`}
                  className="px-2 text-gray-400 dark:text-white/20 text-xs"
                >
                  …
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => handlePageChange(p as number)}
                  className={`w-8 h-8 text-xs font-bold rounded-lg transition-colors ${
                    p === safePage
                      ? "bg-black dark:bg-white text-white dark:text-black"
                      : "bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white/70 hover:bg-gray-200 dark:hover:bg-white/20"
                  }`}
                >
                  {p}
                </button>
              ),
            )}
            <button
              onClick={() => handlePageChange(safePage + 1)}
              disabled={safePage === totalPages}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-white/70 hover:bg-gray-200 dark:hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
