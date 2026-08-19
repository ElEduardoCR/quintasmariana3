"use client";

import {
  CalendarDays,
  Construction,
  Home,
  MapPinned,
  MessageCircle,
  PawPrint,
  Search,
  TreePine,
  Users,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Lot, LotStatus, lots } from "@/lib/neighborhood-data";

type NeighborhoodMapProps = {
  onNotify: (message: string) => void;
};

function LotShape({
  lot,
  selected,
  dimmed,
  onSelect,
}: {
  lot: Lot;
  selected: boolean;
  dimmed: boolean;
  onSelect: () => void;
}) {
  const { x, y, width, height, side } = lot;
  const centerX = x + width / 2;
  const centerY = y + height / 2;
  const isVacant = lot.status === "vacant";
  const labelY = side === "north" ? y + height - 10 : side === "south" ? y + 13 : centerY + 4;
  const labelX = side === "east" ? x + 10 : centerX;

  return (
    <g
      role="button"
      tabIndex={0}
      aria-label={
        isVacant
          ? `Lote ${lot.number}, terreno baldío`
          : `Casa ${lot.number}, ${lot.household?.name}`
      }
      className={`map-lot ${selected ? "is-selected" : ""} ${dimmed ? "is-dimmed" : ""}`}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
    >
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={7}
        fill={isVacant ? "url(#vacantPattern)" : "#F5F2E8"}
        stroke={selected ? "#2E5C4F" : isVacant ? "#D98B72" : "#D8D9CE"}
        strokeWidth={selected ? 3.5 : 1.2}
      />

      {isVacant ? (
        <>
          <circle cx={centerX} cy={centerY - 4} r={6} fill="#EAB19A" opacity="0.76" />
          <path
            d={`M ${centerX - 8} ${centerY + 5} q 8 -8 16 0`}
            fill="none"
            stroke="#C66B51"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </>
      ) : (
        <>
          {side === "north" && (
            <>
              <rect x={x + 6} y={y + 7} width={width - 12} height={43} rx={4} fill="#FEFDF8" />
              <rect x={x + 10} y={y + 12} width={width - 20} height={5} rx={2} fill="#708B80" opacity="0.85" />
              <rect x={x + width - 13} y={y + 30} width={7} height={12} rx={2} fill="#D6B79C" />
              <circle cx={x + 9} cy={y + 59} r={3.5} fill="#8EAF92" />
            </>
          )}
          {side === "east" && (
            <>
              <rect x={x + 18} y={y + 5} width={width - 23} height={height - 10} rx={4} fill="#FEFDF8" />
              <rect x={x + 22} y={y + 9} width={5} height={height - 18} rx={2} fill="#708B80" opacity="0.85" />
              <circle cx={x + 10} cy={y + height - 10} r={3.5} fill="#8EAF92" />
            </>
          )}
          {side === "south" && (
            <>
              <rect x={x + 6} y={y + 25} width={width - 12} height={height - 32} rx={4} fill="#FEFDF8" />
              <rect x={x + 10} y={y + height - 17} width={width - 20} height={5} rx={2} fill="#708B80" opacity="0.85" />
              <rect x={x + 6} y={y + 29} width={7} height={11} rx={2} fill="#D6B79C" />
              <circle cx={x + width - 8} cy={y + 15} r={3.5} fill="#8EAF92" />
            </>
          )}
        </>
      )}

      <text
        x={labelX}
        y={labelY}
        textAnchor={side === "east" ? "start" : "middle"}
        fontSize="9"
        fontWeight="700"
        fill={isVacant ? "#A64E3B" : "#3E554D"}
      >
        {lot.number}
      </text>
    </g>
  );
}

