// Types pour l'application de gestion des travaux routiers

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: 'visitor' | 'user' | 'manager';
  createdAt: Date;
}

export enum ProblemStatus {
  NEW = 'nouveau',
  IN_PROGRESS = 'en_cours',
  COMPLETED = 'termine',
  BLOCKED = 'bloque'
}

export interface Problem {
  id: string;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  address: string;
  status: ProblemStatus;
  surface: number; // en m²
  budget?: number; // en Ar (Ariary)
  company?: string; // entreprise responsable
  reportedBy: string; // user ID
  reportedByName: string;
  reportedAt: Date;
  updatedAt: Date;
  photos?: string[];
}

export interface ProblemFilter {
  status?: ProblemStatus[];
  dateFrom?: Date;
  dateTo?: Date;
  company?: string;
  minBudget?: number;
  maxBudget?: number;
}

export interface MapMarker {
  id: string;
  position: [number, number]; // [lat, lng]
  title: string;
  status: ProblemStatus;
}

export interface Statistics {
  totalProblems: number;
  totalSurface: number;
  totalBudget: number;
  byStatus: Record<ProblemStatus, number>;
  advancementPercentage: number;
}
