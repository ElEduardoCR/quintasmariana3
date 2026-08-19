"use client";

import {
  Bell,
  Check,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Clock3,
  Droplets,
  KeyRound,
  LoaderCircle,
  LogOut,
  Megaphone,
  Menu,
  PartyPopper,
  Plus,
  ShieldCheck,
  Sparkles,
  Trees,
  Trash2,
  UsersRound,
  X,
} from "lucide-react";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { ActivityFeed } from "@/components/activity-feed";
import { NeighborhoodMap } from "@/components/neighborhood-map";
import type { ResidentDirectoryEntry, ResidentProfile } from "@/lib/community-types";
import { initialNotices, Notice } from "@/lib/neighborhood-data";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const noticeStyles = {
  coral: { icon: "bg-[#F8DFD7] text-[#B95A43]", dot: "bg-[#D96F56]", iconElement: <Droplets size={18} /> },
  green: { icon: "bg-[#DFEBE4] text-[#38695A]", dot: "bg-[#598575]", iconElement: <UsersRound size={18} /> },
  blue: { icon: "bg-[#E2EBED] text-[#4E747D]", dot: "bg-[#6F9198]", iconElement: <Trash2 size={18} /> },
  amber: { icon: "bg-[#F4E9D5] text-[#9B6B2E]", dot: "bg-[#C99A57]", iconElement: <PartyPopper size={18} /> },
} satisfies Record<Notice["accent"], { icon: string; dot: string; iconElement: React.ReactNode }>;

type ProfileRow = {
  user_id: string;
  home_number: string;
  household_name: string;
  initials: string;
  accent: string;
  resident_phones: Array<{ phone_number: string; display_order: number }> | null;
};

type NoticeRow = {
  id: string;
  category: Notice["category"];
  title: string;
  body: string;
  accent: Notice["accent"];
  created_at: string;
};

