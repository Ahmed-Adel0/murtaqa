"use server";

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { createClient } from "@/lib/supabaseServer";

/**
 * Admin analytics — aggregates all metrics for the dashboard.
 * Uses supabaseAdmin to bypass RLS.
 */
export async function getAdminAnalytics() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: callerProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (callerProfile?.role !== "admin") return null;

  // Fetch all data in parallel
  const [
    profilesRes,
    applicationsRes,
    bookingsRes,
    paymentsRes,
    reviewsRes,
  ] = await Promise.all([
    supabaseAdmin.from("profiles").select("id, role, created_at, city"),
    supabaseAdmin.from("teacher_applications").select("id, status, created_at"),
    supabaseAdmin.from("bookings").select("id, status, created_at, teacher_id"),
    supabaseAdmin.from("payments").select("id, status, amount, created_at"),
    supabaseAdmin.from("reviews").select("id, rating, teacher_id, created_at"),
  ]);

  const profiles = profilesRes.data ?? [];
  const applications = applicationsRes.data ?? [];
  const bookings = bookingsRes.data ?? [];
  const payments = paymentsRes.data ?? [];
  const reviews = reviewsRes.data ?? [];

  // ── Counts ──
  const students = profiles.filter((p) => p.role === "student");
  const teachers = profiles.filter((p) => p.role === "teacher");
  const totalUsers = profiles.length;

  // ── Application stats ──
  const appStats = {
    total: applications.length,
    pending: applications.filter((a) => a.status === "pending").length,
    approved: applications.filter((a) => a.status === "approved").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
  };

  // ── Lesson stats ──
  const lessonStats = {
    total: bookings.length,
    trial: bookings.filter((b) => b.status === "pending").length,
    evaluating: bookings.filter((b) => b.status === "confirmed").length,
    active: bookings.filter((b) => b.status === "completed").length,
    cancelled: bookings.filter((b) => b.status === "cancelled").length,
  };

  // ── Student request (booking workflow) stats ──
  const requestStats = {
    new: bookings.filter((b) => b.status === "new").length,
    in_progress: bookings.filter((b) => b.status === "in_progress").length,
    accepted: bookings.filter((b) => b.status === "accepted").length,
  };

  // ── Payment stats ──
  const totalRevenue = payments
    .filter((p) => p.status === "verified")
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  const paymentStats = {
    pending: payments.filter((p) => p.status === "pending").length,
    verified: payments.filter((p) => p.status === "verified").length,
    rejected: payments.filter((p) => p.status === "rejected").length,
    revenue: totalRevenue,
  };

  // ── Rating stats ──
  const totalRating = reviews.reduce((sum, r) => sum + (r.rating ?? 0), 0);
  const avgRating = reviews.length > 0 ? totalRating / reviews.length : 0;

  // ── Growth over last 30 days (daily) ──
  const now = new Date();
  const days: { date: string; students: number; teachers: number; bookings: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const day = new Date(now);
    day.setDate(day.getDate() - i);
    const dayStr = day.toISOString().slice(0, 10);
    const dayLabel = day.toLocaleDateString("ar-EG", { day: "numeric", month: "short" });

    const studentsOnDay = students.filter((s) =>
      s.created_at && s.created_at.slice(0, 10) === dayStr
    ).length;
    const teachersOnDay = teachers.filter((t) =>
      t.created_at && t.created_at.slice(0, 10) === dayStr
    ).length;
    const bookingsOnDay = bookings.filter((b) =>
      b.created_at && b.created_at.slice(0, 10) === dayStr
    ).length;

    days.push({
      date: dayLabel,
      students: studentsOnDay,
      teachers: teachersOnDay,
      bookings: bookingsOnDay,
    });
  }

  // ── Lesson status breakdown for pie chart ──
  const lessonBreakdown = [
    { name: "تجريبية", value: lessonStats.trial, fill: "#facc15" },
    { name: "بانتظار تقييم", value: lessonStats.evaluating, fill: "#a855f7" },
    { name: "مشتركين نشطين", value: lessonStats.active, fill: "#22c55e" },
    { name: "ملغاة", value: lessonStats.cancelled, fill: "#ef4444" },
  ].filter((x) => x.value > 0);

  // ── Top 5 teachers by bookings ──
  const teacherBookingCount = new Map<string, number>();
  for (const b of bookings) {
    teacherBookingCount.set(b.teacher_id, (teacherBookingCount.get(b.teacher_id) ?? 0) + 1);
  }
  const teacherRatingSum = new Map<string, { total: number; count: number }>();
  for (const r of reviews) {
    const e = teacherRatingSum.get(r.teacher_id) ?? { total: 0, count: 0 };
    e.total += r.rating ?? 0;
    e.count += 1;
    teacherRatingSum.set(r.teacher_id, e);
  }

  const topTeacherIds = [...teacherBookingCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id]) => id);

  const { data: topTeacherProfiles } = topTeacherIds.length > 0
    ? await supabaseAdmin.from("profiles").select("id, full_name, avatar_url").in("id", topTeacherIds)
    : { data: [] };

  const topTeachers = (topTeacherProfiles ?? []).map((t: any) => {
    const rating = teacherRatingSum.get(t.id);
    return {
      id: t.id,
      name: t.full_name,
      avatar: t.avatar_url,
      bookings: teacherBookingCount.get(t.id) ?? 0,
      rating: rating && rating.count > 0 ? rating.total / rating.count : 0,
      reviewCount: rating?.count ?? 0,
    };
  }).sort((a, b) => b.bookings - a.bookings);

  // ── Top cities ──
  const cityMap = new Map<string, number>();
  for (const p of profiles) {
    if (p.city) cityMap.set(p.city, (cityMap.get(p.city) ?? 0) + 1);
  }
  const topCities = [...cityMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, count]) => ({ name, count }));

  // ── Rating distribution ──
  const ratingDist = [1, 2, 3, 4, 5].map((star) => ({
    star: `${star} ★`,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  return {
    counts: {
      totalUsers,
      students: students.length,
      teachers: teachers.length,
      applications: appStats,
      lessons: lessonStats,
      requests: requestStats,
      payments: paymentStats,
      reviews: { total: reviews.length, avgRating },
    },
    growth: days,
    lessonBreakdown,
    topTeachers,
    topCities,
    ratingDist,
  };
}

export type AdminAnalytics = Awaited<ReturnType<typeof getAdminAnalytics>>;
