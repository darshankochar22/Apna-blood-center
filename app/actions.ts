"use server";
import { Donor, DonorStatus, DonorFormData } from "@/types/donor";
import { getDonors, updateDonor, getDonorStats, insertDonor, softDeleteDonor, restoreDonor, permanentDeleteDonor } from "@/lib/supabase";
import { sendThankYouEmail, sendBirthdayEmail } from "@/lib/email";
import { sendThankYouSMS } from "@/lib/sms";

export async function fetchDonorsAction() {
    try {
        const donors = await getDonors();
        return { success: true, data: donors };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function updateDonorAction(id: string, updates: Partial<Donor>) {
    try {
        const updated = await updateDonor(id, updates);
        if (updates.status === "donated") {
            if (updated.email) {
                await sendThankYouEmail(updated);
            }
            if (updated.phone) {
                await sendThankYouSMS(updated);
            }
        }
        
        return { success: true, data: updated };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function fetchStatsAction() {
    try {
        const stats = await getDonorStats();
        return { success: true, data: stats };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function createDonorAction(donorData: DonorFormData) {
    try {
        const newDonor = await insertDonor(donorData, "direct");
        return { success: true, data: newDonor };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function fetchBinDonorsAction() {
    try {
        const donors = await getDonors(true);
        return { success: true, data: donors };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function softDeleteDonorAction(id: string) {
    try {
        await softDeleteDonor(id);
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function restoreDonorAction(id: string) {
    try {
        const donor = await restoreDonor(id);
        return { success: true, data: donor };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function permanentDeleteDonorAction(id: string) {
    try {
        await permanentDeleteDonor(id);
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function sendBirthdayEmailAction(donorId: string) {
    try {
        const donors = await getDonors();
        const donor = donors.find(d => d.id === donorId);
        
        if (!donor) throw new Error("Donor not found");
        if (!donor.email) throw new Error("This donor does not have an email address");

        const res = await sendBirthdayEmail(donor);
        if (!res.success) throw new Error(res.error || "Failed to send email");

        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}
