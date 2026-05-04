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
    const [total, today, pending, bloodGroups] = await Promise.all(
        [
            db.from("donors").select("*",{count:"exact",head:true}),
            db
              .from("donors")
              .select("*", {count: "exact", head:true })
              .gte("created_at", new Date().toISOString().split("T")[0]),
            db
              .from("donors")
              .select("*", {count: "exact", head:true })
              .eq("status","pending"),
            db.from("donors").select("blood_group"),    
        ]);
    
    const groupCounts: Record<string, number> = {};
    (bloodGroups.data ?? []).forEach(({ blood_group }: { blood_group:string }) => {
        groupCounts[blood_group] = (groupCounts[blood_group] ?? 0) +1;
    });
    
    return{
        total: total.count ?? 0,
        today: today.count ?? 0,
        pending: pending.count ?? 0,
        bloodGroupBreakdown: groupCounts,
    };
}

export async function getDonors(): Promise<Donor[]> {
    const db = getAdminClient();
    const { data, error } = await db
        .from("donors")
        .select("*")
        .order("created_at", { ascending: false });
    
    if (error) throw new Error(error.message);
    return data as Donor[];
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

