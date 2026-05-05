import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Donor, DonorFormData } from "@/types/donor";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "https://dummy.supabase.co";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "dummy_key";
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export function getAdminClient(): SupabaseClient {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if( !serviceKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
    return createClient(SUPABASE_URL, serviceKey, {
        auth: { autoRefreshToken:false, persistSession:false },
    });
}

async function generateDonorCode(db: SupabaseClient): Promise<string> {
    const year = new Date().getFullYear();
    const { count } = await db
        .from("donors")
        .select("*",{ count:"exact", head:true });

    const seq = String((count ?? 0)+1).padStart(5,"0");
    return `BB-${year}-${seq}`;
}

export async function insertDonor(
    formData: DonorFormData,
    source: "qr" | "direct" | "admin" = "qr"
): Promise<Donor> {
    const db = getAdminClient();
    const donor_code = await generateDonorCode(db);

    const payload: any = {
        ...formData,
        donor_code,
        source,
        status: "pending",
    };

    if (payload.date_of_wedding === "") {
        payload.date_of_wedding = null;
    }

    const { data, error } = await db
        .from("donors")
        .insert(payload)
        .select()
        .single();

        if(error) throw new Error(error.message);
        return data as Donor;
}

export async function checkDuplicateDonor(phone: string): Promise<boolean> {
    const today = new Date().toISOString().split("T")[0];
    const { count } = await supabase
       .from("donors")
       .select("id", { count: "exact", head:true })
       .eq("phone", phone)
       .gte("created_at",`${today}T00:00:00.000Z`)
    
       return (count ?? 0) > 0;
}

export async function getDonorByCode(
    donor_code: string
): Promise <Partial<Donor> | null> {
    const { data, error } = await supabase
      .from("donors")
      .select("id, full_name, donor_code, blood_group, status, city, state, created_at")
      .eq("donor_code",donor_code)
      .single();
    
    if(error) return null;
    return data;
}

export async function getDonorStats(){
    const db = getAdminClient();
    const [total, today, allStatuses, bloodGroups, binCount] = await Promise.all([
        db.from("donors").select("*", { count: "exact", head: true }).is("deleted_at", null),
        db.from("donors").select("*", { count: "exact", head: true })
          .gte("created_at", new Date().toISOString().split("T")[0])
          .is("deleted_at", null),
        db.from("donors").select("status").is("deleted_at", null),
        db.from("donors").select("blood_group").is("deleted_at", null),
        db.from("donors").select("*", { count: "exact", head: true }).not("deleted_at", "is", null),
    ]).catch(async () => {
        // Fallback if deleted_at column doesn't exist yet
        const [t, td, s, bg] = await Promise.all([
            db.from("donors").select("*", { count: "exact", head: true }),
            db.from("donors").select("*", { count: "exact", head: true })
              .gte("created_at", new Date().toISOString().split("T")[0]),
            db.from("donors").select("status"),
            db.from("donors").select("blood_group"),
        ]);
        return [t, td, s, bg, { count: 0 }];
    });

    const statusCounts: Record<string, number> = {};
    (allStatuses.data ?? []).forEach(({ status }: { status: string }) => {
        statusCounts[status] = (statusCounts[status] ?? 0) + 1;
    });

    const groupCounts: Record<string, number> = {};
    (bloodGroups.data ?? []).forEach(({ blood_group }: { blood_group: string }) => {
        groupCounts[blood_group] = (groupCounts[blood_group] ?? 0) + 1;
    });

    return {
        total: total.count ?? 0,
        today: today.count ?? 0,
        pending: statusCounts["pending"] ?? 0,
        verified: statusCounts["verified"] ?? 0,
        approved: statusCounts["approved"] ?? 0,
        donated: statusCounts["donated"] ?? 0,
        issued: statusCounts["issued"] ?? 0,
        rejected: statusCounts["rejected"] ?? 0,
        bin: binCount.count ?? 0,
        bloodGroupBreakdown: groupCounts,
    };
}

export async function getDonors(bin = false): Promise<Donor[]> {
    const db = getAdminClient();
    const query = db.from("donors").select("*").order("created_at", { ascending: false });
    const { data, error } = bin
        ? await query.not("deleted_at", "is", null)
        : await query.is("deleted_at", null);

    if (error) {
        // If deleted_at column doesn't exist yet, fall back to fetching all (non-bin) donors
        if (!bin && error.message?.includes("deleted_at")) {
            const { data: allData, error: allError } = await db
                .from("donors").select("*").order("created_at", { ascending: false });
            if (allError) throw new Error(allError.message);
            return allData as Donor[];
        }
        throw new Error(error.message);
    }
    return data as Donor[];
}

export async function softDeleteDonor(id: string): Promise<void> {
    const db = getAdminClient();
    const { error } = await db
        .from("donors")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", id);
    if (error) throw new Error(error.message);
}

export async function restoreDonor(id: string): Promise<Donor> {
    const db = getAdminClient();
    const { data, error } = await db
        .from("donors")
        .update({ deleted_at: null })
        .eq("id", id)
        .select()
        .single();
    if (error) throw new Error(error.message);
    return data as Donor;
}

export async function permanentDeleteDonor(id: string): Promise<void> {
    const db = getAdminClient();
    const { error } = await db
        .from("donors")
        .delete()
        .eq("id", id);
    if (error) throw new Error(error.message);
}

export async function updateDonor(id: string, updates: Partial<Donor>): Promise<Donor> {
    const db = getAdminClient();
    const { data, error } = await db
        .from("donors")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
    
    if (error) throw new Error(error.message);
    return data as Donor;
}

