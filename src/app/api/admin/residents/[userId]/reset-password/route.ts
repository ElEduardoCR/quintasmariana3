import { adminErrorResponse, requireAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function POST(request: Request, context: { params: Promise<{ userId: string }> }) {
  try {
    const { admin } = await requireAdmin(request);
    const { userId } = await context.params;
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)) {
      return Response.json({ error: "Residente inválido." }, { status: 400 });
    }

    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .select("home_number")
      .eq("user_id", userId)
      .single();
    if (profileError || !profile) return Response.json({ error: "Residente no encontrado." }, { status: 404 });

    const { error: passwordError } = await admin.auth.admin.updateUserById(userId, { password: "vecino" });
    if (passwordError) throw passwordError;

    const { error: flagError } = await admin
      .from("profiles")
      .update({ must_change_password: true, password_changed_at: null, updated_at: new Date().toISOString() })
      .eq("user_id", userId);
    if (flagError) throw flagError;

    return Response.json({ houseNumber: profile.home_number, temporaryPassword: "vecino" });
  } catch (error) {
    return adminErrorResponse(error);
  }
}
