"use server";

import { Donor, DonorStatus, DonorFormData } from "@/types/donor";
import { getDonors, updateDonor, getDonorStats, insertDonor } from "@/lib/supabase";

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
