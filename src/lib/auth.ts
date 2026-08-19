const RESIDENT_EMAIL_DOMAIN = "residentes.quintas-mariana.invalid";

export function normalizeHouseNumber(value: string) {
  return value.trim().replace(/\s+/g, "");
}

export function isValidHouseNumber(value: string) {
  return /^\d{3}$/.test(normalizeHouseNumber(value));
}

export function houseNumberToEmail(value: string) {
  const houseNumber = normalizeHouseNumber(value);
  return `casa-${houseNumber}@${RESIDENT_EMAIL_DOMAIN}`;
}
