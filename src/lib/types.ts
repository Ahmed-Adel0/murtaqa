export type Role = "student" | "teacher" | "admin";

export type ApplicationStatus = "pending" | "approved" | "rejected";

export type MatchStatus = "suggested" | "accepted" | "rejected" | "replaced";

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  username: string | null;
  phone: string | null;
  city: string | null;
  avatar_url: string | null;
  role: Role;
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
