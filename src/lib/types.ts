export type Role = "student" | "teacher" | "admin";

export type ApplicationStatus = "pending" | "approved" | "rejected";

export type MatchStatus = "suggested" | "accepted" | "rejected" | "replaced";

export type PaymentStatus = "pending" | "verified" | "rejected";

export type MeetingStatus = "scheduled" | "completed" | "cancelled";

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  username: string | null;
  phone: string | null;
  city: string | null;
  avatar_url: string | null;
  role: Role;
  grade_level?: string | null;
  is_suspended?: boolean | null;
  updated_at?: string | null;
}

export interface TeacherApplication {
  id: string;
  user_id: string;
  subject: string | null;
  years_of_experience: number | null;
  bio: string | null;
  certificates_url: string | null;
  districts: string[] | null;
  status: ApplicationStatus;
  created_at: string;
  updated_at: string;
}

export interface TeacherPublicProfile {
  id?: string;
  teacher_id: string;
  full_name?: string | null;
  avatar_url?: string | null;
  bio: string | null;
  subjects: string[] | null;
  districts: string[] | null;
  hourly_rate: number | null;
  grade_levels?: string[] | null;
  certificates?: string[] | null;
  is_published: boolean;
  is_hidden?: boolean | null;
}

export interface StudentTeacherMatch {
  id: string;
  student_id: string;
  teacher_id: string;
  status: MatchStatus;
  reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface MatchWithTeacher extends StudentTeacherMatch {
  teacher: TeacherPublicProfile & { full_name: string | null; avatar_url: string | null };
}

export interface AdminStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

export type DashboardState =
  | { kind: "student"; profile: Profile; match: MatchWithTeacher | null }
  | { kind: "teacher-pending"; profile: Profile; application: TeacherApplication }
  | { kind: "teacher-rejected"; profile: Profile; application: TeacherApplication }
  | { kind: "teacher-no-application"; profile: Profile }
  | { kind: "teacher"; profile: Profile }
  | { kind: "admin"; profile: Profile; stats: AdminStats };

export interface TeacherAvailability {
  id: string;
  teacher_id: string;
  day_of_week: number | null;
  start_time: string;
  end_time: string;
  is_recurring: boolean;
  specific_date: string | null;
  created_at: string;
}

export interface Payment {
  id: string;
  student_id: string;
  teacher_id: string;
  booking_id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  bank_account_used: string | null;
  transfer_reference: string | null;
  transfer_note: string | null;
  created_at: string;
  verified_at: string | null;
  verified_by: string | null;
  rejection_reason: string | null;
}

export interface Meeting {
  id: string;
  booking_id: string;
  payment_id: string | null;
  teacher_id: string;
  student_id: string;
  scheduled_at: string;
  duration_minutes: number;
  status: MeetingStatus;
  meeting_link: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Subject {
  id: string;
  name_ar: string;
  name_en: string | null;
  parent_id: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  iban: string;
  swift: string;
}
