// src/types/index.ts
// Definiciones de tipos e interfaces globales para LearnHub (UTP)

export { type CourseItem } from '../views/CatalogView';

export interface UserData {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
  role: 'student' | 'admin';
  password?: string;
  hasMembership?: boolean;
  purchasedCourseIds?: number[];
}

export interface MembershipPlan {
  id: string;
  name: string;
  months: number;
  totalPrice: number;
  monthlyEquivalent: number;
  badge?: string;
  expiresLabel: string;
  features: string[];
}

export interface SavedCard {
  id: string;
  brand: string;
  last4: string;
  holder: string;
  expiry: string;
}

export interface TransactionItem {
  id: string;
  student: string;
  item: string;
  date: string;
  method: string;
  amount: string;
  type: 'INDIVIDUAL' | 'SUSCRIPCIÓN' | 'REEMBOLSO' | string;
  status: 'COMPLETADO' | 'FALLIDO' | 'REEMBOLSADO' | string;
}

export interface SandboxCheckout {
  type: 'course' | 'membership';
  courseId?: number;
  plan?: MembershipPlan;
  title: string;
  price: number;
}
