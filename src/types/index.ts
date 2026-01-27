// Types pour l'application de gestion des travaux routiers

// Types Firebase - collection "users"
export interface User {
  id?: number; // Local ID (optional for compatibility)
  uid: string; // Firebase UID (primary identifier)
  email: string;
  firstName: string;
  lastName: string;
  displayName?: string; // computed from firstName + lastName
  role: 'utilisateur' | 'manager';
  createdAt: Date;
  updatedAt: Date;
  // Legacy fields for backward compatibility
  firebaseUid?: string; // Alias for uid
  loginAttempts?: number;
  isBlocked?: boolean;
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

// Status enum aligned with Firebase schema (3 statuts)
export enum ProblemStatus {
  NEW = 'nouveau',
  IN_PROGRESS = 'en_cours',
  COMPLETED = 'termine'
}

// Alias for backward compatibility
export type ReportStatus = 'nouveau' | 'en_cours' | 'termine';

// Types Firebase - collection "reports"
export interface Problem {
  id: string; // Firestore document ID
  userId: string; // Firebase UID of user who created the report
  userName: string; // User's full name
  userEmail: string; // User's email
  latitude: number;
  longitude: number;
  description: string;
  status: ProblemStatus;
  surface: number | null;
  budget: number | null;
  entreprise: string | null; // Company name assigned to handle the report
  createdAt: Date; // Firestore Timestamp
  updatedAt: Date; // Firestore Timestamp
  // UI helper fields (optional)
  title?: string; // Derived from description
  address?: string; // Reverse geocoded from lat/lng
  reportedBy?: string; // Alias for userId
  reportedByName?: string; // Alias for userName
  reportedAt?: Date; // Alias for createdAt
  photos?: string[]; // URLs of photos in Firebase Storage
  entrepriseId?: number; // Legacy field for backward compatibility
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
  id: string;
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
