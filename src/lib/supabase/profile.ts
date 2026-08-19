import type { SupabaseClient } from "@supabase/supabase-js";
import type { ResidentProfile, ResidentRole } from "@/lib/community-types";

type PhoneRow = {
  phone_number: string;
  display_order: number;
};

type ProfileRow = {
  user_id: string;
  home_id: number;
  home_number: string;
  household_name: string;
  initials: string;
  accent: string;
  role: ResidentRole;
  approved: boolean;
  must_change_password: boolean;
  resident_phones: PhoneRow[] | null;
};

export async function fetchResidentProfile(client: SupabaseClient, userId: string): Promise<ResidentProfile> {
  const { data, error } = await client
    .from("profiles")
    .select(
      "user_id, home_id, home_number, household_name, initials, accent, role, approved, must_change_password, resident_phones(phone_number, display_order)",
    )
    .eq("user_id", userId)
    .single();

  if (error || !data) {
    throw new Error("Esta cuenta todavía no tiene un domicilio autorizado.");
  }

  const row = data as ProfileRow;
  const phones = [...(row.resident_phones ?? [])].sort((a, b) => a.display_order - b.display_order);

  return {
    userId: row.user_id,
    homeId: row.home_id,
    homeNumber: row.home_number,
    householdName: row.household_name,
    initials: row.initials,
    accent: row.accent,
    role: row.role,
    approved: row.approved,
    mustChangePassword: row.must_change_password,
    phoneNumbers: phones.map((phone) => phone.phone_number),
  };
}
