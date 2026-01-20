// Types pour l'application de gestion des travaux routiers

export interface User {
  id: number;
  firebaseUid?: string;
  email: string;
  displayName?: string; // computed from first_name + last_name
  firstName?: string;
  lastName?: string;
  role: 'visiteur' | 'utilisateur' | 'manager';
  loginAttempts?: number;
  isBlocked?: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

export interface Session {
  id: number;
  userId: number;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface Entreprise {
  id: number;
  nom: string;
  contact?: string;
  email?: string;
  createdAt: Date;
}

// Status enum aligned with DB schema (3 statuts)
export enum ProblemStatus {
  NEW = 'nouveau',
  IN_PROGRESS = 'en_cours',
  COMPLETED = 'termine'
}

// Alias for backward compatibility - now identical to ProblemStatus
export type ReportStatus = 'nouveau' | 'en_cours' | 'termine';

export interface Problem {
  id: number;
  firebaseId?: string;
  userId: number; // reportedBy
  title?: string; // UI helper, not in DB
  description?: string;
  latitude: number;
  longitude: number;
  address?: string; // UI helper, not in DB
  status: ProblemStatus; // Now using enum for consistency
  surface?: number; // en m²
  budget?: number; // en Ar (Ariary)
  entrepriseId?: number;
  reportedBy: number; // alias for userId
  reportedByName?: string; // UI helper, not in DB
  reportedAt: Date; // alias for createdAt
  updatedAt: Date;
  syncedAt?: Date;
  photos?: string[]; // UI helper, not in DB
}

export interface ProblemFilter {
  status?: ProblemStatus[];
  dateFrom?: Date;
  dateTo?: Date;
  entrepriseId?: number;
  minBudget?: number;
  maxBudget?: number;
}

export interface MapMarker {
  id: number;
  position: [number, number]; // [lat, lng]
  title?: string;
  status: ProblemStatus;
}

export interface Statistics {
  totalProblems: number;
  totalSurface: number;
  totalBudget: number;
  byStatus: Record<ProblemStatus, number>;
  advancementPercentage: number;
}

// Sync and config types
export interface SyncLog {
  id: number;
  syncType: 'pull' | 'push' | 'full';
  recordsPulled: number;
  recordsPushed: number;
  conflicts: number;
  status: 'success' | 'partial' | 'failed';
  errorMessage?: string;
  syncedBy?: number;
  syncedAt: Date;
}

export interface Config {
  id: number;
  key: string;
  value: string;
  description?: string;
  updatedAt: Date;
}
