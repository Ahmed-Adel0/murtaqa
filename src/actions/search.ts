"use server";

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { createClient } from "@/lib/supabaseServer";

interface SearchFilters {
  subject?: string;
  gradeLevel?: string;
  dayOfWeek?: number;
  timeStart?: string;
  timeEnd?: string;
  city?: string;
  district?: string;
}

export async function searchTeachers(filters: SearchFilters) {
  // Layer 1: Verify admin
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "غير مصرح", results: [] };

  const { data: callerProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (callerProfile?.role !== "admin") {
    return { success: false, error: "هذه العملية للمسؤولين فقط", results: [] };
  }

  // Layer 2: Fetch all published teachers
  const { data: rawTeachers, error: fetchError } = await supabaseAdmin
    .from("teacher_public_profiles")
    .select("teacher_id, bio, subjects, districts, hourly_rate, grade_levels, is_published")
    .eq("is_published", true);

  if (fetchError) {
    return { success: false, error: fetchError.message, results: [] };
  }

  let pool = rawTeachers ?? [];

  // Filter by subject (array contains)
  if (filters.subject) {
    const sub = filters.subject;
    pool = pool.filter((t) => (t.subjects as string[] | null)?.includes(sub));
  }

  // Filter by grade level (array contains)
  if (filters.gradeLevel) {
    const gl = filters.gradeLevel;
    pool = pool.filter((t) => (t.grade_levels as string[] | null)?.includes(gl));
  }

  // Filter by district (array contains)
  if (filters.district) {
    const dist = filters.district;
    pool = pool.filter((t) => (t.districts as string[] | null)?.includes(dist));
  }

  if (pool.length === 0) {
    return { success: true, results: [] };
  }

  // Fetch profiles for matched teacher IDs
  const matchedIds = pool.map((t) => t.teacher_id);
  const { data: profilesData } = await supabaseAdmin
    .from("profiles")
    .select("id, full_name, email, phone, city, avatar_url")
    .in("id", matchedIds);

  const profileMap = new Map(
    (profilesData ?? []).map((p: any) => [p.id, p])
  );

  // Build results with profile data
  let results = pool.map((t) => {
    const prof = profileMap.get(t.teacher_id);
    return {
      teacher_id: t.teacher_id,
      bio: t.bio,
      subjects: t.subjects,
      districts: t.districts,
      hourly_rate: t.hourly_rate,
      grade_levels: t.grade_levels,
      full_name: prof?.full_name ?? null,
      email: prof?.email ?? null,
      phone: prof?.phone ?? null,
      city: prof?.city ?? null,
      avatar_url: prof?.avatar_url ?? null,
      availability: [] as any[],
    };
  });

  // Filter by city
  if (filters.city) {
    const cityTerm = filters.city.toLowerCase();
    results = results.filter(
      (t) => t.city && t.city.toLowerCase().includes(cityTerm)
    );
  }

  // Fetch and filter by availability
  if (results.length > 0) {
    const resultIds = results.map((t) => t.teacher_id);
    let availQuery = supabaseAdmin
      .from("teacher_availability")
      .select("*")
      .in("teacher_id", resultIds);

    if (filters.dayOfWeek !== undefined && filters.dayOfWeek >= 0) {
      availQuery = availQuery.eq("day_of_week", filters.dayOfWeek);
    }
    if (filters.timeStart) {
      availQuery = availQuery.gte("start_time", filters.timeStart);
    }
    if (filters.timeEnd) {
      availQuery = availQuery.lte("end_time", filters.timeEnd);
    }

    const { data: availability } = await availQuery;

    // If any time filter is active, only keep teachers who have matching slots
    if (filters.dayOfWeek !== undefined || filters.timeStart || filters.timeEnd) {
      const idsWithAvail = new Set(
        (availability ?? []).map((a: any) => a.teacher_id)
      );
      results = results.filter((t) => idsWithAvail.has(t.teacher_id));
    }

    // Attach availability slots to each teacher
    for (const teacher of results) {
      teacher.availability = (availability ?? []).filter(
        (a: any) => a.teacher_id === teacher.teacher_id
      );
    }
  }

  return { success: true, results };
}
