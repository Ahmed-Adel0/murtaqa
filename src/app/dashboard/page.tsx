import { redirect } from "next/navigation";
import { getDashboardState } from "@/lib/queries/dashboard";
import StudentDashboard from "@/components/dashboard/StudentDashboard";
import TeacherDashboard from "@/components/dashboard/TeacherDashboard";
import TeacherPending from "@/components/dashboard/TeacherPending";
import TeacherRejected from "@/components/dashboard/TeacherRejected";
import TeacherNoApplication from "@/components/dashboard/TeacherNoApplication";
import AdminDashboard from "@/components/dashboard/AdminDashboard";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const state = await getDashboardState();
  if (!state) redirect("/login");

  switch (state.kind) {
    case "student":
      return <StudentDashboard profile={state.profile} match={state.match} />;
    case "teacher-pending":
      return <TeacherPending application={state.application} />;
    case "teacher-rejected":
      return <TeacherRejected application={state.application} />;
    case "teacher-no-application":
      return <TeacherNoApplication />;
    case "teacher":
      return <TeacherDashboard profile={state.profile} />;
    case "admin":
      return <AdminDashboard stats={state.stats} profile={state.profile} />;
  }
}
