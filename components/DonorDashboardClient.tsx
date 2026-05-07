"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Donor, DonorStatus } from "@/types/donor";
import {
  fetchDonorsAction, updateDonorAction, fetchStatsAction,
  sendBirthdayEmailAction, sendAnniversaryEmailAction, fetchBinDonorsAction,
  softDeleteDonorAction, restoreDonorAction, permanentDeleteDonorAction,
} from "@/app/actions";
import { User, Activity, FileText, CheckCircle, Clock, XCircle, Droplet, Heart } from "lucide-react";
import { StatCard } from "./donor/StatCard";
import { DonorTable } from "./donor/DonorTable";
import { DonorModal } from "./donor/DonorModal";
import { ProcessModal } from "./donor/ProcessModal";
import { AcceptedProcessModal } from "./donor/AcceptedProcessModal";
import { TestResultsModal } from "./donor/TestResultsModal";
import { IssueModal, IssueFormData } from "./donor/IssueModal";
import { downloadCertificate } from "@/lib/downloadCertificate";
import { downloadTestReport } from "@/lib/downloadTestReport";
import { downloadIssueSlip } from "@/lib/downloadIssueSlip";

export default function DonorDashboardClient() {
  const searchParams = useSearchParams();
  const statusFilter = searchParams.get("status");
  const isBinTab = statusFilter === "bin";

  const [donors, setDonors] = useState<Donor[]>([]);
  const [binDonors, setBinDonors] = useState<Donor[]>([]);
  const [stats, setStats] = useState<{ total: number; today: number; pending: number; verified: number; approved: number; donated: number; issued: number; rejected: number; bin: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedDonor, setSelectedDonor] = useState<Donor | null>(null);
  const [processDonor, setProcessDonor] = useState<Donor | null>(null);
  const [acceptedProcessDonor, setAcceptedProcessDonor] = useState<Donor | null>(null);
  const [testResultsDonor, setTestResultsDonor] = useState<Donor | null>(null);
  const [issueModalDonor, setIssueModalDonor]   = useState<Donor | null>(null);
  const [sendingEmailId, setSendingEmailId] = useState<string | null>(null);
  const [sendingAnnivEmailId, setSendingAnnivEmailId] = useState<string | null>(null);

  const [filterBloodGroup, setFilterBloodGroup] = useState("");
  const [filterGender, setFilterGender] = useState("");
  const [filterDonationType, setFilterDonationType] = useState("");

  useEffect(() => { loadData(); }, []);
  useEffect(() => { if (isBinTab) loadBin(); }, [isBinTab]);

  async function loadData() {
    setLoading(true);
    const [donorsRes, statsRes] = await Promise.all([fetchDonorsAction(), fetchStatsAction()]);
    if (donorsRes.success && donorsRes.data) setDonors(donorsRes.data);
    if (statsRes.success && statsRes.data) setStats(statsRes.data as typeof stats);
    setLoading(false);
  }

  async function loadBin() {
    const res = await fetchBinDonorsAction();
    if (res.success && res.data) setBinDonors(res.data);
  }

  async function handleStatusUpdate(id: string, newStatus: DonorStatus, extra: Partial<Donor> = {}) {
    const res = await updateDonorAction(id, { status: newStatus, ...extra });
    if (res.success && res.data) {
      setDonors(prev => prev.map(d => d.id === id ? res.data! : d));
      setSelectedDonor(res.data ?? null);
      loadData();
    } else {
      alert("Error: " + res.error);
    }
  }

  async function handleProcess(
    id: string,
    decision: "approved" | "rejected",
    data: Partial<Donor>
  ) {
    const res = await updateDonorAction(id, { status: decision, ...data });
    if (res.success) { setProcessDonor(null); loadData(); }
    else alert("Error: " + res.error);
  }

  async function handleAcceptedProcess(id: string, data: Partial<Donor>) {
    const res = await updateDonorAction(id, { status: "donated", ...data });
    if (res.success) { setAcceptedProcessDonor(null); loadData(); }
    else alert("Error: " + res.error);
  }

  async function handleTestResults(id: string, data: Partial<Donor>) {
    const res = await updateDonorAction(id, { status: "issued", ...data });
    if (res.success) { setTestResultsDonor(null); loadData(); }
    else alert("Error: " + res.error);
  }

  async function handleIssueSubmit(id: string, data: Partial<Donor>, formData: IssueFormData) {
    const res = await updateDonorAction(id, { status: "completed", ...data });
    if (res.success) {
      const updatedDonor = { ...(issueModalDonor as Donor), status: "completed" as DonorStatus, ...data };
      setIssueModalDonor(null);
      loadData();
      downloadIssueSlip(updatedDonor, formData);
    } else {
      alert("Error saving issue record: " + res.error);
    }
  }

  async function handleDelete(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    if (!confirm("Move this donor to the Bin?")) return;
    const res = await softDeleteDonorAction(id);
    if (res.success) {
      setDonors(prev => prev.filter(d => d.id !== id));
      setSelectedDonor(null);
      loadData();
    } else {
      alert("Error: " + res.error);
    }
  }

  async function handleRestore(id: string) {
    const res = await restoreDonorAction(id);
    if (res.success) { setBinDonors(prev => prev.filter(d => d.id !== id)); loadData(); }
    else alert("Error: " + res.error);
  }

  async function handlePermanentDelete(id: string) {
    if (!confirm("Permanently delete this record? This cannot be undone.")) return;
    const res = await permanentDeleteDonorAction(id);
    if (res.success) { setBinDonors(prev => prev.filter(d => d.id !== id)); loadData(); }
    else alert("Error: " + res.error);
  }

  async function handleSendBirthday(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    if (!confirm("Send automated birthday invitation to this donor?")) return;
    setSendingEmailId(id);
    const res = await sendBirthdayEmailAction(id);
    setSendingEmailId(null);
    if (res.success) alert("Birthday invitation sent successfully!");
    else alert("Failed: " + res.error);
  }

  async function handleSendAnniversary(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    if (!confirm("Send anniversary wishes email to this donor?")) return;
    setSendingAnnivEmailId(id);
    const res = await sendAnniversaryEmailAction(id);
    setSendingAnnivEmailId(null);
    if (res.success) alert("Anniversary email sent successfully!");
    else alert("Failed: " + res.error);
  }

  const filteredDonors = donors.filter(d => {
    if (isBinTab) return false;
    let matchesStatus = true;
    if (statusFilter === "birthdays") {
      if (!d.dob) return false;
    } else if (statusFilter === "anniversaries") {
      if (!d.date_of_wedding) return false;
    } else if (statusFilter) {
      matchesStatus = d.status === statusFilter;
    }
    const matchesSearch =
      d.full_name.toLowerCase().includes(search.toLowerCase()) ||
      d.donor_code.toLowerCase().includes(search.toLowerCase()) ||
      d.phone.includes(search);
    const matchesBG = filterBloodGroup ? d.blood_group === filterBloodGroup : true;
    const matchesGender = filterGender ? d.gender === filterGender : true;
    const matchesDonationType = filterDonationType ? d.type_of_donation === filterDonationType : true;
    return matchesStatus && matchesSearch && matchesBG && matchesGender && matchesDonationType;
  }).sort((a, b) => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const getDaysUntil = (dateStr: string) => {
      const d = new Date(dateStr); d.setFullYear(today.getFullYear());
      if (d < today) d.setFullYear(today.getFullYear() + 1);
      return Math.ceil((d.getTime() - today.getTime()) / 86400000);
    };
    if (statusFilter === "birthdays") return getDaysUntil(a.dob) - getDaysUntil(b.dob);
    if (statusFilter === "anniversaries") return getDaysUntil(a.date_of_wedding!) - getDaysUntil(b.date_of_wedding!);
    return new Date(b.created_at || "").getTime() - new Date(a.created_at || "").getTime();
  });

  return (
    <div className="p-4 sm:p-6 space-y-8 bg-gray-50 dark:bg-black min-h-screen text-black dark:text-white transition-colors duration-200">

      {/* Table */}
      <DonorTable
        donors={donors}
        binDonors={binDonors}
        statusFilter={statusFilter}
        isBinTab={isBinTab}
        search={search}
        setSearch={setSearch}
        filterBloodGroup={filterBloodGroup}
        setFilterBloodGroup={setFilterBloodGroup}
        filterGender={filterGender}
        setFilterGender={setFilterGender}
        filterDonationType={filterDonationType}
        setFilterDonationType={setFilterDonationType}
        filteredDonors={filteredDonors}
        sendingEmailId={sendingEmailId}
        sendingAnnivEmailId={sendingAnnivEmailId}
        onRowClick={setSelectedDonor}
        onProcess={setProcessDonor}
        onAcceptedProcess={setAcceptedProcessDonor}
        onTestResults={setTestResultsDonor}
        onDownloadCert={downloadCertificate}
        onDelete={handleDelete}
        onRestore={handleRestore}
        onPermanentDelete={handlePermanentDelete}
        onSendBirthday={handleSendBirthday}
        onSendAnniversary={handleSendAnniversary}
        onIssueSlip={setIssueModalDonor}
        onDownloadTestReport={downloadTestReport}
      />

      {/* Detail Modal */}
      {selectedDonor && (
        <DonorModal
          donor={selectedDonor}
          onClose={() => setSelectedDonor(null)}
          onUpdate={handleStatusUpdate}
          onDelete={handleDelete}
        />
      )}

      {/* Process Modal (Verified → Accept/Reject with medical form) */}
      {processDonor && (
        <ProcessModal
          donor={processDonor}
          onClose={() => setProcessDonor(null)}
          onSubmit={handleProcess}
        />
      )}

      {/* Accepted Process Modal (Accepted → Donated) */}
      {acceptedProcessDonor && (
        <AcceptedProcessModal
          donor={acceptedProcessDonor}
          onClose={() => setAcceptedProcessDonor(null)}
          onSubmit={handleAcceptedProcess}
        />
      )}

      {/* Test Results Modal (Donated → Issued) */}
      {testResultsDonor && (
        <TestResultsModal
          donor={testResultsDonor}
          onClose={() => setTestResultsDonor(null)}
          onSubmit={handleTestResults}
        />
      )}

      {/* Issue Modal (Issued — fill patient/transfusion details + print slip) */}
      {issueModalDonor && (
        <IssueModal
          donor={issueModalDonor}
          onClose={() => setIssueModalDonor(null)}
          onSubmit={handleIssueSubmit}
        />
      )}
    </div>
  );
}
