import { houseNumberToEmail, isValidHouseNumber, normalizeHouseNumber } from "@/lib/auth";
import { adminErrorResponse, requireAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

type CreateResidentBody = {
  houseNumber?: string;
  householdName?: string;
  initials?: string;
  phoneNumbers?: string[];
};

export async function GET(request: Request) {
  try {
    const { admin } = await requireAdmin(request);
    const { data, error } = await admin
      .from("profiles")
      .select("user_id, home_number, household_name, initials, role, approved, must_change_password, resident_phones(phone_number, display_order)")
      .order("home_number");

    if (error) throw error;
    return Response.json({ residents: data });
  } catch (error) {
    return adminErrorResponse(error);
  }
}
export async function POST(request: Request) {
  let createdUserId: string | null = null;

  try {
    const { admin } = await requireAdmin(request);
    const body = await request.json() as CreateResidentBody;
    const houseNumber = normalizeHouseNumber(body.houseNumber ?? "");
    const householdName = body.householdName?.trim() ?? "";
    const initials = body.initials?.trim().toLocaleUpperCase("es") ?? "";
    const phoneNumbers = (body.phoneNumbers ?? []).map((phone) => phone.trim()).filter(Boolean).slice(0, 4);

    if (!isValidHouseNumber(houseNumber) || householdName.length < 2 || !/^.{1,4}$/.test(initials)) {
      return Response.json({ error: "Datos del residente incompletos." }, { status: 400 });
    }

    const { data: home, error: homeError } = await admin
      .from("homes")
      .select("id, status")
      .eq("address_number", houseNumber)
      .single();
    if (homeError || !home || home.status !== "occupied") {
      return Response.json({ error: "La casa no está disponible para registro." }, { status: 409 });
    }

    const { data: existing } = await admin.from("profiles").select("user_id").eq("home_number", houseNumber).maybeSingle();
    if (existing) return Response.json({ error: "La casa ya tiene una cuenta." }, { status: 409 });

    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email: houseNumberToEmail(houseNumber),
      password: "vecino",
      email_confirm: true,
      app_metadata: { home_number: houseNumber, role: "resident" },
    });
    if (authError || !authData.user) throw authError ?? new Error("No se creó la cuenta.");
    createdUserId = authData.user.id;

    const { error: profileError } = await admin.from("profiles").insert({
      user_id: createdUserId,
      home_id: home.id,
      home_number: houseNumber,
      household_name: householdName,
      initials,
      role: "resident",
      approved: true,
      must_change_password: true,
    });
    if (profileError) throw profileError;

    if (phoneNumbers.length > 0) {
      const { error: phonesError } = await admin.from("resident_phones").insert(
        phoneNumbers.map((phoneNumber, index) => ({ profile_id: createdUserId, phone_number: phoneNumber, display_order: index })),
      );
      if (phonesError) throw phonesError;
    }

    return Response.json({ houseNumber, temporaryPassword: "vecino" }, { status: 201 });
  } catch (error) {
    if (createdUserId) {
      try {
        const { admin } = await requireAdmin(request);
        await admin.auth.admin.deleteUser(createdUserId);
      } catch {
        // La FK elimina el perfil al retirar al usuario; si falla, la operación se revisa desde Supabase.
      }
    }
    return adminErrorResponse(error);
  }
}
