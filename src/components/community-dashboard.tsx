"use client";

import {
  BadgeDollarSign,
  Bell,
  CalendarCheck,
  Check,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Clock3,
  Droplets,
  LogIn,
  Megaphone,
  Menu,
  PartyPopper,
  Plus,
  ShieldCheck,
  Sparkles,
  Trees,
  Trash2,
  UsersRound,
  Wrench,
  X,
} from "lucide-react";
import { FormEvent, useState } from "react";
import { NeighborhoodMap } from "@/components/neighborhood-map";
import { activityItems, initialNotices, Notice } from "@/lib/neighborhood-data";

const noticeStyles = {
  coral: {
    icon: "bg-[#F8DFD7] text-[#B95A43]",
    dot: "bg-[#D96F56]",
    iconElement: <Droplets size={18} />,
  },
  green: {
    icon: "bg-[#DFEBE4] text-[#38695A]",
    dot: "bg-[#598575]",
    iconElement: <UsersRound size={18} />,
  },
  blue: {
    icon: "bg-[#E2EBED] text-[#4E747D]",
    dot: "bg-[#6F9198]",
    iconElement: <Trash2 size={18} />,
  },
  amber: {
    icon: "bg-[#F4E9D5] text-[#9B6B2E]",
    dot: "bg-[#C99A57]",
    iconElement: <PartyPopper size={18} />,
  },
} satisfies Record<Notice["accent"], { icon: string; dot: string; iconElement: React.ReactNode }>;

