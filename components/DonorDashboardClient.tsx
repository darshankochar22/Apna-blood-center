"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Donor, DonorStatus, BLOOD_GROUPS } from "@/types/donor";
import { fetchDonorsAction, updateDonorAction, fetchStatsAction, sendBirthdayEmailAction } from "@/app/actions";
import { format } from "date-fns";
import { User, Activity, FileText, CheckCircle, Clock, XCircle, Search, Droplet, Heart, ChevronRight, X } from "lucide-react";
import { Field, Input, Toggle, Select } from "./Formelements";

const statusColors: Record<DonorStatus, string> = {
  pending: "bg-white/10 text-white border-white/20",
  verified: "bg-white/20 text-white border-white/30",
  approved: "bg-white/30 text-white border-white/40",
  donated: "bg-white text-black border-white",
  rejected: "bg-transparent text-white/50 border-white/10",
};

export default function DonorDashboardClient() {
  const searchParams = useSearchParams();
  const statusFilter = searchParams.get("status");

  const [donors, setDonors] = useState<Donor[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedDonor, setSelectedDonor] = useState<Donor | null>(null);
  
  // Advanced Filters
  const [filterBloodGroup, setFilterBloodGroup] = useState("");
  const [filterGender, setFilterGender] = useState("");
  const [filterDonationType, setFilterDonationType] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const [donorsRes, statsRes] = await Promise.all([
      fetchDonorsAction(),
      fetchStatsAction(),
    ]);
    if (donorsRes.success) setDonors(donorsRes.data);
    if (statsRes.success) setStats(statsRes.data);
    setLoading(false);
  }

  const filteredDonors = donors.filter(
    (d) => {
      let matchesStatus = true;
      if (statusFilter === "birthdays") {
        if (!d.dob) return false;
        matchesStatus = true; // Show everyone, just sorted
      } else if (statusFilter === "approved") {
        matchesStatus = d.status === "approved" || d.status === "donated";
      } else if (statusFilter) {
        matchesStatus = d.status === statusFilter;
      }

      const matchesSearch = d.full_name.toLowerCase().includes(search.toLowerCase()) ||
                            d.donor_code.toLowerCase().includes(search.toLowerCase()) ||
                            d.phone.includes(search);
                            
      const matchesBG = filterBloodGroup ? d.blood_group === filterBloodGroup : true;
      const matchesGender = filterGender ? d.gender === filterGender : true;
      const matchesDonationType = filterDonationType ? d.type_of_donation === filterDonationType : true;

      return matchesStatus && matchesSearch && matchesBG && matchesGender && matchesDonationType;
    }
  ).sort((a, b) => {
      if (statusFilter === "birthdays") {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const getDays = (dateStr: string) => {
              const d = new Date(dateStr);
              d.setFullYear(today.getFullYear());
              if (d < today) d.setFullYear(today.getFullYear() + 1);
              return Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          };
          return getDays(a.dob) - getDays(b.dob);
      }
      return new Date(b.created_at || "").getTime() - new Date(a.created_at || "").getTime();
  });

  async function handleStatusUpdate(id: string, newStatus: DonorStatus, extraUpdates: Partial<Donor> = {}) {
    const res = await updateDonorAction(id, { status: newStatus, ...extraUpdates });
    if (res.success) {
      setDonors(donors.map((d) => (d.id === id ? res.data : d)));
      setSelectedDonor(res.data);
      loadData(); // Refresh stats
    } else {
      alert("Error: " + res.error);
    }
  }

  const [sendingEmailId, setSendingEmailId] = useState<string | null>(null);

  async function handleSendBirthday(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    if(confirm("Send automated birthday invitation to this donor?")) {
      setSendingEmailId(id);
      const res = await sendBirthdayEmailAction(id);
      setSendingEmailId(null);
      if(res.success) {
        alert("Birthday invitation sent successfully!");
      } else {
        alert("Failed: " + res.error);
      }
    }
  }

  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto space-y-8 bg-black min-h-screen text-white">
      {/* HEADER & STATS */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-6">CRM Dashboard</h1>
        {loading ? (
          <div className="animate-pulse flex gap-4 h-32">
            {[1, 2, 3, 4].map(i => <div key={i} className="flex-1 bg-white/5 rounded-2xl"></div>)}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={<User className="text-white" />} label="Total Donors" value={stats?.total || 0} />
            <StatCard icon={<Clock className="text-white/70" />} label="Pending Verification" value={stats?.pending || 0} />
            <StatCard icon={<Activity className="text-white" />} label="Today's Activity" value={stats?.today || 0} />
            <StatCard icon={<Droplet className="text-white" />} label="Top Blood Group" value={
              stats?.bloodGroupBreakdown ? Object.entries(stats.bloodGroupBreakdown).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || "-" : "-"
            } />
          </div>
        )}
      </div>

      {/* SEARCH & TABLE */}
      <div className="bg-[#111] rounded-3xl overflow-hidden flex flex-col h-[600px]">
        <div className="p-5 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">
            {statusFilter ? `${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)} Registrations` : "Recent Registrations"}
          </h2>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              placeholder="Search donor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-black rounded-xl py-2 pl-10 pr-4 text-sm text-white outline-none focus:bg-[#222] transition-colors"
            />
          </div>
        </div>

        {/* FILTERS BAR */}
        <div className="px-5 pb-5 border-b border-white/5 flex items-center gap-4 flex-wrap">
            <select 
              value={filterBloodGroup}
              onChange={e => setFilterBloodGroup(e.target.value)}
              className="bg-black border border-white/10 rounded-lg px-3 py-2 text-sm outline-none text-white/70 focus:text-white appearance-none cursor-pointer hover:bg-white/5 transition-colors"
            >
              <option value="">All Blood Groups</option>
              {BLOOD_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>

            <select 
              value={filterGender}
              onChange={e => setFilterGender(e.target.value)}
              className="bg-black border border-white/10 rounded-lg px-3 py-2 text-sm outline-none text-white/70 focus:text-white appearance-none cursor-pointer hover:bg-white/5 transition-colors"
            >
              <option value="">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>

            <select 
              value={filterDonationType}
              onChange={e => setFilterDonationType(e.target.value)}
              className="bg-black border border-white/10 rounded-lg px-3 py-2 text-sm outline-none text-white/70 focus:text-white appearance-none cursor-pointer hover:bg-white/5 transition-colors"
            >
              <option value="">All Donation Types</option>
              <option value="Whole Blood">Whole Blood</option>
              <option value="SDP (Platelets)">SDP (Platelets)</option>
              <option value="FFP (Plasma)">FFP (Plasma)</option>
            </select>

            {(filterBloodGroup || filterGender || filterDonationType) && (
              <button 
                onClick={() => { setFilterBloodGroup(""); setFilterGender(""); setFilterDonationType(""); }}
                className="text-xs font-bold uppercase tracking-wider text-white/40 hover:text-white transition-colors ml-2"
              >
                Clear Filters
              </button>
            )}
        </div>

        <div className="flex-1 overflow-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#0a0a0a] text-white/50 sticky top-0 uppercase text-xs tracking-wider">
              <tr>
                <th className="px-6 py-4 font-medium">Donor Code</th>
                <th className="px-6 py-4 font-medium">Full Name</th>
                <th className="px-6 py-4 font-medium">Blood Group</th>
                <th className="px-6 py-4 font-medium">Contact</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredDonors.map((donor) => (
                <tr 
                  key={donor.id} 
                  onClick={() => setSelectedDonor(donor)}
                  className="hover:bg-white/5 cursor-pointer transition-colors"
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
                        onClick={(e) => handleSendBirthday(e, donor.id)}
                        disabled={sendingEmailId === donor.id}
                        className="px-4 py-1.5 bg-white hover:bg-gray-200 text-black text-[11px] font-bold uppercase tracking-wider rounded-full transition-colors disabled:opacity-50"
                      >
                        {sendingEmailId === donor.id ? "Sending..." : "Send Invite"}
                      </button>
                    ) : (
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border uppercase tracking-wider ${statusColors[donor.status]}`}>
                        {donor.status}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {filteredDonors.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-white/30">
                    No donors found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL / SLIDEOVER FOR DONOR DETAILS & PROCESSING */}
      {selectedDonor && (
        <DonorProcessModal 
          donor={selectedDonor} 
          onClose={() => setSelectedDonor(null)} 
          onUpdate={handleStatusUpdate}
        />
      )}
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number }) {
  return (
    <div className="bg-[#111] border border-white/10 p-6 rounded-3xl flex items-start gap-4">
      <div className="p-3 bg-black rounded-2xl border border-white/10">{icon}</div>
      <div>
        <p className="text-white/40 text-sm font-medium mb-1">{label}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
    </div>
  );
}

// ─── Donor Processing Modal ──────────────────────────────────────────────────

function DonorProcessModal({ donor, onClose, onUpdate }: { donor: Donor, onClose: () => void, onUpdate: (id: string, s: DonorStatus, d?: any) => void }) {
  // Local state for forms
  const [typeOfDonor, setTypeOfDonor] = useState(donor.type_of_donor || "");
  const [typeOfDonation, setTypeOfDonation] = useState(donor.type_of_donation || "");

  const [bp, setBp] = useState(donor.blood_pressure || "");
  const [pulse, setPulse] = useState(donor.pulse || "");
  const [hb, setHb] = useState(donor.hemoglobin || "");
  const [temp, setTemp] = useState(donor.temperature || "");
  const [weight, setWeight] = useState(donor.weight || "");
  const [height, setHeight] = useState(donor.height || "");
  const [checkupBloodGroup, setCheckupBloodGroup] = useState(donor.blood_group || "");
  const [veinSuitable, setVeinSuitable] = useState(donor.vein_suitable_for_sdp || false);
  const [donationTime, setDonationTime] = useState(donor.donation_time || "");

  const [testHiv, setTestHiv] = useState(donor.test_hiv || false);
  const [testHbsag, setTestHbsag] = useState(donor.test_hbsag || false);
  const [testHcv, setTestHcv] = useState(donor.test_hcv || false);
  const [testVdrl, setTestVdrl] = useState(donor.test_vdrl || false);
  const [testMalaria, setTestMalaria] = useState(donor.test_malaria || false);

  const [saving, setSaving] = useState(false);

  const handleVerify = async () => {
    if (!typeOfDonor || !typeOfDonation) {
      alert("Please select Type of Donor and Type of Donation before verifying.");
      return;
    }
    setSaving(true);
    await onUpdate(donor.id, "verified", {
      type_of_donor: typeOfDonor,
      type_of_donation: typeOfDonation
    });
    setSaving(false);
  };

  const handleApprove = async () => {
    setSaving(true);
    await onUpdate(donor.id, "approved", {
      blood_pressure: bp,
      pulse: Number(pulse) || null,
      hemoglobin: Number(hb) || null,
      temperature: Number(temp) || null,
      weight: Number(weight) || null,
      height: Number(height) || null,
      blood_group: checkupBloodGroup as any,
      vein_suitable_for_sdp: veinSuitable,
      donation_time: donationTime || donor.created_at
    });
    setSaving(false);
  };

  const handleComplete = async () => {
    setSaving(true);
    await onUpdate(donor.id, "donated", {
      test_hiv: testHiv,
      test_hbsag: testHbsag,
      test_hcv: testHcv,
      test_vdrl: testVdrl,
      test_malaria: testMalaria,
    });
    setSaving(false);
  };

  const handleReject = async () => {
    if(confirm("Are you sure you want to reject this donor?")) {
      setSaving(true);
      await onUpdate(donor.id, "rejected");
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black animate-in fade-in duration-200 overflow-y-auto">
      <div className="w-full max-w-4xl mx-auto min-h-screen flex flex-col py-8 px-4 sm:px-8">
        
        {/* Header */}
        <div className="py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white text-black rounded-2xl flex items-center justify-center text-xl font-bold">
              {donor.blood_group}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{donor.full_name}</h2>
              <p className="text-sm font-mono text-white/40">{donor.donor_code}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 bg-[#111] rounded-xl hover:bg-[#222] text-white/60 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-12 pb-20 pt-4">
          
          {/* Status Tracker */}
          <div className="flex items-center justify-between relative">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/10 -z-10" />
            <StepIcon active={true} label="Form Filled" />
            <StepIcon active={["verified","approved","donated"].includes(donor.status)} label="Verified" />
            <StepIcon active={["approved","donated"].includes(donor.status)} label="Checkup & Approved" />
            <StepIcon active={donor.status === "donated"} label="Tests & Donated" />
          </div>

          {/* Detailed Info */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-6">
            <InfoItem label="Father's Name" value={donor.father_name} />
            <InfoItem label="Age / Gender" value={`${donor.age} yrs / ${donor.gender}`} />
            <InfoItem label="Phone / WhatsApp" value={`${donor.phone} / ${donor.whatsapp_no}`} />
            <InfoItem label="Occupation" value={donor.occupation} />
            <div className="col-span-2">
              <InfoItem label="Full Address" value={`${donor.address} - ${donor.pincode}`} />
            </div>
            <InfoItem label="Total Donations" value={donor.total_donations} />
            <InfoItem label="Apheresis Donations" value={donor.total_apheresis_donations} />
            {donor.vein_suitable_for_sdp !== null && donor.vein_suitable_for_sdp !== undefined && (
              <InfoItem label="Vein for SDP" value={donor.vein_suitable_for_sdp ? "Yes" : "No"} />
            )}
            <InfoItem label="Signature" value={donor.signature} />
            {donor.type_of_donor && <InfoItem label="Donor Type" value={donor.type_of_donor} />}
            {donor.type_of_donation && <InfoItem label="Donation Type" value={donor.type_of_donation} />}
            {donor.donation_time && <InfoItem label="Donation Time" value={format(new Date(donor.donation_time), "dd MMM yyyy, hh:mm a")} />}
            {donor.blood_pressure && <InfoItem label="Blood Pressure" value={donor.blood_pressure} />}
            {donor.pulse && <InfoItem label="Pulse" value={`${donor.pulse} bpm`} />}
            {donor.hemoglobin && <InfoItem label="Hemoglobin" value={`${donor.hemoglobin} g/dL`} />}
            {donor.temperature && <InfoItem label="Temperature" value={`${donor.temperature} °F`} />}
            {donor.weight && <InfoItem label="Weight" value={`${donor.weight} kg`} />}
            {donor.height && <InfoItem label="Height" value={`${donor.height} cm`} />}
          </div>

          {/* Dynamic Action Section based on Status */}
          <div className="bg-[#111] p-8 rounded-3xl space-y-6">
            
            {/* 1. PENDING STAGE */}
            {donor.status === "pending" && (
              <>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Verification Required</h3>
                  <p className="text-sm text-white/50 mb-6">Review the donor's submitted details physically and verify their identity.</p>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-6">
                  <Field label="Type of Donor">
                    <Select 
                      value={typeOfDonor} 
                      onChange={e => setTypeOfDonor(e.target.value)} 
                      options={[
                        { value: "Voluntary", label: "Voluntary" },
                        { value: "Replacement", label: "Replacement" },
                        { value: "Directed", label: "Directed" }
                      ]} 
                      placeholder="Select Donor Type"
                      className="bg-[#222] text-white" 
                    />
                  </Field>
                  <Field label="Type of Donation">
                    <Select 
                      value={typeOfDonation} 
                      onChange={e => setTypeOfDonation(e.target.value)} 
                      options={[
                        { value: "Whole Blood", label: "Whole Blood" },
                        { value: "SDP (Platelets)", label: "SDP (Platelets)" },
                        { value: "FFP (Plasma)", label: "FFP (Plasma)" }
                      ]} 
                      placeholder="Select Donation Type"
                      className="bg-[#222] text-white" 
                    />
                  </Field>
                </div>

                <div className="flex gap-4">
                  <button onClick={handleReject} disabled={saving} className="flex-1 py-4 bg-[#222] hover:bg-[#333] text-white font-bold rounded-xl transition">Reject</button>
                  <button onClick={handleVerify} disabled={saving} className="flex-[2] py-4 bg-white hover:bg-gray-200 text-black font-bold rounded-xl transition shadow-lg shadow-white/10 text-lg">Verify Donor</button>
                </div>
              </>
            )}

            {/* 2. VERIFIED STAGE -> Needs Checkup to Approve */}
            {donor.status === "verified" && (
              <>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Pre-Checkup Details</h3>
                  <p className="text-sm text-white/50 mb-6">Enter the medical officer's pre-checkup results to approve for donation.</p>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <Field label="HB (Hemoglobin) (g/dL)">
                    <Input value={hb} onChange={e => setHb(e.target.value)} type="number" step="0.1" placeholder="e.g. 14.5" className="bg-[#222] text-white" />
                  </Field>
                  <Field label="Pulse (bpm)">
                    <Input value={pulse} onChange={e => setPulse(e.target.value)} type="number" placeholder="e.g. 72" className="bg-[#222] text-white" />
                  </Field>
                  <Field label="BP (Blood Pressure)">
                    <Input value={bp} onChange={e => setBp(e.target.value)} placeholder="e.g. 120/80" className="bg-[#222] text-white" />
                  </Field>
                  <Field label="Temperature (°F)">
                    <Input value={temp} onChange={e => setTemp(e.target.value)} type="number" step="0.1" placeholder="e.g. 98.6" className="bg-[#222] text-white" />
                  </Field>
                  <Field label="Weight (kg)">
                    <Input value={weight} onChange={e => setWeight(e.target.value)} type="number" placeholder="e.g. 70" className="bg-[#222] text-white" />
                  </Field>
                  <Field label="Height (cm)">
                    <Input value={height} onChange={e => setHeight(e.target.value)} type="number" placeholder="e.g. 175" className="bg-[#222] text-white" />
                  </Field>
                  <Field label="Blood Group">
                    <Select 
                      value={checkupBloodGroup} 
                      onChange={e => setCheckupBloodGroup(e.target.value)} 
                      options={BLOOD_GROUPS.map(g => ({ value: g, label: g }))} 
                      className="bg-[#222] text-white" 
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-6 mt-6">
                  <div className="bg-[#1a1a1a] rounded-2xl p-5 border border-white/10">
                    <Toggle 
                      label="Vein suitable for SDP?" 
                      description="Assess during physical checkup"
                      checked={veinSuitable} 
                      onChange={setVeinSuitable} 
                    />
                  </div>
                  <Field label="Custom Donation Time (Optional)">
                    <Input 
                      type="datetime-local" 
                      value={donationTime} 
                      onChange={e => setDonationTime(e.target.value)} 
                      className="bg-[#222] text-white" 
                    />
                  </Field>
                </div>

                <div className="flex gap-4 pt-6">
                  <button onClick={handleReject} disabled={saving} className="flex-1 py-4 bg-[#222] hover:bg-[#333] text-white font-bold rounded-xl transition">Reject</button>
                  <button onClick={handleApprove} disabled={saving} className="flex-[2] py-4 bg-white hover:bg-gray-200 text-black font-bold rounded-xl transition shadow-lg shadow-white/10 text-lg">Approve & Proceed</button>
                </div>
              </>
            )}

            {/* 3. APPROVED STAGE -> Needs Tests to Complete */}
            {donor.status === "approved" && (
              <>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Post-Donation Test Reports</h3>
                  <p className="text-sm text-white/50 mb-6">Attach the rapid test results before marking the donation as complete.</p>
                </div>

                <div className="space-y-4">
                  <ReportToggle label="HIV" checked={testHiv} onChange={setTestHiv} />
                  <ReportToggle label="HBsAg (Hepatitis B)" checked={testHbsag} onChange={setTestHbsag} />
                  <ReportToggle label="HCV (Hepatitis C)" checked={testHcv} onChange={setTestHcv} />
                  <ReportToggle label="VDRL (Syphilis)" checked={testVdrl} onChange={setTestVdrl} />
                  <ReportToggle label="Malaria" checked={testMalaria} onChange={setTestMalaria} />
                </div>

                <div className="flex gap-4 pt-6">
                  <button onClick={handleReject} disabled={saving} className="flex-1 py-4 bg-[#222] hover:bg-[#333] text-white font-bold rounded-xl transition">Reject</button>
                  <button onClick={handleComplete} disabled={saving} className="flex-[2] py-4 bg-white hover:bg-gray-200 text-black font-bold rounded-xl transition shadow-lg shadow-white/10 text-lg">Complete Donation</button>
                </div>
              </>
            )}

            {/* 4. COMPLETED OR REJECTED */}
            {(donor.status === "donated" || donor.status === "rejected") && (
              <div className="text-center py-6">
                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 ${donor.status === 'donated' ? 'bg-white text-black' : 'bg-[#222] text-white/50'}`}>
                  {donor.status === 'donated' ? <CheckCircle className="w-10 h-10" /> : <XCircle className="w-10 h-10" />}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {donor.status === 'donated' ? "Donation Completed" : "Donor Rejected"}
                </h3>
                <p className="text-white/40">This donor's process has been finalized.</p>
              </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
}

function StepIcon({ active, label }: { active: boolean, label: string }) {
  return (
    <div className="flex flex-col items-center gap-3 bg-black z-10 px-4">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 ${active ? 'bg-white text-black' : 'bg-[#111] text-white/30'}`}>
        {active ? <CheckCircle className="w-5 h-5" /> : <div className="w-2.5 h-2.5 rounded-full bg-white/30" />}
      </div>
      <span className={`text-[11px] font-bold uppercase tracking-wider ${active ? 'text-white' : 'text-white/40'}`}>{label}</span>
    </div>
  )
}

function ReportToggle({ label, checked, onChange }: { label: string, checked: boolean, onChange: (val: boolean) => void }) {
  return (
    <div className="flex items-center justify-between p-5 rounded-2xl bg-[#222]">
      <span className="text-sm font-medium text-white">{label} Result: <span className={checked ? "text-white" : "text-white/50"}>{checked ? "Positive" : "Negative"}</span></span>
      <button 
        onClick={() => onChange(!checked)}
        className={`relative w-14 h-7 rounded-full transition-colors ${checked ? "bg-white" : "bg-black"}`}
      >
        <div className={`absolute top-1 left-1 w-5 h-5 rounded-full transition-transform ${checked ? "translate-x-7 bg-black" : "translate-x-0 bg-white/50"}`} />
      </button>
    </div>
  );
}

function InfoItem({ label, value }: { label: string, value: string | number | boolean }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wider text-white/50 font-semibold mb-1">{label}</p>
      <p className="text-sm text-white font-medium">{value || "-"}</p>
    </div>
  )
}
