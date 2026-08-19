"use client";

import { AlertTriangle, Camera, Clock3, ImagePlus, LoaderCircle, Plus, Send, ShieldCheck, X } from "lucide-react";
import Image from "next/image";
import { ChangeEvent, FormEvent, useCallback, useEffect, useState } from "react";
import type { CommunityReport, ResidentProfile } from "@/lib/community-types";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type SelectedPhoto = {
  file: File;
  preview: string;
};

type ReportRow = {
  id: string;
  description: string;
  created_at: string;
  author: { home_number: string } | Array<{ home_number: string }> | null;
  photos: Array<{ storage_path: string }> | null;
};

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function formatReportDate(value: string) {
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function safeFileExtension(file: File) {
  const fromName = file.name.split(".").pop()?.toLocaleLowerCase("en") ?? "";
  if (/^(jpe?g|png|webp|heic|heif)$/.test(fromName)) return fromName === "jpeg" ? "jpg" : fromName;
  const byMime: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/heic": "heic",
    "image/heif": "heif",
  };
  return byMime[file.type] ?? "jpg";
}

function ReportModal({
  homeNumber,
  onClose,
  onSubmit,
}: {
  homeNumber: string;
  onClose: () => void;
  onSubmit: (description: string, photos: File[]) => Promise<void>;
}) {
  const [photos, setPhotos] = useState<SelectedPhoto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handlePhotos(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []).slice(0, 3);
    if (files.some((file) => file.size > 4 * 1024 * 1024)) {
      setError("Cada foto debe pesar menos de 4 MB.");
      return;
    }
    if (files.some((file) => !file.type.startsWith("image/"))) {
      setError("Solo puedes agregar archivos de imagen.");
      return;
    }

    setError(null);
    const selected = await Promise.all(files.map(async (file) => ({ file, preview: await fileToDataUrl(file) })));
    setPhotos(selected);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const description = String(formData.get("description") ?? "").trim();
    if (!description) return;

    setSubmitting(true);
    setError(null);
    try {
      await onSubmit(description, photos.map((photo) => photo.file));
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "No pudimos publicar el reporte.");
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="report-title" className="modal-card" onMouseDown={(event) => event.stopPropagation()}>
        <button className="icon-button absolute right-5 top-5" onClick={onClose} aria-label="Cerrar reporte"><X size={18} /></button>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F7E1DA] text-[#B55D48]"><Camera size={20} /></div>
        <p className="section-kicker mt-5">Seguridad comunitaria</p>
        <h2 id="report-title" className="mt-1 font-serif text-3xl text-[#20372F]">Crear un reporte</h2>
        <p className="mt-2 text-sm leading-6 text-[#707A74]">Cuéntanos qué ocurrió. Tu reporte se identificará como Casa {homeNumber}.</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="form-field">
            <span>¿Qué pasó?</span>
            <textarea name="description" required rows={5} maxLength={500} placeholder="Describe qué viste, dónde ocurrió y cualquier detalle que pueda ayudar…" />
          </label>

          <div>
            <label className="report-upload">
              <input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" multiple onChange={handlePhotos} />
              <ImagePlus size={19} />
              <span><b>Agregar fotos</b><small>Hasta 3 imágenes · máximo 4 MB cada una</small></span>
            </label>
          </div>

          {photos.length > 0 && (
            <div className="grid grid-cols-3 gap-2" aria-label="Fotos seleccionadas">
              {photos.map((photo, index) => (
                <div key={`${photo.file.name}-${index}`} className="relative h-20 overflow-hidden rounded-xl bg-[#E8ECE6]">
                  <Image src={photo.preview} alt={`Vista previa ${index + 1}`} fill unoptimized className="object-cover" />
                  <button type="button" className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-[#20372F]/80 text-white" onClick={() => setPhotos((current) => current.filter((_, photoIndex) => photoIndex !== index))} aria-label={`Quitar foto ${index + 1}`}><X size={13} /></button>
                </div>
              ))}
            </div>
          )}

          {error && <p className="rounded-xl border border-[#EBCBC1] bg-[#FFF6F2] px-3.5 py-3 text-xs font-semibold leading-5 text-[#A65340]">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="secondary-button" onClick={onClose} disabled={submitting}>Cancelar</button>
            <button type="submit" className="primary-button" disabled={submitting}>{submitting ? <LoaderCircle className="animate-spin" size={16} /> : <Send size={16} />} Publicar reporte</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function ActivityFeed({ currentUser, onNotify }: { currentUser: ResidentProfile; onNotify: (message: string) => void }) {
  const [reports, setReports] = useState<CommunityReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [reportOpen, setReportOpen] = useState(false);

  const loadReports = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("reports")
      .select("id, description, created_at, author:profiles!reports_author_id_fkey(home_number), photos:report_photos(storage_path)")
      .order("created_at", { ascending: false })
      .limit(40);

    if (error) {
      setLoading(false);
      onNotify("No pudimos cargar los reportes.");
      return;
    }

    const mapped = await Promise.all(((data ?? []) as ReportRow[]).map(async (row) => {
      const authorRow = Array.isArray(row.author) ? row.author[0] : row.author;
      const signedPhotos = await Promise.all((row.photos ?? []).map(async (photo) => {
        const { data: signed } = await supabase.storage.from("report-photos").createSignedUrl(photo.storage_path, 3600);
        return signed?.signedUrl ?? null;
      }));

      return {
        id: row.id,
        description: row.description,
        photos: signedPhotos.filter((photo): photo is string => Boolean(photo)),
        author: `Casa ${authorRow?.home_number ?? "—"}`,
        date: formatReportDate(row.created_at),
      };
    }));

    setReports(mapped);
    setLoading(false);
  }, [onNotify]);

  useEffect(() => {
    const timeout = window.setTimeout(() => void loadReports(), 0);
    return () => window.clearTimeout(timeout);
  }, [loadReports]);

  async function addReport(description: string, files: File[]) {
    const supabase = getSupabaseBrowserClient();
    const { data: report, error: reportError } = await supabase
      .from("reports")
      .insert({ author_id: currentUser.userId, description })
      .select("id")
      .single();

    if (reportError || !report) throw new Error("No pudimos guardar el reporte.");

    const uploadedPaths: string[] = [];
    for (const file of files) {
      const path = `${currentUser.userId}/${report.id}/${crypto.randomUUID()}.${safeFileExtension(file)}`;
      const { error: uploadError } = await supabase.storage.from("report-photos").upload(path, file, { cacheControl: "3600", upsert: false });
      if (!uploadError) uploadedPaths.push(path);
    }

    if (uploadedPaths.length > 0) {
      const { error: photoRowsError } = await supabase.from("report_photos").insert(
        uploadedPaths.map((storagePath) => ({ report_id: report.id, storage_path: storagePath })),
      );
      if (photoRowsError) {
        await supabase.storage.from("report-photos").remove(uploadedPaths);
        throw new Error("El reporte se guardó, pero no pudimos asociar las fotografías.");
      }
    }

    setReportOpen(false);
    await loadReports();
    onNotify(uploadedPaths.length === files.length ? "El reporte se publicó para la comunidad." : "El reporte se publicó; algunas fotos no pudieron cargarse.");
  }

  return (
    <section id="actividad" className="panel-card flex min-h-[730px] scroll-mt-28 flex-col">
      <div className="panel-heading">
        <div><p className="section-kicker">Seguridad comunitaria</p><h2 className="mt-1 font-serif text-[25px] text-[#20372F]">Reportes</h2></div>
        <button className="add-button" onClick={() => setReportOpen(true)} aria-label="Crear reporte vecinal"><Plus size={18} /></button>
      </div>

      <div className="flex flex-1 flex-col px-4 pb-4">
        {loading ? (
          <div className="flex flex-1 items-center justify-center"><LoaderCircle className="animate-spin text-[#527565]" size={24} /></div>
        ) : reports.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-[#DCE3DC] bg-[#F8FAF6] px-5 py-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E3ECE7] text-[#416D5E]"><ShieldCheck size={22} /></div>
            <h3 className="mt-4 text-sm font-bold text-[#33483F]">Sin reportes recientes</h3>
            <p className="mt-2 text-xs leading-5 text-[#7A847E]">Si observas algo fuera de lo común, compártelo con los vecinos.</p>
            <button className="primary-button mt-5" onClick={() => setReportOpen(true)}><Camera size={16} /> Crear reporte</button>
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map((report) => (
              <article key={report.id} className="rounded-2xl border border-[#E2E6E0] bg-[#FCFDF9] p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F7E1DA] text-[#B55D48]"><AlertTriangle size={17} /></div>
                  <div className="min-w-0"><p className="text-[12.5px] leading-5 text-[#46554F]">{report.description}</p><p className="mt-2 flex items-center gap-1.5 text-[10px] font-semibold text-[#929A95]"><Clock3 size={12} /> {report.author} · {report.date}</p></div>
                </div>
                {report.photos.length > 0 && (
                  <div className={`mt-3 grid gap-1.5 ${report.photos.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
                    {report.photos.map((photo, index) => (
                      <div key={`${report.id}-${index}`} className="relative h-24 overflow-hidden rounded-xl bg-[#E8ECE6]"><Image src={photo} alt={`Foto del reporte ${index + 1}`} fill unoptimized className="object-cover" /></div>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </div>

      <p className="border-t border-[#E7EAE5] px-5 py-4 text-center text-[10.5px] leading-4 text-[#8B948F]">Los reportes y fotografías solo son visibles para residentes autorizados.</p>
      {reportOpen && <ReportModal homeNumber={currentUser.homeNumber} onClose={() => setReportOpen(false)} onSubmit={addReport} />}
    </section>
  );
}
