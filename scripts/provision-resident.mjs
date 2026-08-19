import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secretKey = process.env.SUPABASE_SECRET_KEY;

if (!url || !secretKey || /PEGA_AQUI/i.test(secretKey)) {
  console.error("Configura SUPABASE_SECRET_KEY en .env.local antes de crear la cuenta.");
  process.exit(1);
}

const admin = createClient(url, secretKey, {
  auth: { autoRefreshToken: false, detectSessionInUrl: false, persistSession: false },
});

const resident = {
  homeNumber: "607",
  householdName: "Familia Castañeda Martínez",
  initials: "CM",
  phones: ["639 112 3516", "639 471 6134"],
  role: "admin",
};
const email = `casa-${resident.homeNumber}@residentes.quintas-mariana.invalid`;

const { data: home, error: homeError } = await admin
  .from("homes")
  .select("id, status")
  .eq("address_number", resident.homeNumber)
  .single();

if (homeError || !home || home.status !== "occupied") {
  console.error("No se encontró la Casa 607 en el esquema.");
  process.exit(1);
}

const { data: userList, error: listError } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
if (listError) {
  console.error(`No pudimos revisar las cuentas: ${listError.message}`);
  process.exit(1);
}

let user = userList.users.find((candidate) => candidate.email === email);
if (!user) {
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: "vecino",
    email_confirm: true,
    app_metadata: { home_number: resident.homeNumber, role: resident.role },
  });
  if (error || !data.user) {
    console.error(`No pudimos crear la cuenta: ${error?.message ?? "respuesta vacía"}`);
    process.exit(1);
  }
  user = data.user;
}

const { error: profileError } = await admin.from("profiles").upsert({
  user_id: user.id,
  home_id: home.id,
  home_number: resident.homeNumber,
  household_name: resident.householdName,
  initials: resident.initials,
  role: resident.role,
  approved: true,
  must_change_password: true,
}, { onConflict: "user_id" });

if (profileError) {
  console.error(`No pudimos guardar el perfil: ${profileError.message}`);
  process.exit(1);
}

const { error: deletePhonesError } = await admin.from("resident_phones").delete().eq("profile_id", user.id);
if (deletePhonesError) {
  console.error(`No pudimos actualizar los teléfonos: ${deletePhonesError.message}`);
  process.exit(1);
}

const { error: phonesError } = await admin.from("resident_phones").insert(
  resident.phones.map((phoneNumber, index) => ({ profile_id: user.id, phone_number: phoneNumber, display_order: index })),
);
if (phonesError) {
  console.error(`No pudimos guardar los teléfonos: ${phonesError.message}`);
  process.exit(1);
}

console.log("Cuenta de la Casa 607 lista. Usuario: 607 · contraseña temporal: vecino");