const activityIcon = {
  access: { icon: <LogIn size={16} />, className: "bg-[#E3ECE7] text-[#3B6B5C]" },
  payment: { icon: <BadgeDollarSign size={16} />, className: "bg-[#EDF0D9] text-[#687238]" },
  notice: { icon: <Megaphone size={16} />, className: "bg-[#F8E3DC] text-[#B85F49]" },
  service: { icon: <Wrench size={16} />, className: "bg-[#E3EAED] text-[#54747D]" },
  event: { icon: <CalendarCheck size={16} />, className: "bg-[#EEE7F1] text-[#76607F]" },
};

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
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${style.icon}`}>
          {style.iconElement}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
            <p className="text-[10px] font-extrabold uppercase tracking-[0.13em] text-[#78827C]">{notice.category}</p>
          </div>
          <h3 className="mt-1.5 text-[14px] font-bold leading-5 text-[#273C35]">{notice.title}</h3>
          <p className="mt-1.5 text-[12.5px] leading-[1.55] text-[#6D7671]">{notice.body}</p>
          <div className="mt-3 flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5 text-[10.5px] font-medium text-[#929994]">
              <Clock3 size={12} /> {notice.date}
            </span>
            <ChevronRight className="text-[#A7AEA9] transition-transform group-hover:translate-x-0.5" size={15} />
          </div>
        </div>
      </div>
    </article>
  );
}

function ActivityFeed() {
  const [showAll, setShowAll] = useState(false);
  const visibleItems = showAll ? activityItems : activityItems.slice(0, 4);

  return (
    <section id="actividad" className="panel-card flex min-h-[730px] scroll-mt-24 flex-col">
      <div className="panel-heading">
        <div>
          <p className="section-kicker">En tiempo real</p>
          <h2 className="mt-1 font-serif text-[25px] text-[#20372F]">Actividad</h2>
        </div>
        <span className="live-pill"><i /> En vivo</span>
      </div>

      <div className="flex-1 px-5 pb-4 pt-2">
        <div className="relative">
          <div className="absolute bottom-8 left-[17px] top-7 w-px bg-[#DFE4DE]" />
          {visibleItems.map((item, index) => {
            const config = activityIcon[item.type];
            return (
              <article key={item.id} className="relative flex gap-3.5 py-4">
                <div className={`relative z-10 flex h-[35px] w-[35px] shrink-0 items-center justify-center rounded-full border-[3px] border-white ${config.className}`}>
                  {config.icon}
                </div>
                <div className="min-w-0 pt-0.5">
                  <h3 className="text-[13px] font-bold leading-5 text-[#30423C]">{item.title}</h3>
                  <p className="mt-0.5 text-[11.5px] leading-5 text-[#747D78]">{item.detail}</p>
                  <p className="mt-1.5 text-[10px] font-semibold text-[#A0A7A2]">{item.time}</p>
                </div>
                {index === 0 && <span className="ml-auto mt-1 h-2 w-2 rounded-full bg-[#D66F56] shadow-[0_0_0_4px_#F9E5DF]" />}
              </article>
            );
          })}
        </div>
      </div>

      <div className="mx-5 mb-4 rounded-2xl bg-[#F3F6F0] p-4">
        <div className="flex items-center gap-2 text-xs font-bold text-[#446558]">
          <Trash2 size={15} /> Próxima recolección
        </div>
        <p className="mt-1.5 text-[11.5px] leading-5 text-[#6B7770]">Miércoles · Basura doméstica · 7:00 a. m.</p>
      </div>

      <button className="panel-footer-button" onClick={() => setShowAll((current) => !current)}>
        {showAll ? "Mostrar menos" : "Ver historial completo"}
        <ChevronRight size={15} className={showAll ? "rotate-90" : ""} />
      </button>
    </section>
  );
}

function PublishNoticeModal({
  onClose,
  onPublish,
}: {
  onClose: () => void;
  onPublish: (notice: Notice) => void;
}) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const category = formData.get("category") as Notice["category"];
    const title = String(formData.get("title") ?? "").trim();
    const body = String(formData.get("body") ?? "").trim();
    if (!title || !body) return;

    const accentByCategory: Record<Notice["category"], Notice["accent"]> = {
      Importante: "coral",
      Comunidad: "green",
      Servicios: "blue",
      Eventos: "amber",
    };

    onPublish({
      id: Date.now(),
      category,
      title,
      body,
      date: "Ahora",
      accent: accentByCategory[category],
    });
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="publish-title"
        className="modal-card"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className="icon-button absolute right-5 top-5" onClick={onClose} aria-label="Cerrar">
          <X size={18} />
        </button>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E0EBE5] text-[#37675A]">
          <Megaphone size={20} />
        </div>
        <p className="section-kicker mt-5">Comunidad</p>
        <h2 id="publish-title" className="mt-1 font-serif text-3xl text-[#20372F]">Publicar un aviso</h2>
        <p className="mt-2 text-sm leading-6 text-[#707A74]">Comparte información útil con todas las casas del fraccionamiento.</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="form-field">
            <span>Categoría</span>
            <select name="category" defaultValue="Comunidad">
              <option>Comunidad</option>
              <option>Importante</option>
              <option>Servicios</option>
              <option>Eventos</option>
            </select>
          </label>
          <label className="form-field">
            <span>Título</span>
            <input name="title" required maxLength={70} placeholder="Ej. Reunión del comité" />
          </label>
          <label className="form-field">
            <span>Mensaje</span>
            <textarea name="body" required rows={4} maxLength={240} placeholder="Escribe los detalles del aviso…" />
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="secondary-button" onClick={onClose}>Cancelar</button>
            <button type="submit" className="primary-button">Publicar aviso</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function CommunityDashboard() {
  const [notices, setNotices] = useState(initialNotices);
  const [publishOpen, setPublishOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  function notify(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 3200);
  }

  function handlePublish(notice: Notice) {
    setNotices((current) => [notice, ...current]);
    setPublishOpen(false);
    notify("El aviso ya está visible para la comunidad.");
  }

  return (
    <div id="inicio" className="min-h-screen bg-[#F3F5F0] text-[#253830]">
      <header className="sticky top-0 z-40 border-b border-[#E2E6DF] bg-[#FCFDF9]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[76px] w-full max-w-[1800px] items-center gap-8 px-4 sm:px-6">
          <Brand />

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Navegación principal">
            <a className="nav-link is-active" href="#inicio">Comunidad</a>
            <a className="nav-link" href="#mapa">Directorio</a>
            <a className="nav-link" href="#actividad">Actividad</a>
          </nav>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <button className="header-action hidden sm:flex" onClick={() => notify("El centro de ayuda estará disponible en la siguiente etapa.")}>
              <CircleHelp size={17} /> <span className="hidden xl:inline">Ayuda</span>
            </button>

            <div className="relative">
              <button
                className="icon-button relative"
                aria-label="Ver notificaciones"
                aria-expanded={notificationsOpen}
                onClick={() => setNotificationsOpen((current) => !current)}
              >
                <Bell size={18} />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-[#D46F57]" />
              </button>
              {notificationsOpen && (
                <div className="notification-popover">
                  <div className="flex items-center justify-between border-b border-[#E7EAE4] px-4 py-3">
                    <p className="text-sm font-bold text-[#2C4038]">Notificaciones</p>
                    <span className="rounded-full bg-[#F5DED7] px-2 py-0.5 text-[10px] font-bold text-[#AC5843]">2 nuevas</span>
                  </div>
                  <div className="space-y-1 p-2">
                    <button className="notification-item" onClick={() => setNotificationsOpen(false)}>
                      <span className="bg-[#F5DED7] text-[#B45F49]"><Droplets size={15} /></span>
                      <div><b>Cisterna programada</b><small>Consulta el horario del jueves.</small></div>
                    </button>
                    <button className="notification-item" onClick={() => setNotificationsOpen(false)}>
                      <span className="bg-[#E1EBE6] text-[#3F6B5D]"><UsersRound size={15} /></span>
                      <div><b>Asamblea vecinal</b><small>Sábado a las 10:00 a. m.</small></div>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button className="profile-button" onClick={() => notify("Perfil de Elena Martínez abierto.")}>
              <span>EM</span>
              <div className="hidden text-left sm:block">
                <b>Elena M.</b>
                <small>Administración</small>
              </div>
              <ChevronDown size={14} className="hidden text-[#8C958F] sm:block" />
            </button>

            <button className="icon-button lg:hidden" onClick={() => setMobileMenuOpen((current) => !current)} aria-label="Abrir menú">
              {mobileMenuOpen ? <X size={19} /> : <Menu size={19} />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <nav className="border-t border-[#E5E8E2] bg-white px-4 py-3 lg:hidden" aria-label="Navegación móvil">
            <div className="mx-auto flex max-w-[1800px] flex-col gap-1">
              <a className="mobile-nav-link" href="#inicio" onClick={() => setMobileMenuOpen(false)}>Comunidad</a>
              <a className="mobile-nav-link" href="#mapa" onClick={() => setMobileMenuOpen(false)}>Directorio</a>
              <a className="mobile-nav-link" href="#actividad" onClick={() => setMobileMenuOpen(false)}>Actividad</a>
            </div>
          </nav>
        )}
      </header>

      <main className="mx-auto grid w-full max-w-[1800px] grid-cols-1 gap-5 px-4 pb-8 pt-6 md:grid-cols-2 sm:px-6 xl:grid-cols-[290px_270px_minmax(650px,1fr)]">
        <section id="avisos" className="panel-card min-h-[730px]">
          <div className="panel-heading">
            <div>
              <p className="section-kicker">Para todos</p>
              <h1 className="mt-1 font-serif text-[25px] text-[#20372F]">Avisos generales</h1>
            </div>
            <button className="add-button" onClick={() => setPublishOpen(true)} aria-label="Publicar un aviso">
              <Plus size={18} />
            </button>
          </div>

          <div className="space-y-2.5 px-3.5 pb-4">
            {notices.slice(0, 5).map((notice) => <NoticeCard key={notice.id} notice={notice} />)}
          </div>

          <button className="panel-footer-button" onClick={() => setPublishOpen(true)}>
            Publicar nuevo aviso <Plus size={15} />
          </button>
        </section>

        <ActivityFeed />

        <div className="md:col-span-2 xl:col-span-1">
          <NeighborhoodMap onNotify={notify} />

          <div className="mt-4 flex flex-col items-start justify-between gap-3 rounded-2xl border border-[#E1E5DE] bg-white/70 px-5 py-3.5 text-xs text-[#707A74] sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-[#4F7467]" />
              Directorio privado · La información solo se muestra a residentes autorizados.
            </div>
            <span className="flex items-center gap-1.5 font-semibold text-[#88918C]"><Sparkles size={14} /> Prototipo interactivo</span>
          </div>
        </div>
      </main>

      {publishOpen && <PublishNoticeModal onClose={() => setPublishOpen(false)} onPublish={handlePublish} />}

      {toast && (
        <div className="toast" role="status">
          <span><Check size={15} /></span>
          {toast}
        </div>
      )}
    </div>
  );
}
