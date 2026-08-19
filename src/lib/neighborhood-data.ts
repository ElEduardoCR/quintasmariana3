export type LotStatus = "occupied" | "vacant";

export type Household = {
  name: string;
  initials: string;
  members: number;
  since: string;
  pet?: string;
  contact: string;
  accent: string;
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

const familyNames = [
  "Familia Aguirre",
  "Familia Beltrán",
  "Familia Chávez",
  "Familia Domínguez",
  "Familia Esparza",
  "Familia Fierro",
  "Familia Galindo",
  "Familia Herrera",
  "Familia Ibarra",
  "Familia Jiménez",
  "Familia Lara",
  "Familia Mendoza",
  "Familia Navarro",
  "Familia Ochoa",
  "Familia Pérez",
  "Familia Quezada",
  "Familia Ríos",
  "Familia Salas",
  "Familia Torres",
  "Familia Urías",
  "Familia Valdez",
  "Familia Wong",
  "Familia Yáñez",
  "Familia Zamora",
  "Familia Acosta",
  "Familia Bustillos",
  "Familia Carrasco",
  "Familia Delgado",
  "Familia Enríquez",
  "Familia Flores",
  "Familia Gómez",
  "Familia Holguín",
  "Familia Lozoya",
  "Familia Márquez",
  "Familia Nájera",
];

const accents = ["#376B5B", "#CE715B", "#55737E", "#A37746", "#6D6B8C"];
const vacantIds = new Set([27, 30, 33, 36, 38]);

function makeHousehold(lotId: number, occupiedIndex: number): Household {
  const name = familyNames[occupiedIndex];
  const initials = name.replace("Familia ", "").slice(0, 2).toUpperCase();
  const petOptions = ["Luna · perrita", "Milo · gato", undefined, "Nala · perrita", undefined];

  return {
    name,
    initials,
    members: 2 + ((lotId + occupiedIndex) % 4),
    since: String(2018 + (occupiedIndex % 8)),
    pet: petOptions[occupiedIndex % petOptions.length],
    contact: `Contacto vecinal · Casa ${String(lotId).padStart(2, "0")}`,
    accent: accents[occupiedIndex % accents.length],
  };
}

function withHouseholds(lots: Omit<Lot, "status" | "household">[]): Lot[] {
  let occupiedIndex = 0;

  return lots.map((lot) => {
    if (vacantIds.has(lot.id)) {
      return { ...lot, status: "vacant" as const };
    }

    const household = makeHousehold(lot.id, occupiedIndex);
    occupiedIndex += 1;
    return { ...lot, status: "occupied" as const, household };
  });
}

const northLots = Array.from({ length: 17 }, (_, index) => ({
  id: index + 1,
  number: String(index + 1).padStart(2, "0"),
  x: 34 + index * 52.4,
  y: 24,
  width: 44,
  height: 78,
  side: "north" as const,
}));

const eastLots = Array.from({ length: 7 }, (_, index) => ({
  id: index + 18,
  number: String(index + 18).padStart(2, "0"),
  x: 918,
  y: 116 + index * 57,
  width: 52,
  height: 45,
  side: "east" as const,
}));

const southRightLots = Array.from({ length: 8 }, (_, index) => ({
  id: index + 25,
  number: String(index + 25).padStart(2, "0"),
  x: 916 - index * 51.5,
  y: 516,
  width: 43,
  height: 78,
  side: "south" as const,
}));

const southLeftLots = Array.from({ length: 8 }, (_, index) => ({
  id: index + 33,
  number: String(index + 33).padStart(2, "0"),
  x: 397 - index * 51.5,
  y: 516,
  width: 43,
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

export const activityItems = [
  {
    id: 1,
    title: "Acceso registrado",
    detail: "Proveedor autorizado · Casa 12",
    time: "Hace 8 min",
    type: "access" as const,
  },
  {
    id: 2,
    title: "Cuota recibida",
    detail: "Casa 08 · Agosto",
    time: "Hace 42 min",
    type: "payment" as const,
  },
  {
    id: 3,
    title: "Nuevo aviso publicado",
    detail: "Mantenimiento de cisterna",
    time: "Hoy · 8:30 a. m.",
    type: "notice" as const,
  },
  {
    id: 4,
    title: "Visita finalizada",
    detail: "Casa 21 · Salida confirmada",
    time: "Ayer · 7:02 p. m.",
    type: "access" as const,
  },
  {
    id: 5,
    title: "Reporte atendido",
    detail: "Luminaria norte reparada",
    time: "Ayer · 4:18 p. m.",
    type: "service" as const,
  },
  {
    id: 6,
    title: "Reserva confirmada",
    detail: "Parque central · Sábado 5:00 p. m.",
    time: "Lun · 12:30 p. m.",
    type: "event" as const,
  },
];