function NeighborPanel({
  lot,
  onClose,
  onNotify,
}: {
  lot: Lot;
  onClose: () => void;
  onNotify: (message: string) => void;
}) {
  const isVacant = lot.status === "vacant";

  return (
    <aside className="neighbor-panel" aria-label={`Información del lote ${lot.number}`}>
      <button className="icon-button absolute right-4 top-4" onClick={onClose} aria-label="Cerrar información">
        <X size={17} />
      </button>

      <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl ${isVacant ? "bg-[#F7DDD3] text-[#B25843]" : "bg-[#DDE9E3] text-[#315F52]"}`}>
        {isVacant ? <Construction size={22} /> : <Home size={22} />}
      </div>

      <p className="section-kicker">{isVacant ? "Terreno disponible" : "Directorio vecinal"}</p>
      <h3 className="mt-1 pr-8 font-serif text-[28px] leading-tight text-[#1F342D]">
        {isVacant ? `Lote ${lot.number}` : lot.household?.name}
      </h3>
      <p className="mt-2 text-sm leading-6 text-[#6C756F]">
        {isVacant
          ? "Lote sin construcción registrado dentro del fraccionamiento."
          : `Casa ${lot.number} · Cerrada Jacarandas`}
      </p>

      {isVacant ? (
        <div className="mt-6 rounded-2xl border border-[#E8CBC0] bg-[#FFF8F5] p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#8F4A3A]">
            <MapPinned size={17} />
            Estado del lote
          </div>
          <p className="mt-2 text-sm leading-6 text-[#755E57]">
            Sin residente registrado. La administración puede compartir únicamente la información autorizada.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-6 flex items-center gap-3 rounded-2xl bg-[#F5F7F2] p-3.5">
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
              style={{ backgroundColor: lot.household?.accent }}
            >
              {lot.household?.initials}
            </div>
            <div>
              <p className="text-sm font-semibold text-[#263B34]">{lot.household?.contact}</p>
              <p className="mt-0.5 text-xs text-[#7A837E]">Perfil visible para residentes</p>
            </div>
          </div>

          <dl className="mt-5 grid grid-cols-2 gap-3">
            <div className="info-tile">
              <Users size={17} />
              <dt>Residentes</dt>
              <dd>{lot.household?.members} personas</dd>
            </div>
            <div className="info-tile">
              <CalendarDays size={17} />
              <dt>Desde</dt>
              <dd>{lot.household?.since}</dd>
            </div>
            <div className="info-tile col-span-2">
              <PawPrint size={17} />
              <dt>Mascotas</dt>
              <dd>{lot.household?.pet ?? "Sin mascotas registradas"}</dd>
            </div>
          </dl>
        </>
      )}

      <button
        className="primary-button mt-6 w-full"
        onClick={() =>
          onNotify(
            isVacant
              ? `Solicitud enviada a administración sobre el lote ${lot.number}.`
              : `Se abrió un mensaje para ${lot.household?.name}.`,
          )
        }
      >
        <MessageCircle size={17} />
        {isVacant ? "Consultar a administración" : "Enviar mensaje"}
      </button>

      <p className="mt-4 text-center text-[11px] leading-4 text-[#919A94]">
        Datos de demostración para visualizar el directorio.
      </p>
    </aside>
  );
}

export function NeighborhoodMap({ onNotify }: NeighborhoodMapProps) {
  const [selectedLot, setSelectedLot] = useState<Lot | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | LotStatus>("all");

  const matchingIds = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("es");

    return new Set(
      lots
        .filter((lot) => statusFilter === "all" || lot.status === statusFilter)
        .filter((lot) => {
          if (!normalizedQuery) return true;
          return (
            lot.number.includes(normalizedQuery) ||
            lot.household?.name.toLocaleLowerCase("es").includes(normalizedQuery)
          );
        })
        .map((lot) => lot.id),
    );
  }, [query, statusFilter]);

  const occupiedCount = lots.filter((lot) => lot.status === "occupied").length;
  const vacantCount = lots.length - occupiedCount;

  return (
    <section id="mapa" className="map-card scroll-mt-24">
      <div className="flex flex-col gap-4 border-b border-[#E5E8E1] px-5 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="section-kicker">Vista del fraccionamiento</p>
          <div className="mt-1 flex items-center gap-2.5">
            <h2 className="font-serif text-[28px] leading-none text-[#20372F]">Mapa vecinal</h2>
            <span className="rounded-full bg-[#EDF1EC] px-2.5 py-1 text-[11px] font-bold text-[#66736C]">
              {lots.length} lotes
            </span>
          </div>
        </div>

        <label className="search-field w-full lg:w-[255px]">
          <Search size={17} />
          <span className="sr-only">Buscar una casa o familia</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar casa o familia"
          />
          {query && (
            <button type="button" onClick={() => setQuery("")} aria-label="Limpiar búsqueda">
              <X size={15} />
            </button>
          )}
        </label>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 sm:px-6">
        <div className="flex flex-wrap items-center gap-2">
          <button
            className={`legend-chip ${statusFilter === "all" ? "is-active" : ""}`}
            onClick={() => setStatusFilter("all")}
          >
            Todos <span>{lots.length}</span>
          </button>
          <button
            className={`legend-chip ${statusFilter === "occupied" ? "is-active" : ""}`}
            onClick={() => setStatusFilter("occupied")}
          >
            <i className="bg-[#64897B]" /> Casas <span>{occupiedCount}</span>
          </button>
          <button
            className={`legend-chip ${statusFilter === "vacant" ? "is-active" : ""}`}
            onClick={() => setStatusFilter("vacant")}
          >
            <i className="bg-[#DC8067]" /> Baldíos <span>{vacantCount}</span>
          </button>
        </div>
        <p className="hidden items-center gap-1.5 text-xs font-medium text-[#7C8580] sm:flex">
          <MapPinned size={14} /> Selecciona un lote para ver su información
        </p>
      </div>

      <div className="relative min-h-[535px] overflow-hidden bg-[#EDF0E8] sm:min-h-[610px]">
        <div className="absolute left-5 top-4 z-10 rounded-full border border-white/70 bg-white/85 px-3 py-1.5 text-[10px] font-extrabold tracking-[0.18em] text-[#52635C] shadow-sm backdrop-blur">
          N ↑
        </div>

        <div className="h-full w-full overflow-auto p-3 sm:p-5">
          <svg
            viewBox="0 0 1000 630"
            className="mx-auto min-h-[500px] min-w-[820px] max-w-[1100px]"
            role="img"
            aria-labelledby="map-title map-description"
          >
            <title id="map-title">Mapa interactivo de Quintas Mariana</title>
            <desc id="map-description">
              Fraccionamiento rectangular con cuarenta lotes, parque central y un único acceso al sur.
            </desc>
            <defs>
              <pattern id="vacantPattern" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
                <rect width="8" height="8" fill="#FBECE5" />
                <rect width="2" height="8" fill="#F4D4C7" />
              </pattern>
              <filter id="parkShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="6" stdDeviation="7" floodColor="#315949" floodOpacity="0.12" />
              </filter>
            </defs>

            <rect x="12" y="10" width="976" height="605" rx="28" fill="#D9E2D6" />
            <path d="M26 111 H905 Q943 111 943 149 V486 H26 Z" fill="#E6E6DD" />
            <rect x="26" y="213" width="886" height="211" rx="49" fill="#DDDCD2" />
            <path d="M26 146 H877 Q902 146 902 171 V454 Q902 480 877 480 H555" fill="none" stroke="#F7F5ED" strokeWidth="48" />
            <path d="M444 480 H66 Q42 480 42 456 V176 Q42 151 66 151 H864" fill="none" stroke="#F7F5ED" strokeWidth="48" />
            <path d="M498 618 V466" stroke="#F7F5ED" strokeWidth="62" />
            <path d="M498 618 V470" stroke="#D2D2C9" strokeWidth="2" strokeDasharray="12 10" />
            <path d="M73 151 H858" stroke="#D2D2C9" strokeWidth="2" strokeDasharray="14 11" />
            <path d="M62 480 H440 M556 480 H870" stroke="#D2D2C9" strokeWidth="2" strokeDasharray="14 11" />
            <path d="M902 177 V449" stroke="#D2D2C9" strokeWidth="2" strokeDasharray="14 11" />

            <g filter="url(#parkShadow)">
              <rect x="286" y="232" width="427" height="170" rx="35" fill="#9FBE97" />
              <path
                d="M334 316 C369 267 426 264 467 313 C503 356 567 365 626 316"
                fill="none"
                stroke="#EAF0DE"
                strokeWidth="13"
                strokeLinecap="round"
              />
              <circle cx="497" cy="316" r="31" fill="#BFD2A8" stroke="#EDF2E5" strokeWidth="7" />
              <rect x="469" y="302" width="56" height="28" rx="8" fill="#D8B079" />
              <path d="M476 302 L497 284 L518 302" fill="#D98061" />
              {[
                [321, 264], [358, 370], [671, 267], [649, 370], [392, 284], [604, 353],
              ].map(([cx, cy]) => (
                <g key={`${cx}-${cy}`}>
                  <rect x={cx - 2} y={cy + 5} width="4" height="9" rx="2" fill="#755E45" />
                  <circle cx={cx} cy={cy} r="11" fill="#56816C" />
                  <circle cx={cx - 5} cy={cy - 4} r="6" fill="#71987D" />
                </g>
              ))}
              <text x="497" y="383" textAnchor="middle" fontSize="11" fontWeight="800" letterSpacing="2" fill="#365E50">
                PARQUE CENTRAL
              </text>
            </g>

            <g>
              <rect x="450" y="570" width="96" height="40" rx="13" fill="#315E50" />
              <rect x="459" y="580" width="21" height="17" rx="3" fill="#F3E8D5" />
              <path d="M490 589 H537" stroke="#F3E8D5" strokeWidth="3" strokeLinecap="round" />
              <circle cx="512" cy="589" r="4" fill="#D47B61" />
              <text x="498" y="625" textAnchor="middle" fontSize="10" fontWeight="800" letterSpacing="1.2" fill="#315E50">
                ACCESO PRINCIPAL
              </text>
            </g>

            <g aria-label="Lotes del fraccionamiento">
              {lots.map((lot) => (
                <LotShape
                  key={lot.id}
                  lot={lot}
                  selected={selectedLot?.id === lot.id}
                  dimmed={!matchingIds.has(lot.id)}
                  onSelect={() => setSelectedLot(lot)}
                />
              ))}
            </g>

            <g opacity="0.55">
              <TreePine x={254} y={120} width={18} height={18} color="#47715F" />
              <TreePine x={728} y={454} width={17} height={17} color="#47715F" />
            </g>
          </svg>
        </div>

        {matchingIds.size === 0 && (
          <div className="absolute inset-x-0 top-24 z-10 mx-auto w-fit rounded-2xl border border-[#E4E7E0] bg-white px-5 py-3 text-sm font-semibold text-[#51605A] shadow-lg">
            No encontramos una casa con esa búsqueda.
          </div>
        )}

        {selectedLot && (
          <NeighborPanel lot={selectedLot} onClose={() => setSelectedLot(null)} onNotify={onNotify} />
        )}
      </div>
    </section>
  );
}