function formatCommunityDate(value: string) {
  return new Intl.DateTimeFormat("es-MX", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function Brand() {
  return (
    <a href="#inicio" className="flex items-center gap-3" aria-label="Ir al inicio de Quintas Mariana">
      <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-[14px] bg-[#315E50] text-[#EFF4E9] shadow-[0_6px_16px_rgba(49,94,80,0.18)]">
        <Trees size={21} strokeWidth={1.8} />
        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-tl-lg bg-[#D97960]" />
      </div>
      <div className="leading-none">
        <p className="font-serif text-[21px] tracking-[-0.02em] text-[#21372F]">Quintas Mariana</p>
        <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.22em] text-[#7B857F]">Comunidad vecinal</p>
      </div>
    </a>
  );
}

function NoticeCard({ notice }: { notice: Notice }) {
  const style = noticeStyles[notice.accent];
  return (
    <article className="notice-card group">
      <div className="flex items-start gap-3.5">
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${style.icon}`}>{style.iconElement}</div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2"><span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} /><p className="text-[10px] font-extrabold uppercase tracking-[0.13em] text-[#78827C]">{notice.category}</p></div>
          <h3 className="mt-1.5 text-[14px] font-bold leading-5 text-[#273C35]">{notice.title}</h3>
          <p className="mt-1.5 text-[12.5px] leading-[1.55] text-[#6D7671]">{notice.body}</p>
          <div className="mt-3 flex items-center justify-between gap-2"><span className="flex items-center gap-1.5 text-[10.5px] font-medium text-[#929994]"><Clock3 size={12} /> {notice.date}</span><ChevronRight className="text-[#A7AEA9] transition-transform group-hover:translate-x-0.5" size={15} /></div>
        </div>
      </div>
    </article>
  );
}

function PublishNoticeModal({ onClose, onPublish }: { onClose: () => void; onPublish: (notice: Omit<Notice, "id" | "date">) => Promise<void> }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const category = formData.get("category") as Notice["category"];
    const title = String(formData.get("title") ?? "").trim();
    const body = String(formData.get("body") ?? "").trim();
    if (!title || !body) return;

    const accentByCategory: Record<Notice["category"], Notice["accent"]> = { Importante: "coral", Comunidad: "green", Servicios: "blue", Eventos: "amber" };
    setSubmitting(true);
    setError(null);
    try {
      await onPublish({ category, title, body, accent: accentByCategory[category] });
    } catch {
      setSubmitting(false);
      setError("No pudimos publicar el aviso.");
    }
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="publish-title" className="modal-card" onMouseDown={(event) => event.stopPropagation()}>
        <button className="icon-button absolute right-5 top-5" onClick={onClose} aria-label="Cerrar"><X size={18} /></button>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E0EBE5] text-[#37675A]"><Megaphone size={20} /></div>
        <p className="section-kicker mt-5">Comunidad</p>
        <h2 id="publish-title" className="mt-1 font-serif text-3xl text-[#20372F]">Publicar un aviso</h2>
        <p className="mt-2 text-sm leading-6 text-[#707A74]">Comparte información útil con todas las casas del fraccionamiento.</p>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="form-field"><span>Categoría</span><select name="category" defaultValue="Comunidad"><option>Comunidad</option><option>Importante</option><option>Servicios</option><option>Eventos</option></select></label>
          <label className="form-field"><span>Título</span><input name="title" required maxLength={70} placeholder="Ej. Reunión del comité" /></label>
          <label className="form-field"><span>Mensaje</span><textarea name="body" required rows={4} maxLength={240} placeholder="Escribe los detalles del aviso…" /></label>
          {error && <p className="rounded-xl border border-[#EBCBC1] bg-[#FFF6F2] px-3.5 py-3 text-xs font-semibold text-[#A65340]">{error}</p>}
          <div className="flex justify-end gap-3 pt-2"><button type="button" className="secondary-button" onClick={onClose} disabled={submitting}>Cancelar</button><button type="submit" className="primary-button" disabled={submitting}>{submitting && <LoaderCircle className="animate-spin" size={16} />} Publicar aviso</button></div>
        </form>
      </div>
    </div>
  );
}

function ChangePasswordModal({ onClose, onChanged }: { onClose: () => void; onChanged: () => void }) {
  const [show, setShow] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const currentPassword = String(formData.get("currentPassword") ?? "");
    const password = String(formData.get("password") ?? "");
    const confirmation = String(formData.get("confirmation") ?? "");
    if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) return setError("Usa al menos 8 caracteres, con letras y números.");
    if (password !== confirmation) return setError("Las contraseñas no coinciden.");

    setSubmitting(true);
    setError(null);
    const { error: updateError } = await getSupabaseBrowserClient().auth.updateUser({ password, current_password: currentPassword });
    if (updateError) {
      setSubmitting(false);
      setError("La contraseña actual no es correcta o la nueva contraseña no es válida.");
      return;
    }
    onChanged();
    onClose();
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="password-title" className="modal-card" onMouseDown={(event) => event.stopPropagation()}>
        <button className="icon-button absolute right-5 top-5" onClick={onClose} aria-label="Cerrar"><X size={18} /></button>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E0EBE5] text-[#37675A]"><KeyRound size={20} /></div>
        <p className="section-kicker mt-5">Seguridad</p>
        <h2 id="password-title" className="mt-1 font-serif text-3xl text-[#20372F]">Cambiar contraseña</h2>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="form-field"><span>Contraseña actual</span><input name="currentPassword" type={show ? "text" : "password"} autoComplete="current-password" required /></label>
          <label className="form-field"><span>Nueva contraseña</span><input name="password" type={show ? "text" : "password"} autoComplete="new-password" minLength={8} required /></label>
          <label className="form-field"><span>Confirmar contraseña</span><input name="confirmation" type={show ? "text" : "password"} autoComplete="new-password" minLength={8} required /></label>
          <label className="flex items-center gap-2 text-xs font-semibold text-[#65746D]"><input type="checkbox" checked={show} onChange={(event) => setShow(event.target.checked)} /> Mostrar contraseñas</label>
          {error && <p className="rounded-xl border border-[#EBCBC1] bg-[#FFF6F2] px-3.5 py-3 text-xs font-semibold text-[#A65340]">{error}</p>}
          <div className="flex justify-end gap-3 pt-2"><button type="button" className="secondary-button" onClick={onClose}>Cancelar</button><button type="submit" className="primary-button" disabled={submitting}>{submitting && <LoaderCircle className="animate-spin" size={16} />} Guardar</button></div>
        </form>
      </div>
    </div>
  );
}

export function CommunityDashboard({ currentUser, onSignOut }: { currentUser: ResidentProfile; onSignOut: () => Promise<void> }) {
  const [notices, setNotices] = useState(initialNotices);
  const [residents, setResidents] = useState<ResidentDirectoryEntry[]>([]);
  const [publishOpen, setPublishOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const notify = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 3200);
  }, []);

  const loadCommunity = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    const [profilesResult, noticesResult] = await Promise.all([
      supabase.from("profiles").select("user_id, home_number, household_name, initials, accent, resident_phones(phone_number, display_order)").order("home_number"),
      supabase.from("notices").select("id, category, title, body, accent, created_at").order("created_at", { ascending: false }).limit(20),
    ]);

    if (!profilesResult.error) {
      setResidents(((profilesResult.data ?? []) as ProfileRow[]).map((profile) => ({
        userId: profile.user_id,
        homeNumber: profile.home_number,
        householdName: profile.household_name,
        initials: profile.initials,
        accent: profile.accent,
        phoneNumbers: [...(profile.resident_phones ?? [])].sort((a, b) => a.display_order - b.display_order).map((phone) => phone.phone_number),
      })));
    }

    if (!noticesResult.error) {
      setNotices(((noticesResult.data ?? []) as NoticeRow[]).map((notice) => ({
        id: notice.id,
        category: notice.category,
        title: notice.title,
        body: notice.body,
        accent: notice.accent,
        date: formatCommunityDate(notice.created_at),
      })));
    }
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => void loadCommunity(), 0);
    return () => window.clearTimeout(timeout);
  }, [loadCommunity]);

  async function handlePublish(notice: Omit<Notice, "id" | "date">) {
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.from("notices").insert({ ...notice, author_id: currentUser.userId });
    if (error) throw error;
    setPublishOpen(false);
    await loadCommunity();
    notify("El aviso ya está visible para la comunidad.");
  }

  async function handleResetAccess(resident: ResidentDirectoryEntry) {
    const confirmed = window.confirm(`La Casa ${resident.homeNumber} volverá a usar la contraseña temporal “vecino” y deberá cambiarla al entrar. ¿Continuar?`);
    if (!confirmed) return;

    const { data } = await getSupabaseBrowserClient().auth.getSession();
    const token = data.session?.access_token;
    if (!token) throw new Error("La sesión expiró.");

    const response = await fetch(`/api/admin/residents/${resident.userId}/reset-password`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error("No pudimos restablecer el acceso.");
    notify(`Acceso de la Casa ${resident.homeNumber} restablecido.`);
    if (resident.userId === currentUser.userId) await onSignOut();
  }

  return (
    <div id="inicio" className="min-h-screen bg-[#F3F5F0] text-[#253830]">
      <header className="sticky top-0 z-40 border-b border-[#E2E6DF] bg-[#FCFDF9]/90 backdrop-blur-xl">
        <div className="schedule-ribbon"><div className="mx-auto flex h-full w-full max-w-[1800px] items-center justify-center gap-2 px-4 sm:px-6"><Trash2 size={13} /><span className="sm:hidden"><b>Basura</b> · Mar, jue y sáb · alrededor de las 5:00 a. m.</span><span className="hidden sm:inline"><b>Recolección de basura</b> · Martes, jueves y sábados · alrededor de las 5:00 a. m.</span></div></div>
        <div className="mx-auto flex h-[76px] w-full max-w-[1800px] items-center gap-8 px-4 sm:px-6">
          <Brand />
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Navegación principal"><a className="nav-link is-active" href="#inicio">Comunidad</a><a className="nav-link" href="#mapa">Directorio</a><a className="nav-link" href="#actividad">Reportes</a></nav>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <button className="header-action hidden sm:flex" onClick={() => notify("El centro de ayuda estará disponible en la siguiente etapa.")}><CircleHelp size={17} /> <span className="hidden xl:inline">Ayuda</span></button>
            <div className="relative">
              <button className="icon-button relative" aria-label="Ver notificaciones" aria-expanded={notificationsOpen} onClick={() => setNotificationsOpen((current) => !current)}><Bell size={18} /><span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-[#D46F57]" /></button>
              {notificationsOpen && (
                <div className="notification-popover"><div className="flex items-center justify-between border-b border-[#E7EAE4] px-4 py-3"><p className="text-sm font-bold text-[#2C4038]">Notificaciones</p><span className="rounded-full bg-[#F5DED7] px-2 py-0.5 text-[10px] font-bold text-[#AC5843]">2 nuevas</span></div><div className="space-y-1 p-2"><button className="notification-item" onClick={() => setNotificationsOpen(false)}><span className="bg-[#F5DED7] text-[#B45F49]"><Droplets size={15} /></span><div><b>Cisterna programada</b><small>Consulta el horario del jueves.</small></div></button><button className="notification-item" onClick={() => setNotificationsOpen(false)}><span className="bg-[#E1EBE6] text-[#3F6B5D]"><UsersRound size={15} /></span><div><b>Asamblea vecinal</b><small>Sábado a las 10:00 a. m.</small></div></button></div></div>
              )}
            </div>

            <div className="relative">
              <button className="profile-button" onClick={() => setProfileOpen((current) => !current)} aria-expanded={profileOpen}>
                <span>{currentUser.initials}</span><div className="hidden text-left sm:block"><b>Casa {currentUser.homeNumber}</b><small>{currentUser.role === "admin" ? "Administración" : "Residente"}</small></div><ChevronDown size={14} className="hidden text-[#8C958F] sm:block" />
              </button>
              {profileOpen && (
                <div className="notification-popover right-0 w-64">
                  <div className="border-b border-[#E7EAE4] px-4 py-3"><p className="text-sm font-bold text-[#2C4038]">{currentUser.householdName}</p><p className="mt-1 text-[11px] text-[#818B85]">Casa {currentUser.homeNumber}</p></div>
                  <div className="p-2"><button className="notification-item" onClick={() => { setProfileOpen(false); setPasswordOpen(true); }}><span className="bg-[#E1EBE6] text-[#3F6B5D]"><KeyRound size={15} /></span><div><b>Cambiar contraseña</b><small>Actualiza tu acceso personal.</small></div></button><button className="notification-item" onClick={() => void onSignOut()}><span className="bg-[#F5DED7] text-[#B45F49]"><LogOut size={15} /></span><div><b>Cerrar sesión</b><small>Salir del portal vecinal.</small></div></button></div>
                </div>
              )}
            </div>

            <button className="icon-button lg:hidden" onClick={() => setMobileMenuOpen((current) => !current)} aria-label="Abrir menú">{mobileMenuOpen ? <X size={19} /> : <Menu size={19} />}</button>
          </div>
        </div>
        {mobileMenuOpen && <nav className="border-t border-[#E5E8E2] bg-white px-4 py-3 lg:hidden" aria-label="Navegación móvil"><div className="mx-auto flex max-w-[1800px] flex-col gap-1"><a className="mobile-nav-link" href="#inicio" onClick={() => setMobileMenuOpen(false)}>Comunidad</a><a className="mobile-nav-link" href="#mapa" onClick={() => setMobileMenuOpen(false)}>Directorio</a><a className="mobile-nav-link" href="#actividad" onClick={() => setMobileMenuOpen(false)}>Reportes</a></div></nav>}
      </header>

      <main className="mx-auto grid w-full max-w-[1800px] grid-cols-1 gap-4 px-4 py-5 sm:px-6 md:grid-cols-2 xl:grid-cols-[320px_320px_minmax(700px,1fr)]">
        <section id="avisos" className="panel-card min-h-[730px]">
          <div className="panel-heading"><div><p className="section-kicker">Para todos</p><h1 className="mt-1 font-serif text-[25px] text-[#20372F]">Avisos generales</h1></div>{currentUser.role === "admin" && <button className="add-button" onClick={() => setPublishOpen(true)} aria-label="Publicar un aviso"><Plus size={18} /></button>}</div>
          <div className="space-y-2.5 px-3.5 pb-4">{notices.slice(0, 5).map((notice) => <NoticeCard key={notice.id} notice={notice} />)}</div>
          {currentUser.role === "admin" && <button className="panel-footer-button" onClick={() => setPublishOpen(true)}>Publicar nuevo aviso <Plus size={15} /></button>}
        </section>

        <ActivityFeed currentUser={currentUser} onNotify={notify} />

        <div className="md:col-span-2 xl:col-span-1">
          <NeighborhoodMap residents={residents} isAdmin={currentUser.role === "admin"} onResetAccess={handleResetAccess} />
          <div className="mt-4 flex flex-col items-start justify-between gap-3 rounded-2xl border border-[#E1E5DE] bg-white/70 px-5 py-3.5 text-xs text-[#707A74] sm:flex-row sm:items-center"><div className="flex items-center gap-2"><ShieldCheck size={16} className="text-[#4F7467]" />Directorio privado · La información solo se muestra a residentes autorizados.</div><span className="flex items-center gap-1.5 font-semibold text-[#88918C]"><Sparkles size={14} /> Protegido por Supabase</span></div>
        </div>
      </main>

      {publishOpen && <PublishNoticeModal onClose={() => setPublishOpen(false)} onPublish={handlePublish} />}
      {passwordOpen && <ChangePasswordModal onClose={() => setPasswordOpen(false)} onChanged={() => notify("Tu contraseña se actualizó correctamente.")} />}
      {toast && <div className="toast" role="status"><span><Check size={15} /></span>{toast}</div>}
    </div>
  );
}
