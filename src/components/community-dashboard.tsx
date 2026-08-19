"use client";

import {
  AlertTriangle,
  Bell,
  Camera,
  Check,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Clock3,
  Droplets,
  ImagePlus,
  Megaphone,
  Menu,
  PartyPopper,
  Plus,
  Send,
  ShieldCheck,
  Sparkles,
  Trees,
  Trash2,
  UsersRound,
  X,
} from "lucide-react";
import Image from "next/image";
import { ChangeEvent, FormEvent, useState } from "react";
import { NeighborhoodMap } from "@/components/neighborhood-map";
import { initialNotices, Notice } from "@/lib/neighborhood-data";

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

type NeighborhoodReport = {
  id: number;
  description: string;
  photos: string[];
  author: string;
  date: string;
};

const CURRENT_HOME = "607";

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
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

function ReportModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (report: NeighborhoodReport) => void;
}) {
  const [photos, setPhotos] = useState<string[]>([]);
  const [photoError, setPhotoError] = useState<string | null>(null);

  async function handlePhotos(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []).slice(0, 3);
    const oversized = files.some((file) => file.size > 4 * 1024 * 1024);

    if (oversized) {
      setPhotoError("Cada foto debe pesar menos de 4 MB.");
      return;
    }

    setPhotoError(null);
    setPhotos(await Promise.all(files.map(fileToDataUrl)));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const description = String(formData.get("description") ?? "").trim();
    if (!description) return;

    onSubmit({
      id: Date.now(),
      description,
      photos,
      author: `Casa ${CURRENT_HOME}`,
      date: "Ahora",
    });
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-title"
        className="modal-card"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className="icon-button absolute right-5 top-5" onClick={onClose} aria-label="Cerrar reporte">
          <X size={18} />
        </button>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F7E1DA] text-[#B55D48]">
          <Camera size={20} />
        </div>
        <p className="section-kicker mt-5">Seguridad comunitaria</p>
        <h2 id="report-title" className="mt-1 font-serif text-3xl text-[#20372F]">Crear un reporte</h2>
        <p className="mt-2 text-sm leading-6 text-[#707A74]">
          Cuéntanos qué ocurrió. Tu reporte se identificará como Casa {CURRENT_HOME}.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="form-field">
            <span>¿Qué pasó?</span>
            <textarea
              name="description"
              required
              rows={5}
              maxLength={500}
              placeholder="Describe qué viste, dónde ocurrió y cualquier detalle que pueda ayudar…"
            />
          </label>

          <div>
            <label className="report-upload">
              <input className="sr-only" type="file" accept="image/*" multiple onChange={handlePhotos} />
              <ImagePlus size={19} />
              <span>
                <b>Agregar fotos</b>
                <small>Hasta 3 imágenes · máximo 4 MB cada una</small>
              </span>
            </label>
            {photoError && <p className="mt-2 text-xs font-semibold text-[#B45743]">{photoError}</p>}
          </div>

          {photos.length > 0 && (
            <div className="grid grid-cols-3 gap-2" aria-label="Fotos seleccionadas">
              {photos.map((photo, index) => (
                <div key={`${photo.slice(0, 32)}-${index}`} className="relative h-20 overflow-hidden rounded-xl bg-[#E8ECE6]">
                  <Image src={photo} alt={`Vista previa ${index + 1}`} fill unoptimized className="object-cover" />
                  <button
                    type="button"
                    className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-[#20372F]/80 text-white"
                    onClick={() => setPhotos((current) => current.filter((_, photoIndex) => photoIndex !== index))}
                    aria-label={`Quitar foto ${index + 1}`}
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="secondary-button" onClick={onClose}>Cancelar</button>
            <button type="submit" className="primary-button"><Send size={16} /> Publicar reporte</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ActivityFeed({ onNotify }: { onNotify: (message: string) => void }) {
  const [reports, setReports] = useState<NeighborhoodReport[]>([]);
  const [reportOpen, setReportOpen] = useState(false);

  function addReport(report: NeighborhoodReport) {
    setReports((current) => [report, ...current]);
    setReportOpen(false);
    onNotify("El reporte se publicó para la comunidad.");
  }

  return (
    <section id="actividad" className="panel-card flex min-h-[730px] scroll-mt-28 flex-col">
      <div className="panel-heading">
        <div>
          <p className="section-kicker">Seguridad comunitaria</p>
          <h2 className="mt-1 font-serif text-[25px] text-[#20372F]">Reportes</h2>
        </div>
        <button className="add-button" onClick={() => setReportOpen(true)} aria-label="Crear reporte vecinal">
          <Plus size={18} />
        </button>
      </div>

      <div className="flex flex-1 flex-col px-4 pb-4">
        {reports.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-[#DCE3DC] bg-[#F8FAF6] px-5 py-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E3ECE7] text-[#416D5E]">
              <ShieldCheck size={22} />
            </div>
            <h3 className="mt-4 text-sm font-bold text-[#33483F]">Sin reportes recientes</h3>
            <p className="mt-2 text-xs leading-5 text-[#7A847E]">
              Si observas algo fuera de lo común, compártelo con los vecinos.
            </p>
            <button className="primary-button mt-5" onClick={() => setReportOpen(true)}>
              <Camera size={16} /> Crear reporte
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map((report) => (
              <article key={report.id} className="rounded-2xl border border-[#E2E6E0] bg-[#FCFDF9] p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F7E1DA] text-[#B55D48]">
                    <AlertTriangle size={17} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[12.5px] leading-5 text-[#46554F]">{report.description}</p>
                    <p className="mt-2 flex items-center gap-1.5 text-[10px] font-semibold text-[#929A95]">
                      <Clock3 size={12} /> {report.author} · {report.date}
                    </p>
                  </div>
                </div>
                {report.photos.length > 0 && (
                  <div className={`mt-3 grid gap-1.5 ${report.photos.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
                    {report.photos.map((photo, index) => (
                      <div key={`${report.id}-${index}`} className="relative h-24 overflow-hidden rounded-xl bg-[#E8ECE6]">
                        <Image src={photo} alt={`Foto del reporte ${index + 1}`} fill unoptimized className="object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </div>

      <p className="border-t border-[#E7EAE5] px-5 py-4 text-center text-[10.5px] leading-4 text-[#8B948F]">
        Los reportes son visibles para todos los residentes.
      </p>

      {reportOpen && <ReportModal onClose={() => setReportOpen(false)} onSubmit={addReport} />}
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
        <div className="schedule-ribbon">
          <div className="mx-auto flex h-full w-full max-w-[1800px] items-center justify-center gap-2 px-4 sm:px-6">
            <Trash2 size={13} />
            <span className="sm:hidden"><b>Basura</b> · Mar, jue y sáb · alrededor de las 5:00 a. m.</span>
            <span className="hidden sm:inline">
              <b>Recolección de basura</b> · Martes, jueves y sábados · alrededor de las 5:00 a. m.
            </span>
          </div>
        </div>
        <div className="mx-auto flex h-[76px] w-full max-w-[1800px] items-center gap-8 px-4 sm:px-6">
          <Brand />

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Navegación principal">
            <a className="nav-link is-active" href="#inicio">Comunidad</a>
            <a className="nav-link" href="#mapa">Directorio</a>
            <a className="nav-link" href="#actividad">Reportes</a>
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

            <button className="profile-button" onClick={() => notify("Perfil de la Familia Castañeda Martínez abierto.")}>
              <span>CM</span>
              <div className="hidden text-left sm:block">
                <b>Casa 607</b>
                <small>Residente</small>
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
              <a className="mobile-nav-link" href="#actividad" onClick={() => setMobileMenuOpen(false)}>Reportes</a>
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

        <ActivityFeed onNotify={notify} />

        <div className="md:col-span-2 xl:col-span-1">
          <NeighborhoodMap onNotify={notify} />

          <div className="mt-4 flex flex-col items-start justify-between gap-3 rounded-2xl border border-[#E1E5DE] bg-white/70 px-5 py-3.5 text-xs text-[#707A74] sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-[#4F7467]" />
              Directorio privado · La información solo se muestra a residentes autorizados.
            </div>
            <span className="flex items-center gap-1.5 font-semibold text-[#88918C]"><Sparkles size={14} /> Registro comunitario</span>
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
