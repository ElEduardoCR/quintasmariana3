"use client";

import { ArrowRight, Eye, EyeOff, Home, KeyRound, LoaderCircle, ShieldCheck, Trees } from "lucide-react";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { CommunityDashboard } from "@/components/community-dashboard";
import { houseNumberToEmail, isValidHouseNumber, normalizeHouseNumber } from "@/lib/auth";
import type { ResidentProfile } from "@/lib/community-types";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { fetchResidentProfile } from "@/lib/supabase/profile";

function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#EEF2EB] px-4 py-10 text-[#253830]">
      <div className="absolute inset-0 opacity-50 [background-image:radial-gradient(circle_at_15%_20%,#BCD2C2_0,transparent_28%),radial-gradient(circle_at_85%_75%,#F2CFC2_0,transparent_27%)]" />
      <div className="absolute left-[8%] top-[12%] hidden text-[#789789]/25 sm:block"><Trees size={120} strokeWidth={1} /></div>
      <div className="relative w-full max-w-[440px] rounded-[30px] border border-white/80 bg-[#FCFDF9]/95 p-7 shadow-[0_30px_80px_rgba(42,65,55,0.16)] backdrop-blur sm:p-9">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#315E50] text-[#EFF4E9] shadow-lg shadow-[#315E50]/15">
            <Trees size={23} strokeWidth={1.8} />
          </div>
          <div>
            <p className="font-serif text-[23px] leading-none text-[#21372F]">Quintas Mariana</p>
            <p className="mt-1.5 text-[9px] font-extrabold uppercase tracking-[0.2em] text-[#7B857F]">Acceso de residentes</p>
          </div>
        </div>
        {children}
      </div>
    </main>
  );
}

function LoadingScreen() {
  return (
    <AuthShell>
      <div className="flex min-h-52 flex-col items-center justify-center text-center">
        <LoaderCircle className="animate-spin text-[#315E50]" size={28} />
        <p className="mt-4 text-sm font-semibold text-[#5E6D66]">Verificando tu acceso…</p>
      </div>
    </AuthShell>
  );
}

function LoginForm({ onAuthenticated }: { onAuthenticated: (profile: ResidentProfile) => void }) {
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const homeNumber = normalizeHouseNumber(String(formData.get("homeNumber") ?? ""));
    const password = String(formData.get("password") ?? "");

    if (!isValidHouseNumber(homeNumber)) {
      setError("Escribe un número de casa de tres dígitos.");
      return;
    }

    setBusy(true);
    setError(null);

    const supabase = getSupabaseBrowserClient();
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: houseNumberToEmail(homeNumber),
      password,
    });

    if (signInError || !data.user) {
      setBusy(false);
      setError("Número de casa o contraseña incorrectos.");
      return;
    }

    try {
      const profile = await fetchResidentProfile(supabase, data.user.id);
      if (!profile.approved) {
        await supabase.auth.signOut();
        setError("Esta cuenta está pendiente de autorización.");
      } else {
        onAuthenticated(profile);
      }
    } catch (profileError) {
      await supabase.auth.signOut();
      setError(profileError instanceof Error ? profileError.message : "No pudimos validar el domicilio.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#668074]">Bienvenido</p>
      <h1 className="mt-2 font-serif text-[34px] leading-tight text-[#20372F]">Entra a tu comunidad</h1>
      <p className="mt-3 text-sm leading-6 text-[#707A74]">Usa el número de tu casa y la contraseña que te entregó la administración.</p>

      <form className="mt-7 space-y-4" onSubmit={handleSubmit}>
        <label className="form-field">
          <span>Número de casa</span>
          <div className="relative">
            <Home className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#819087]" size={17} />
            <input className="w-full pl-10" name="homeNumber" inputMode="numeric" autoComplete="username" maxLength={3} placeholder="Ej. 607" required />
          </div>
        </label>

        <label className="form-field">
          <span>Contraseña</span>
          <div className="relative">
            <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#819087]" size={17} />
            <input className="w-full px-10" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" required />
            <button type="button" className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#76857D]" onClick={() => setShowPassword((current) => !current)} aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}>
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </label>

        {error && <p className="rounded-xl border border-[#EBCBC1] bg-[#FFF6F2] px-3.5 py-3 text-xs font-semibold leading-5 text-[#A65340]">{error}</p>}

        <button className="primary-button flex w-full justify-center py-3.5" type="submit" disabled={busy}>
          {busy ? <LoaderCircle className="animate-spin" size={17} /> : <><span>Entrar</span><ArrowRight size={17} /></>}
        </button>
      </form>

      <p className="mt-6 text-center text-[11px] leading-5 text-[#8A948E]">Si olvidaste tu contraseña, solicita a la administración un acceso temporal.</p>
    </>
  );
}

