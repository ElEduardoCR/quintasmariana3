"use client";

import {
  BadgeCheck,
  Construction,
  Home,
  KeyRound,
  LoaderCircle,
  MapPinned,
  Phone,
  Search,
  TreePine,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { ResidentDirectoryEntry } from "@/lib/community-types";
import { Lot, LotStatus, lots } from "@/lib/neighborhood-data";

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
  isAdmin,
  resetting,
  onResetAccess,
}: {
  lot: Lot;
  onClose: () => void;
  isAdmin: boolean;
  resetting: boolean;
  onResetAccess?: (resident: ResidentDirectoryEntry) => Promise<void>;
}) {
  const isVacant = lot.status === "vacant";
  const isRegistered = Boolean(lot.household?.registered);

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
        <div className="mt-6 rounded-2xl bg-[#F5F7F2] p-4">
          <div className="flex items-center gap-3">
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
              style={{ backgroundColor: lot.household?.accent }}
            >
              {lot.household?.initials}
            </div>
            <div>
              <p className="text-sm font-semibold text-[#263B34]">Casa {lot.number}</p>
              <p className="mt-0.5 flex items-center gap-1 text-xs text-[#7A837E]">
                {isRegistered && <BadgeCheck size={13} className="text-[#3E725F]" />}
                {isRegistered ? "Información vecinal registrada" : "Registro pendiente"}
              </p>
            </div>
          </div>
          {isRegistered && lot.household && lot.household.phoneNumbers.length > 0 && (
            <div className="mt-4 border-t border-[#E1E6DF] pt-3">
              <p className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-[#8A948E]">
                Teléfonos de contacto
              </p>
              <div className="mt-2 space-y-2">
                {lot.household.phoneNumbers.map((phone) => (
                  <a
                    key={phone}
                    href={`tel:${phone.replace(/\s/g, "")}`}
                    className="flex items-center gap-2 rounded-xl bg-white px-3 py-2.5 text-sm font-bold text-[#315E50] transition-colors hover:bg-[#EDF3EF]"
                    aria-label={`Llamar al ${phone}`}
                  >
                    <Phone size={15} /> {phone}
                  </a>
                ))}
              </div>
            </div>
          )}
          {!isRegistered && (
            <p className="mt-3 border-t border-[#E1E6DF] pt-3 text-xs leading-5 text-[#7A837E]">
              Esta casa todavía no tiene información vecinal registrada.
            </p>
          )}
          {isRegistered && isAdmin && lot.household?.userId && onResetAccess && (
            <button
              type="button"
              className="secondary-button mt-4 flex w-full justify-center"
              disabled={resetting}
              onClick={() => onResetAccess({
                userId: lot.household!.userId!,
                homeNumber: lot.number,
                householdName: lot.household!.name,
                initials: lot.household!.initials,
                accent: lot.household!.accent,
                phoneNumbers: lot.household!.phoneNumbers,
              })}
            >
              {resetting ? <LoaderCircle className="animate-spin" size={15} /> : <KeyRound size={15} />}
              Restablecer acceso
            </button>
          )}
        </div>
      )}

      <p className="mt-5 text-center text-[11px] leading-4 text-[#919A94]">
        La información vecinal se publica únicamente con autorización.
      </p>
    </aside>
  );
}

export function NeighborhoodMap({
  residents,
  isAdmin = false,
  onResetAccess,
}: {
  residents: ResidentDirectoryEntry[];
  isAdmin?: boolean;
  onResetAccess?: (resident: ResidentDirectoryEntry) => Promise<void>;
}) {
  const [selectedLot, setSelectedLot] = useState<Lot | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | LotStatus>("all");
  const [resettingUser, setResettingUser] = useState<string | null>(null);

  const mapLots = useMemo(() => {
    const directory = new Map(residents.map((resident) => [resident.homeNumber, resident]));

    return lots.map((lot) => {
      if (lot.status === "vacant") return lot;
      const resident = directory.get(lot.number);
      if (!resident) return lot;

      return {
        ...lot,
        household: {
          userId: resident.userId,
          name: resident.householdName,
          initials: resident.initials,
          phoneNumbers: resident.phoneNumbers,
          accent: resident.accent,
          registered: true,
        },
      };
    });
  }, [residents]);

  async function resetAccess(resident: ResidentDirectoryEntry) {
    if (!onResetAccess) return;
    setResettingUser(resident.userId);
    try {
      await onResetAccess(resident);
    } finally {
      setResettingUser(null);
    }
  }

  const matchingIds = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("es");

    return new Set(
      mapLots
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
  }, [mapLots, query, statusFilter]);

  const occupiedCount = mapLots.filter((lot) => lot.status === "occupied").length;
  const vacantCount = mapLots.length - occupiedCount;

  return (
    <section id="mapa" className="map-card scroll-mt-28">
      <div className="flex flex-col gap-4 border-b border-[#E5E8E1] px-5 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="section-kicker">Vista del fraccionamiento</p>
          <div className="mt-1 flex items-center gap-2.5">
            <h2 className="font-serif text-[28px] leading-none text-[#20372F]">Mapa vecinal</h2>
            <span className="rounded-full bg-[#EDF1EC] px-2.5 py-1 text-[11px] font-bold text-[#66736C]">
              {mapLots.length} lotes
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
            Todos <span>{mapLots.length}</span>
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
              Fraccionamiento rectangular con treinta y ocho lotes, parque central y un único acceso al sur.
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
              {mapLots.map((lot) => (
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
          <NeighborPanel
            lot={selectedLot}
            onClose={() => setSelectedLot(null)}
            isAdmin={isAdmin}
            resetting={Boolean(selectedLot.household?.userId && resettingUser === selectedLot.household.userId)}
            onResetAccess={resetAccess}
          />
        )}
      </div>
    </section>
  );
}
