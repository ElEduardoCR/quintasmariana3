export type LotStatus = "occupied" | "vacant";

export type Household = {
  name: string;
  initials: string;
  phoneNumbers: string[];
  accent: string;
  registered: boolean;
};

export type Lot = {
  id: number;
  number: string;
  x: number;
  y: number;
  width: number;
  height: number;
  side: "north" | "east" | "south";
  status: LotStatus;
  household?: Household;
};

export type Notice = {
  id: number;
  category: "Importante" | "Comunidad" | "Servicios" | "Eventos";
  title: string;
  body: string;
  date: string;
  accent: "coral" | "green" | "blue" | "amber";
};

type RegisteredResident = Pick<Household, "name" | "initials" | "phoneNumbers" | "accent">;

// Los vecinos se dan de alta aquí, usando el número de casa como llave.
export const residentDirectory: Record<string, RegisteredResident> = {
  "607": {
    name: "Familia Castañeda Martínez",
    initials: "CM",
    phoneNumbers: ["639 112 3516", "639 471 6134"],
    accent: "#376B5B",
  },
};

type LotSeed = Omit<Lot, "household">;

function makeHousehold(lot: LotSeed): Household {
  const resident = residentDirectory[lot.number];

  return {
    name: resident?.name ?? "Vecino por registrar",
    initials: resident?.initials ?? lot.number,
    phoneNumbers: resident?.phoneNumbers ?? [],
    accent: resident?.accent ?? "#789087",
    registered: Boolean(resident),
  };
}

function withHouseholds(lots: LotSeed[]): Lot[] {
  return lots.map((lot) => {
    if (lot.status === "vacant") return lot;
    return { ...lot, household: makeHousehold(lot) };
  });
}

// Tramo superior: 16 casas, de la 627 a la 612 (izquierda a derecha).
const northLots: LotSeed[] = Array.from({ length: 16 }, (_, index) => ({
  id: index + 1,
  number: String(627 - index),
  x: 34 + index * 55.2,
  y: 24,
  width: 48,
  height: 78,
  side: "north" as const,
  status: "occupied" as const,
}));

// Lateral derecho: cinco casas; la 611 ocupa la esquina superior.
const eastLots: LotSeed[] = Array.from({ length: 5 }, (_, index) => ({
  id: index + 17,
  number: String(611 - index),
  x: 918,
  y: 116 + index * 76,
  width: 52,
  height: 62,
  side: "east" as const,
  status: "occupied" as const,
}));

// Tramo inferior derecho, desde el acceso hacia la esquina 606.
const southRightLayout: Array<Pick<LotSeed, "number" | "status">> = [
  { number: "S/N", status: "vacant" },
  { number: "601", status: "occupied" },
  { number: "602", status: "vacant" },
  { number: "603", status: "vacant" },
  { number: "604", status: "occupied" },
  { number: "605", status: "occupied" },
  { number: "606", status: "occupied" },
];

const southRightLots: LotSeed[] = southRightLayout.map((lot, index) => ({
  ...lot,
  id: index + 22,
  x: 562 + index * 58,
  y: 516,
  width: 48,
  height: 78,
  side: "south" as const,
}));

// Tramo inferior izquierdo: diez lotes, incluido el baldío sin número junto al acceso.
const southLeftLayout: Array<Pick<LotSeed, "number" | "status">> = [
  { number: "628", status: "occupied" },
  { number: "629", status: "occupied" },
  { number: "630", status: "occupied" },
  { number: "631", status: "occupied" },
  { number: "632", status: "occupied" },
  { number: "633", status: "vacant" },
  { number: "634", status: "vacant" },
  { number: "635", status: "occupied" },
  { number: "636", status: "occupied" },
  { number: "S/N", status: "vacant" },
];

const southLeftLots: LotSeed[] = southLeftLayout.map((lot, index) => ({
  ...lot,
  id: index + 29,
  x: 34 + index * 42,
  y: 516,
  width: 36,
  height: 78,
  side: "south" as const,
}));

export const lots = withHouseholds([
  ...northLots,
  ...eastLots,
  ...southRightLots,
  ...southLeftLots,
]);

export const initialNotices: Notice[] = [
  {
    id: 1,
    category: "Importante",
    title: "Mantenimiento de cisterna",
    body: "El servicio de agua se pausará el jueves de 9:00 a 12:00 h.",
    date: "Hoy · 8:30 a. m.",
    accent: "coral",
  },
  {
    id: 2,
    category: "Comunidad",
    title: "Asamblea vecinal",
    body: "Nos vemos este sábado en el parque para revisar las mejoras del acceso.",
    date: "Ayer · 6:15 p. m.",
    accent: "green",
  },
  {
    id: 3,
    category: "Servicios",
    title: "Recolección de ramas",
    body: "Coloca los residuos de jardín frente a tu domicilio antes de las 7:00 h.",
    date: "Lun · 11:40 a. m.",
    accent: "blue",
  },
  {
    id: 4,
    category: "Eventos",
    title: "Tarde de juegos en el parque",
    body: "Habrá lotería, aguas frescas y actividades para niñas y niños.",
    date: "Dom · 4:20 p. m.",
    accent: "amber",
  },
];