function ChangePasswordForm({ profile, onChanged }: { profile: ResidentProfile; onChanged: (profile: ResidentProfile) => void }) {
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") ?? "");
    const confirmation = String(formData.get("confirmation") ?? "");

    if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      setError("Usa al menos 8 caracteres e incluye letras y números.");
      return;
    }
    if (password.toLocaleLowerCase("es") === "vecino") {
      setError("La nueva contraseña debe ser distinta a la temporal.");
      return;
    }
    if (password !== confirmation) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setBusy(true);
    setError(null);
    const supabase = getSupabaseBrowserClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setBusy(false);
      setError("No pudimos cambiar la contraseña. Intenta con una distinta.");
      return;
    }

    try {
      const refreshedProfile = await fetchResidentProfile(supabase, profile.userId);
      onChanged({ ...refreshedProfile, mustChangePassword: false });
    } catch {
      onChanged({ ...profile, mustChangePassword: false });
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E0EBE5] text-[#37675A]"><ShieldCheck size={22} /></div>
      <p className="mt-6 text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#668074]">Primer acceso · Casa {profile.homeNumber}</p>
      <h1 className="mt-2 font-serif text-[32px] leading-tight text-[#20372F]">Crea tu contraseña personal</h1>
      <p className="mt-3 text-sm leading-6 text-[#707A74]">Antes de ver el directorio debes reemplazar la contraseña temporal. Nadie podrá consultar la nueva contraseña.</p>

      <form className="mt-7 space-y-4" onSubmit={handleSubmit}>
        <label className="form-field">
          <span>Nueva contraseña</span>
          <div className="relative">
            <input className="w-full pr-10" name="password" type={showPassword ? "text" : "password"} autoComplete="new-password" required minLength={8} />
            <button type="button" className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#76857D]" onClick={() => setShowPassword((current) => !current)} aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}>
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </label>
        <label className="form-field">
          <span>Confirmar contraseña</span>
          <input name="confirmation" type={showPassword ? "text" : "password"} autoComplete="new-password" required minLength={8} />
        </label>
        <p className="text-[11px] leading-5 text-[#818B85]">Mínimo 8 caracteres, con letras y al menos un número.</p>
        {error && <p className="rounded-xl border border-[#EBCBC1] bg-[#FFF6F2] px-3.5 py-3 text-xs font-semibold leading-5 text-[#A65340]">{error}</p>}
        <button className="primary-button flex w-full justify-center py-3.5" type="submit" disabled={busy}>
          {busy ? <LoaderCircle className="animate-spin" size={17} /> : <><span>Guardar y continuar</span><ArrowRight size={17} /></>}
        </button>
      </form>
    </>
  );
}

export function AuthGate() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ResidentProfile | null>(null);

  const restoreSession = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      const currentProfile = await fetchResidentProfile(supabase, data.user.id);
      setProfile(currentProfile.approved ? currentProfile : null);
    } catch {
      await supabase.auth.signOut();
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => void restoreSession(), 0);
    const supabase = getSupabaseBrowserClient();
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") setProfile(null);
    });
    return () => {
      window.clearTimeout(timeout);
      data.subscription.unsubscribe();
    };
  }, [restoreSession]);

  async function signOut() {
    await getSupabaseBrowserClient().auth.signOut();
    setProfile(null);
  }

  if (loading) return <LoadingScreen />;
  if (!profile) return <AuthShell><LoginForm onAuthenticated={setProfile} /></AuthShell>;
  if (profile.mustChangePassword) return <AuthShell><ChangePasswordForm profile={profile} onChanged={setProfile} /></AuthShell>;

  return <CommunityDashboard currentUser={profile} onSignOut={signOut} />;
}
