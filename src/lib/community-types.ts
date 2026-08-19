export type ResidentRole = "resident" | "admin";

export type ResidentProfile = {
  userId: string;
  homeId: number;
  homeNumber: string;
  householdName: string;
  initials: string;
  accent: string;
  role: ResidentRole;
  approved: boolean;
  mustChangePassword: boolean;
  phoneNumbers: string[];
};

export type ResidentDirectoryEntry = Pick<
  ResidentProfile,
  "userId" | "homeNumber" | "householdName" | "initials" | "accent" | "phoneNumbers"
>;

export type CommunityReport = {
  id: string;
  description: string;
  photos: string[];
  author: string;
  date: string;
};
