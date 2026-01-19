import { User } from '@/types';

// Utilisateurs de test
export const mockUsers: User[] = [
  {
    id: 'user1',
    email: 'jean.rakoto@example.mg',
    displayName: 'Jean Rakoto',
    role: 'user',
    createdAt: new Date('2025-12-01'),
  },
  {
    id: 'user2',
    email: 'marie.andriani@example.mg',
    displayName: 'Marie Andrianirina',
    role: 'user',
    createdAt: new Date('2025-11-15'),
  },
  {
    id: 'manager1',
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
