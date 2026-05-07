"use server";
import { Donor, DonorFormData } from "@/types/donor";
import type { ReceiptCreateInput } from "@/types/receipt";
import { getDonors, updateDonor, getDonorStats, insertDonor, softDeleteDonor, restoreDonor, permanentDeleteDonor, insertReceipt, getReceipts } from "@/lib/supabase";
import { sendThankYouEmail, sendBirthdayEmail, sendAnniversaryEmail } from "@/lib/email";
import { sendThankYouSMS } from "@/lib/sms";

function errorMessage(e: unknown) {
    return e instanceof Error ? e.message : String(e);
}

export async function fetchDonorsAction() {
    try {
        const donors = await getDonors();
        return { success: true, data: donors };
    } catch (e: unknown) {
        return { success: false, error: errorMessage(e) };
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
    } catch (e: unknown) {
        return { success: false, error: errorMessage(e) };
    }
}

export async function fetchStatsAction() {
    try {
        const stats = await getDonorStats();
        return { success: true, data: stats };
    } catch (e: unknown) {
        return { success: false, error: errorMessage(e) };
    }
}

export async function createDonorAction(donorData: DonorFormData) {
    try {
        const newDonor = await insertDonor(donorData, "direct");
        return { success: true, data: newDonor };
    } catch (e: unknown) {
        return { success: false, error: errorMessage(e) };
    }
}

export async function fetchBinDonorsAction() {
    try {
        const donors = await getDonors(true);
        return { success: true, data: donors };
    } catch (e: unknown) {
        return { success: false, error: errorMessage(e) };
    }
}

export async function softDeleteDonorAction(id: string) {
    try {
        await softDeleteDonor(id);
        return { success: true };
    } catch (e: unknown) {
        return { success: false, error: errorMessage(e) };
    }
}

export async function restoreDonorAction(id: string) {
    try {
        const donor = await restoreDonor(id);
        return { success: true, data: donor };
    } catch (e: unknown) {
        return { success: false, error: errorMessage(e) };
    }
}

export async function permanentDeleteDonorAction(id: string) {
    try {
        await permanentDeleteDonor(id);
        return { success: true };
    } catch (e: unknown) {
        return { success: false, error: errorMessage(e) };
    }
}

export async function sendAnniversaryEmailAction(donorId: string) {
    try {
        const donors = await getDonors();
        const donor = donors.find(d => d.id === donorId);

        if (!donor) throw new Error("Donor not found");
        if (!donor.email) throw new Error("This donor does not have an email address");

        const res = await sendAnniversaryEmail(donor);
        if (!res.success) throw new Error(res.error || "Failed to send email");

        return { success: true };
    } catch (e: unknown) {
        return { success: false, error: errorMessage(e) };
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
    } catch (e: unknown) {
        return { success: false, error: errorMessage(e) };
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Receipts
// ─────────────────────────────────────────────────────────────────────────────

export async function fetchReceiptsAction() {
  try {
    const receipts = await getReceipts();
    return { success: true, data: receipts };
  } catch (e: unknown) {
    return { success: false, error: errorMessage(e) };
  }
}

export async function createReceiptAction(input: ReceiptCreateInput) {
  try {
    const receipt = await insertReceipt(input);
    return { success: true, data: receipt };
  } catch (e: unknown) {
    return { success: false, error: errorMessage(e) };
  }
}
