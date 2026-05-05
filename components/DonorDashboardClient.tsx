"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Donor, DonorStatus } from "@/types/donor";
import {
  fetchDonorsAction, updateDonorAction, fetchStatsAction,
  sendBirthdayEmailAction, fetchBinDonorsAction,
  softDeleteDonorAction, restoreDonorAction, permanentDeleteDonorAction,
} from "@/app/actions";
import { User, Activity, FileText, CheckCircle, Clock, XCircle, Droplet, Heart } from "lucide-react";
import { StatCard } from "./donor/StatCard";
import { StatusTabs } from "./donor/StatusTabs";
import { DonorTable } from "./donor/DonorTable";
import { DonorModal } from "./donor/DonorModal";

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
  const [sendingEmailId, setSendingEmailId] = useState<string | null>(null);

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

  const filteredDonors = donors.filter(d => {
    if (isBinTab) return false;
    let matchesStatus = true;
    if (statusFilter === "birthdays") {
      if (!d.dob) return false;
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
    if (statusFilter === "birthdays") {
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const getDays = (s: string) => {
        const d = new Date(s); d.setFullYear(today.getFullYear());
        if (d < today) d.setFullYear(today.getFullYear() + 1);
        return Math.ceil((d.getTime() - today.getTime()) / 86400000);
      };
      return getDays(a.dob) - getDays(b.dob);
    }
    return new Date(b.created_at || "").getTime() - new Date(a.created_at || "").getTime();
  });

  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto space-y-8 bg-gray-50 dark:bg-black min-h-screen text-black dark:text-white transition-colors duration-200">

      {/* Stats */}
      <div>
        <h1 className="text-3xl font-bold text-black dark:text-white mb-6">CRM Dashboard</h1>
        {loading ? (
          <div className="animate-pulse grid grid-cols-2 lg:grid-cols-4 gap-4 h-32">
            {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="bg-gray-200 dark:bg-white/5 rounded-2xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={<User />}       label="Total Donors"      value={stats?.total    ?? 0} />
            <StatCard icon={<Clock />}       label="Unverified"        value={stats?.pending  ?? 0} href="/?status=pending" />
            <StatCard icon={<FileText />}    label="Verified"          value={stats?.verified ?? 0} href="/?status=verified" />
            <StatCard icon={<CheckCircle />} label="Accepted"          value={stats?.approved ?? 0} href="/?status=approved" />
            <StatCard icon={<Heart />}       label="Donation Complete" value={stats?.donated  ?? 0} href="/?status=donated" />
            <StatCard icon={<Droplet />}     label="Issued"            value={stats?.issued   ?? 0} href="/?status=issued" />
            <StatCard icon={<XCircle />}     label="Rejected"          value={stats?.rejected ?? 0} href="/?status=rejected" />
            <StatCard icon={<Activity />}    label="Today's Activity"  value={stats?.today    ?? 0} />
          </div>
        )}
      </div>

      {/* Tabs */}
      <StatusTabs statusFilter={statusFilter} stats={stats} />

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
        onRowClick={setSelectedDonor}
        onDelete={handleDelete}
        onRestore={handleRestore}
        onPermanentDelete={handlePermanentDelete}
        onSendBirthday={handleSendBirthday}
      />

      {/* Modal */}
      {selectedDonor && (
        <DonorModal
          donor={selectedDonor}
          onClose={() => setSelectedDonor(null)}
          onUpdate={handleStatusUpdate}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
