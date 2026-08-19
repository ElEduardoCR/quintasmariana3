import { createClient, SupabaseClient, User } from "@supabase/supabase-js";

type AdminContext = {
  admin: SupabaseClient;
  user: User;
};

export class AdminAuthError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
  }
}

function serverConfiguration() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!url || !publishableKey || !secretKey || /PEGA_AQUI/i.test(secretKey)) {
    throw new AdminAuthError("La administración de accesos no está configurada.", 503);
  }

  return { url, publishableKey, secretKey };
}

export async function requireAdmin(request: Request): Promise<AdminContext> {
  const authorization = request.headers.get("authorization") ?? "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!token) throw new AdminAuthError("Sesión requerida.", 401);

  const { url, publishableKey, secretKey } = serverConfiguration();
  const userClient = createClient(url, publishableKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { autoRefreshToken: false, detectSessionInUrl: false, persistSession: false },
  });

  const { data: userData, error: userError } = await userClient.auth.getUser(token);
  if (userError || !userData.user) throw new AdminAuthError("Sesión inválida.", 401);

  const { data: profile, error: profileError } = await userClient
    .from("profiles")
    .select("role, approved, must_change_password")
    .eq("user_id", userData.user.id)
    .single();

  if (profileError || !profile || profile.role !== "admin" || !profile.approved || profile.must_change_password) {
    throw new AdminAuthError("No tienes permisos de administración.", 403);
  }

  const admin = createClient(url, secretKey, {
    auth: { autoRefreshToken: false, detectSessionInUrl: false, persistSession: false },
  });

  return { admin, user: userData.user };
}

export function adminErrorResponse(error: unknown) {
  if (error instanceof AdminAuthError) {
    return Response.json({ error: error.message }, { status: error.status });
  }
  console.error("Error administrativo de Supabase", error instanceof Error ? error.message : "desconocido");
  return Response.json({ error: "No pudimos completar la operación." }, { status: 500 });
}
