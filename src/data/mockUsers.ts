import { User } from '@/types';

// Utilisateurs de test
export const mockUsers: User[] = [
  {
    id: 1,
    email: 'jean.rakoto@example.mg',
    displayName: 'Jean Rakoto',
    role: 'utilisateur',
    createdAt: new Date('2025-12-01'),
  },
  {
    id: 2,
    email: 'marie.andriani@example.mg',
    displayName: 'Marie Andrianirina',
    role: 'utilisateur',
    createdAt: new Date('2025-11-15'),
  },
  {
    id: 1,
    email: 'manager@mairie-tana.mg',
    displayName: 'Responsable Travaux',
    role: 'manager',
    createdAt: new Date('2025-10-01'),
  },
];

export const defaultManagerAccount = {
  email: 'manager@mairie-tana.mg',
  password: 'Manager2026!',
  displayName: 'Responsable Travaux',
};
