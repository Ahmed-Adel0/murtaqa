"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import {
  User,
  DollarSign,
  BookOpen,
  MapPin,
  Clock,
  GraduationCap,
  Eye,
  EyeOff,
  Save,
  Loader2,
  Info,
  Camera,
  Image as ImageIcon,
  Star,
  MessageSquare,
  Send,
  UserCircle,
  Trash2,
  Bell,
  CalendarCheck,
  Inbox,
  Settings as SettingsIcon,
  Mail,
  Lock,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { deleteOwnAccount } from "@/actions/admin";
import { updateTeacherCredentials } from "@/actions/teacher-credentials";
import type { Profile } from "@/lib/types";
import { GRADE_LEVELS } from "@/lib/constants/grade-levels";
import type { GradeLevel } from "@/lib/constants/grade-levels";
import { getSubjectsForGrades } from "@/lib/constants/subjects";
import { SAUDI_REGIONS, getNeighborhoods } from "@/lib/constants/locations";
import { DashboardLayout } from "./shared/DashboardLayout";
import type { SidebarItem } from "./shared/Sidebar";

import AvailabilityManager from "./teacher/AvailabilityManager";

type Section = "profile" | "reviews" | "notifications" | "bookings" | "availability" | "meetings" | "settings";

type ProfileState = {
  full_name: string;
  username: string;
  subjects: string[];
  hourly_rate: number;
  districts: string[];
  grade_levels: string[];
  bio: string;
  is_published: boolean;
  avatar_url: string;
  certificates: string[];
};

type ReviewRow = {
  id: string;
  student_name: string | null;
  rating: number | null;
  comment: string | null;
  teacher_reply: string | null;
  created_at: string;
};

type NotifRow = {
  id: string;
  title: string | null;
  message: string | null;
  created_at: string;
  is_read: boolean;
};

type BookingRow = {
  id: string;
  student_name: string | null;
  created_at: string;
  status?: string | null;
};

export default function TeacherDashboard({ profile: baseProfile }: { profile?: Profile } = {}) {
  const [section, setSection] = useState<Section>("profile");
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileState>({
    full_name: "",
    username: "",
    subjects: [],
    hourly_rate: 0,
    districts: [],
    grade_levels: [],
    bio: "",
    is_published: false,
    avatar_url: "",
    certificates: [],
  });
  const [stats, setStats] = useState({ bookings: 0, reviews: 0 });
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [notifs, setNotifs] = useState<NotifRow[]>([]);
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [message, setMessage] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const [isLegacyTeacher, setIsLegacyTeacher] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const [{ data: prof }, { data: pubProf }, { count: bCount, data: bRows }, rev, notif] =
        await Promise.all([
          supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
          supabase.from("teacher_public_profiles").select("*").eq("teacher_id", user.id).maybeSingle(),
          supabase
            .from("bookings")
            .select("id,student_name,created_at,status", { count: "exact" })
            .eq("teacher_id", user.id)
            .order("created_at", { ascending: false })
            .limit(20),
          supabase
            .from("reviews")
            .select("id,student_name,rating,comment,teacher_reply,created_at", { count: "exact" })
            .eq("teacher_id", user.id)
            .order("created_at", { ascending: false }),
          supabase
            .from("notifications")
            .select("id,title,message,created_at,is_read")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false }),
        ]);

      if (prof || pubProf) {
        setProfile({
          full_name: prof?.full_name ?? "",
          username: prof?.username ?? prof?.email?.split("@")[0] ?? "",
          avatar_url: prof?.avatar_url ?? "",
          subjects: pubProf?.subjects ?? [],
          hourly_rate: pubProf?.hourly_rate ?? 0,
          districts: pubProf?.districts ?? [],
          grade_levels: pubProf?.grade_levels ?? [],
          bio: pubProf?.bio ?? "",
          is_published: pubProf?.is_published ?? false,
          certificates: pubProf?.certificates ?? [],
        });
      }

      setStats({ bookings: bCount ?? 0, reviews: rev.count ?? 0 });
      setBookings((bRows as BookingRow[]) ?? []);
      setReviews((rev.data as ReviewRow[]) ?? []);
      setNotifs((notif.data as NotifRow[]) ?? []);

      // Check if teacher has a legacy placeholder email
      if (user.email?.endsWith("@murtaqa.com")) {
        setIsLegacyTeacher(true);
      }

      setLoading(false);

      // Realtime: listen for new notifications
      const channel = supabase
        .channel(`teacher-notifs-${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            const n = payload.new as NotifRow;
            setNotifs((prev) => [n, ...prev]);
          }
        )
        .subscribe();

      return () => { channel.unsubscribe(); };
    })();
  }, []);

  const completed =
    Number(!!profile.full_name) +
    Number(!!profile.bio && profile.bio.length > 20) +
    Number(profile.hourly_rate > 0) +
    Number(profile.subjects.length > 0) +
    Number(profile.districts.length > 0);
  const isProfileComplete = completed === 5;
  const unread = notifs.filter((n) => !n.is_read).length;

  const items: SidebarItem[] = useMemo(
    () => [
      {
        id: "profile",
        label: "ملفي الشخصي",
        icon: <User className="w-5 h-5" />,
        onSelect: () => setSection("profile"),
      },
      {
        id: "availability",
        label: "الأوقات المتاحة",
        icon: <Clock className="w-5 h-5" />,
        onSelect: () => setSection("availability"),
      },
      {
        id: "bookings",
        label: "الحجوزات",
        icon: <CalendarCheck className="w-5 h-5" />,
        onSelect: () => setSection("bookings"),
        badge: stats.bookings || undefined,
      },
      {
        id: "meetings",
        label: "الحصص",
        icon: <GraduationCap className="w-5 h-5" />,
        onSelect: () => setSection("meetings"),
      },
      {
        id: "reviews",
        label: "التقييمات",
        icon: <Star className="w-5 h-5" />,
        onSelect: () => setSection("reviews"),
        badge: stats.reviews || undefined,
      },
      {
        id: "notifications",
        label: "الإشعارات",
        icon: <Bell className="w-5 h-5" />,
        onSelect: () => setSection("notifications"),
        badge: unread || undefined,
      },
      {
        id: "settings",
        label: "الإعدادات",
        icon: <SettingsIcon className="w-5 h-5" />,
        onSelect: () => setSection("settings"),
        badge: isLegacyTeacher ? 1 : undefined,
      },
    ],
    [stats.bookings, stats.reviews, unread]
  );

  const meta: Record<Section, { title: string; subtitle: string }> = {
    profile: { title: "ملفي الشخصي", subtitle: "حافظ على بياناتك كاملة لجذب المزيد من الطلاب." },
    availability: { title: "الأوقات المتاحة", subtitle: "حدد الأوقات التي يمكنك التدريس فيها." },
    bookings: { title: "الحجوزات", subtitle: "طلبات التواصل والحجوزات الواردة إليك." },
    meetings: { title: "الحصص", subtitle: "حصصك الدراسية المجدولة." },
    reviews: { title: "التقييمات", subtitle: "رد على طلابك لبناء ثقة أكبر." },
    notifications: { title: "الإشعارات", subtitle: "آخر أحداث حسابك على المنصة." },
    settings: { title: "الإعدادات", subtitle: "تحديث بيانات حسابك وتفضيلاتك." },
  };

  const togglePublish = async () => {
    if (!isProfileComplete && !profile.is_published) {
      alert("يرجى إكمال جميع بيانات البروفايل أولاً");
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    const newStatus = !profile.is_published;
    await supabase
      .from("teacher_public_profiles")
      .update({ is_published: newStatus })
      .eq("teacher_id", user?.id);
    setProfile((p) => ({ ...p, is_published: newStatus }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#060607] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <DashboardLayout
      title={meta[section].title}
      subtitle={meta[section].subtitle}
      user={{
        displayName: profile.full_name || baseProfile?.full_name || null,
        avatarUrl: profile.avatar_url || baseProfile?.avatar_url || null,
        roleLabel: "معلم",
      }}
      items={items}
      activeId={section}
      headerAction={
        section === "profile" ? (
          <button
            type="button"
            onClick={togglePublish}
            disabled={!isProfileComplete && !profile.is_published}
            className={`hidden md:flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm transition-all border-2 ${
              profile.is_published
                ? "bg-green-500/10 border-green-500/20 text-green-400"
                : isProfileComplete
                ? "bg-blue-600 border-blue-500 text-white"
                : "bg-white/5 border-white/5 text-white/20 cursor-not-allowed"
            }`}
          >
            {profile.is_published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            {profile.is_published ? "ظاهر للطلاب" : "نشر الملف"}
          </button>
        ) : undefined
      }
    >
      {message && (
        <div
          className={`mb-5 p-3 rounded-xl text-sm font-bold text-center ${
            message.kind === "success"
              ? "bg-green-500/10 text-green-400 border border-green-500/20"
              : "bg-red-500/10 text-red-400 border border-red-500/20"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Legacy teacher banner */}
      {isLegacyTeacher && section !== "settings" && (
        <div
          className="mb-5 p-4 bg-orange-500/10 border-2 border-orange-500/20 rounded-2xl flex items-center gap-4 cursor-pointer hover:bg-orange-500/15 transition-all"
          onClick={() => setSection("settings")}
        >
          <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-orange-400" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-orange-300 text-sm">⚠️ حسابك يحتاج تحديث!</p>
            <p className="text-xs text-orange-400/70 mt-0.5">يرجى إضافة بريدك الإلكتروني الحقيقي وكلمة مرور جديدة. اضغط هنا →</p>
          </div>
        </div>
      )}

      {section === "availability" && <AvailabilityManager />}
      {section === "profile" && (
        <ProfileSection
          profile={profile}
          setProfile={setProfile}
          isProfileComplete={isProfileComplete}
          togglePublish={togglePublish}
          baseCity={baseProfile?.city ?? null}
          notify={(m) => {
            setMessage(m);
            setTimeout(() => setMessage(null), 3000);
          }}
        />
      )}
      {section === "bookings" && <BookingsList bookings={bookings} />}
      {section === "meetings" && <TeacherMeetingsList />}
      {section === "reviews" && <ReviewsList reviews={reviews} setReviews={setReviews} notify={setMessage} />}
      {section === "notifications" && <NotificationsList notifs={notifs} setNotifs={setNotifs} />}
      {section === "settings" && (
        <TeacherSettingsSection
          isLegacy={isLegacyTeacher}
          onCredentialsUpdated={() => setIsLegacyTeacher(false)}
        />
      )}
    </DashboardLayout>
  );
}

/* ───────────── Profile Section ───────────── */

function ProfileSection({
  profile,
  setProfile,
  isProfileComplete,
  togglePublish,
  notify,
  baseCity,
}: {
  profile: ProfileState;
  setProfile: React.Dispatch<React.SetStateAction<ProfileState>>;
  isProfileComplete: boolean;
  togglePublish: () => void;
  baseCity: string | null;
  notify: (m: { kind: "success" | "error"; text: string }) => void;
}) {
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCert, setUploadingCert] = useState(false);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user");
      await supabase.from("profiles").update({ full_name: profile.full_name }).eq("id", user.id);
      const { error } = await supabase
        .from("teacher_public_profiles")
        .update({
          bio: profile.bio,
          hourly_rate: profile.hourly_rate,
          subjects: profile.subjects,
          districts: profile.districts,
          grade_levels: profile.grade_levels,
        })
        .eq("teacher_id", user.id);
      if (error) throw error;
      notify({ kind: "success", text: "تم حفظ التغييرات بنجاح." });
    } catch (err) {
      notify({ kind: "error", text: err instanceof Error ? err.message : "فشل الحفظ" });
    } finally {
      setSaving(false);
    }
  };

  const uploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setUploadingAvatar(true);
    try {
      const file = e.target.files[0];
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const path = `avatars/${user.id}/${Date.now()}`;
      const { error: uErr } = await supabase.storage.from("teacher-assets").upload(path, file);
      if (uErr) throw uErr;
      const { data: { publicUrl } } = supabase.storage.from("teacher-assets").getPublicUrl(path);
      await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("id", user.id);
      await supabase.from("teacher_public_profiles").update({ avatar_url: publicUrl }).eq("teacher_id", user.id);
      setProfile((p) => ({ ...p, avatar_url: publicUrl }));
      notify({ kind: "success", text: "تم تحديث الصورة الشخصية." });
    } catch (err) {
      notify({ kind: "error", text: err instanceof Error ? err.message : "خطأ" });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const uploadCertificate = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setUploadingCert(true);
    try {
      const file = e.target.files[0];
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const path = `certificates/${user.id}/${Date.now()}`;
      const { error: uErr } = await supabase.storage.from("teacher-assets").upload(path, file);
      if (uErr) throw uErr;
      const { data: { publicUrl } } = supabase.storage.from("teacher-assets").getPublicUrl(path);
      const newCerts = [...profile.certificates, publicUrl];
      await supabase.from("teacher_public_profiles").update({ certificates: newCerts }).eq("teacher_id", user.id);
      setProfile((p) => ({ ...p, certificates: newCerts }));
    } catch (err) {
      notify({ kind: "error", text: err instanceof Error ? err.message : "خطأ" });
    } finally {
      setUploadingCert(false);
    }
  };

  const deleteAccount = async () => {
    if (!window.confirm("هل أنت متأكد من حذف حسابك نهائياً؟ لا يمكن التراجع.")) return;
    if (!window.confirm("تأكيد أخير: سيتم حذف الحساب الآن.")) return;
    const res = await deleteOwnAccount();
    if (res.success) {
      await supabase.auth.signOut();
      window.location.href = "/";
    } else {
      notify({ kind: "error", text: res.error ?? "فشل الحذف" });
    }
  };

  return (
    <form onSubmit={save} className="space-y-6">
      {/* Profile header card */}
      <div className="bg-white/5 border border-white/10 rounded-[28px] p-6 md:p-8 flex flex-col md:flex-row items-center gap-6">
        <div className="relative group/avatar shrink-0">
          <div className="w-24 h-24 bg-blue-500/10 rounded-3xl flex items-center justify-center overflow-hidden border-2 border-white/10 relative">
            {profile.avatar_url ? (
              <Image src={profile.avatar_url} alt="" fill className="object-cover" />
            ) : (
              <UserCircle className="w-12 h-12 text-blue-500" />
            )}
            {uploadingAvatar && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-white" />
              </div>
            )}
          </div>
          <label className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95 transition-all border-4 border-[#060607]">
            <Camera className="w-3.5 h-3.5 text-white" />
            <input type="file" accept="image/*" onChange={uploadAvatar} className="hidden" />
          </label>
        </div>
        <div className="flex-1 text-center md:text-right">
          <h2 className="text-xl font-black">{profile.full_name || "معلم جديد"}</h2>
          <p className="text-xs text-blue-400 font-mono mt-1">@{profile.username}</p>
        </div>
        <button
          type="button"
          onClick={togglePublish}
          disabled={!isProfileComplete && !profile.is_published}
          className={`md:hidden w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl font-bold text-sm transition-all border-2 ${
            profile.is_published
              ? "bg-green-500/10 border-green-500/20 text-green-400"
              : isProfileComplete
              ? "bg-blue-600 border-blue-500 text-white"
              : "bg-white/5 border-white/5 text-white/20 cursor-not-allowed"
          }`}
        >
          {profile.is_published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          {profile.is_published ? "ظاهر للطلاب" : "نشر الملف"}
        </button>
      </div>

      {/* Form */}
      <div className="bg-white/5 border border-white/10 rounded-[28px] p-6 md:p-8 space-y-5">
        <Field
          icon={<User className="w-4 h-4" />}
          label="الاسم الكامل"
          value={profile.full_name}
          onChange={(v) => setProfile((p) => ({ ...p, full_name: v }))}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
         {/*  <Field
            icon={<DollarSign className="w-4 h-4" />}
            label="سعر الساعة (ريال)"
            type="number"
            value={String(profile.hourly_rate)}
            onChange={(v) => setProfile((p) => ({ ...p, hourly_rate: parseInt(v) || 0 }))}
          /> */}
          <div className="space-y-2">
            <label className="text-xs font-black text-white/40 uppercase tracking-widest">التخصص</label>
            <div className="relative">
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30">
                <BookOpen className="w-4 h-4" />
              </div>
              <select
                value={profile.subjects[0] ?? ""}
                onChange={(v) => setProfile((p) => ({ ...p, subjects: v.target.value ? [v.target.value] : [] }))}
                className="w-full bg-black/40 border border-white/10 rounded-2xl py-3.5 pr-11 pl-5 focus:border-blue-500 outline-none transition-all font-bold text-sm appearance-none"
              >
                <option value="">اختر المادة</option>
                {getSubjectsForGrades(profile.grade_levels as GradeLevel[]).map((s) => (
                  <option key={s.value} value={s.label}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-black text-white/40 uppercase tracking-widest">النبذة التعريفية</label>
          <textarea
            rows={4}
            value={profile.bio}
            onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
            className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 focus:border-blue-500 outline-none transition-all resize-none text-white/80 leading-relaxed text-sm"
          />
        </div>
      </div>

      {/* Districts — city-aware */}
      <TeacherDistrictsSection profile={profile} setProfile={setProfile} baseCity={baseCity} />

      {/* Grade Levels */}
      <div className="bg-white/5 border border-white/10 rounded-[28px] p-6 md:p-8">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-green-500" /> المراحل الدراسية
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {GRADE_LEVELS.map((g) => (
            <button
              key={g.value}
              type="button"
              onClick={() =>
                setProfile((prev) => ({
                  ...prev,
                  grade_levels: prev.grade_levels.includes(g.value)
                    ? prev.grade_levels.filter((x) => x !== g.value)
                    : [...prev.grade_levels, g.value],
                }))
              }
              className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                profile.grade_levels.includes(g.value)
                  ? "bg-green-600 border-green-500 text-white"
                  : "bg-white/5 border-white/5 text-white/40 hover:text-white/70"
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      {/* Certificates */}
      <div className="bg-white/5 border border-white/10 rounded-[28px] p-6 md:p-8 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-blue-500" /> الشهادات والخبرات
          </h3>
          <label className="cursor-pointer bg-white text-black px-4 py-2 rounded-xl text-xs font-black hover:bg-blue-500 hover:text-white transition-all">
            {uploadingCert ? <Loader2 className="w-4 h-4 animate-spin" /> : "رفع +"}
            <input type="file" className="hidden" onChange={uploadCertificate} disabled={uploadingCert} />
          </label>
        </div>
        {profile.certificates.length === 0 ? (
          <p className="text-center text-xs text-white/30 py-6">لم ترفع أي شهادات بعد.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {profile.certificates.map((url, i) => (
              <div
                key={i}
                className="relative aspect-video rounded-2xl overflow-hidden border border-white/5 bg-black"
              >
                <Image src={url} alt="" fill className="object-cover" />
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={saving}
        className="w-full bg-white text-black py-3.5 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-blue-600 hover:text-white transition-all shadow-2xl disabled:opacity-50"
      >
        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
        حفظ التعديلات
      </button>

      {/* Danger zone */}
      <div className="bg-red-500/5 border border-red-500/10 p-5 rounded-[24px] flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="text-center md:text-right">
          <h3 className="text-red-500 font-bold mb-1 text-sm">منطقة الخطر</h3>
          <p className="text-white/40 text-xs">حذف الحساب سيمسح بياناتك نهائياً ولا يمكن التراجع.</p>
        </div>
        <button
          type="button"
          onClick={deleteAccount}
          className="flex items-center gap-2 px-4 py-2.5 bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white rounded-xl text-xs font-bold transition-all whitespace-nowrap"
        >
          <Trash2 className="w-4 h-4" />
          حذف الحساب
        </button>
      </div>
    </form>
  );
}

/* ───────────── Teacher Meetings ───────────── */

function TeacherDistrictsSection({
  profile,
  setProfile,
  baseCity,
}: {
  profile: ProfileState;
  setProfile: React.Dispatch<React.SetStateAction<ProfileState>>;
  baseCity: string | null;
}) {
  // Find the city value from the label stored in the profile
  const cityEntry = SAUDI_REGIONS.flatMap((r) => r.cities).find(
    (c) => c.label === baseCity
  );
  const neighborhoods = cityEntry ? getNeighborhoods(cityEntry.value) : [];

  // If the teacher's city has neighborhoods defined, show them
  // Otherwise show a simple text input for districts
  if (neighborhoods.length > 0) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-[28px] p-6 md:p-8">
        <h3 className="font-bold mb-1 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-red-500" /> أحياء التغطية
        </h3>
        <p className="text-xs text-white/40 mb-4">
          في {baseCity}
          {profile.districts.length > 0 && (
            <span className="text-blue-400 mr-2">({profile.districts.length} محدد)</span>
          )}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {neighborhoods.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() =>
                setProfile((prev) => ({
                  ...prev,
                  districts: prev.districts.includes(d)
                    ? prev.districts.filter((x) => x !== d)
                    : [...prev.districts, d],
                }))
              }
              className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                profile.districts.includes(d)
                  ? "bg-blue-600 border-blue-500 text-white"
                  : "bg-white/5 border-white/5 text-white/40 hover:text-white/70"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Fallback: free-text districts for cities without predefined neighborhoods
  return (
    <div className="bg-white/5 border border-white/10 rounded-[28px] p-6 md:p-8">
      <h3 className="font-bold mb-4 flex items-center gap-2">
        <MapPin className="w-5 h-5 text-red-500" /> أحياء التغطية
        {baseCity && <span className="text-xs text-white/30 font-normal">في {baseCity}</span>}
      </h3>
      <div className="flex flex-wrap gap-2 mb-3">
        {profile.districts.map((d) => (
          <span
            key={d}
            className="text-xs font-bold bg-blue-500/10 text-blue-300 border border-blue-500/20 px-3 py-1.5 rounded-full flex items-center gap-1.5"
          >
            {d}
            <button
              type="button"
              onClick={() =>
                setProfile((prev) => ({
                  ...prev,
                  districts: prev.districts.filter((x) => x !== d),
                }))
              }
              className="text-blue-400/50 hover:text-red-400"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="اكتب اسم الحي ثم اضغط إضافة..."
          id="district-input"
          className="flex-1 bg-black/40 border border-white/10 rounded-xl py-2.5 px-4 text-sm outline-none focus:border-blue-500"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              const input = e.currentTarget;
              const val = input.value.trim();
              if (val && !profile.districts.includes(val)) {
                setProfile((prev) => ({ ...prev, districts: [...prev.districts, val] }));
                input.value = "";
              }
            }
          }}
        />
        <button
          type="button"
          onClick={() => {
            const input = document.getElementById("district-input") as HTMLInputElement;
            const val = input?.value.trim();
            if (val && !profile.districts.includes(val)) {
              setProfile((prev) => ({ ...prev, districts: [...prev.districts, val] }));
              input.value = "";
            }
          }}
          className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-500 transition-all"
        >
          إضافة
        </button>
      </div>
    </div>
  );
}

/* ───────────── Teacher Meetings ───────────── */

function TeacherMeetingsList() {
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loadingMeetings, setLoadingMeetings] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoadingMeetings(false); return; }

      const { data, error: meetErr } = await supabase
        .from("meetings")
        .select("*")
        .eq("teacher_id", user.id)
        .order("scheduled_at", { ascending: false });

      if (meetErr) { setLoadingMeetings(false); return; }

      if (data && data.length > 0) {
        const studentIds = [...new Set(data.map((m: any) => m.student_id))];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", studentIds);
        const nameMap = new Map((profiles ?? []).map((p: any) => [p.id, p.full_name]));
        setMeetings(data.map((m: any) => ({ ...m, student_name: nameMap.get(m.student_id) ?? "طالب" })));
      }
      setLoadingMeetings(false);
    })();
  }, []);

  if (loadingMeetings) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (meetings.length === 0) {
    return <EmptyCard icon={<GraduationCap />} title="لا توجد حصص مجدولة" />;
  }

  return (
    <div className="space-y-3">
      {meetings.map((m: any) => (
        <div
          key={m.id}
          className="bg-white/5 border border-white/10 rounded-[24px] p-5 flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${
              m.status === "completed" ? "bg-green-500/10 border border-green-500/20" :
              m.status === "cancelled" ? "bg-red-500/10 border border-red-500/20" :
              "bg-blue-500/10 border border-blue-500/20"
            }`}>
              <GraduationCap className={`w-5 h-5 ${
                m.status === "completed" ? "text-green-400" :
                m.status === "cancelled" ? "text-red-400" :
                "text-blue-400"
              }`} />
            </div>
            <div>
              <p className="font-bold text-sm">حصة مع {m.student_name}</p>
              <p className="text-xs text-white/40">
                {new Date(m.scheduled_at).toLocaleDateString("ar-EG", {
                  day: "numeric", month: "long", year: "numeric",
                  hour: "2-digit", minute: "2-digit",
                })}
                {" · "}{m.duration_minutes} دقيقة
              </p>
            </div>
          </div>
          <span className={`text-[11px] font-black uppercase tracking-widest ${
            m.status === "completed" ? "text-green-400" :
            m.status === "cancelled" ? "text-red-400" :
            "text-blue-400"
          }`}>
            {m.status === "scheduled" ? "مجدولة" : m.status === "completed" ? "مكتملة" : "ملغاة"}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ───────────── Reviews ───────────── */

function ReviewsList({
  reviews,
  setReviews,
  notify,
}: {
  reviews: ReviewRow[];
  setReviews: React.Dispatch<React.SetStateAction<ReviewRow[]>>;
  notify: (m: { kind: "success" | "error"; text: string }) => void;
}) {
  const [replies, setReplies] = useState<Record<string, string>>({});

  const send = async (id: string) => {
    const reply = replies[id]?.trim();
    if (!reply) return;
    try {
      const { error } = await supabase
        .from("reviews")
        .update({ teacher_reply: reply, reply_date: new Date() })
        .eq("id", id);
      if (error) throw error;
      setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, teacher_reply: reply } : r)));
      notify({ kind: "success", text: "تم إرسال ردك." });
    } catch (err) {
      notify({ kind: "error", text: err instanceof Error ? err.message : "خطأ" });
    }
  };

  if (reviews.length === 0) {
    return <EmptyCard icon={<MessageSquare />} title="لا توجد تقييمات بعد" />;
  }

  return (
    <div className="space-y-4">
      <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl flex items-center gap-3">
        <Info className="w-5 h-5 text-amber-500 shrink-0" />
        <p className="text-sm font-medium text-amber-500/80">
          الرد على التقييمات يعزز ثقة أولياء الأمور.
        </p>
      </div>
      {reviews.map((r) => (
        <div key={r.id} className="bg-white/5 border border-white/10 p-6 rounded-[24px] space-y-4">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center font-black text-white/50">
                {(r.student_name ?? "?")[0]}
              </div>
              <div>
                <h4 className="font-bold text-sm">{r.student_name ?? ""}</h4>
                <div className="flex gap-1 mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${
                        i < (r.rating ?? 0) ? "text-yellow-500 fill-yellow-500" : "text-white/10"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
            <span className="text-[10px] text-white/30 font-bold">
              {new Date(r.created_at).toLocaleDateString("ar-EG")}
            </span>
          </div>
          <p className="text-white/60 text-sm leading-relaxed">{r.comment}</p>
          {r.teacher_reply ? (
            <div className="bg-blue-600/5 border-r-4 border-blue-500 p-4 rounded-xl">
              <p className="text-[10px] font-black text-blue-400 uppercase mb-1">ردك</p>
              <p className="text-sm text-white/80 leading-relaxed">{r.teacher_reply}</p>
            </div>
          ) : (
            <div className="space-y-2">
              <textarea
                placeholder="اكتب ردك..."
                value={replies[r.id] ?? ""}
                onChange={(e) => setReplies((p) => ({ ...p, [r.id]: e.target.value }))}
                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 focus:border-blue-500 outline-none text-sm resize-none"
                rows={2}
              />
              <button
                type="button"
                onClick={() => send(r.id)}
                className="bg-white text-black px-4 py-2 rounded-lg text-xs font-black flex items-center gap-2 hover:bg-blue-500 hover:text-white transition-all"
              >
                <Send className="w-3.5 h-3.5" /> إرسال
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ───────────── Notifications ───────────── */

function NotificationsList({
  notifs,
  setNotifs,
}: {
  notifs: NotifRow[];
  setNotifs: React.Dispatch<React.SetStateAction<NotifRow[]>>;
}) {
  const markAllRead = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("notifications").update({ is_read: true }).eq("user_id", user.id);
    setNotifs((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  if (notifs.length === 0) {
    return <EmptyCard icon={<Inbox />} title="لا توجد إشعارات" />;
  }

  const unread = notifs.filter((n) => !n.is_read).length;

  return (
    <div className="space-y-3">
      {unread > 0 && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={markAllRead}
            className="text-xs text-blue-400 hover:text-blue-300 font-bold"
          >
            تحديد الكل كمقروء
          </button>
        </div>
      )}
      {notifs.map((n) => (
        <motion.div
          key={n.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-5 rounded-[24px] border transition-all ${
            n.is_read
              ? "bg-white/[0.02] border-white/5 text-white/50"
              : "bg-blue-500/5 border-blue-500/20 text-white"
          }`}
        >
          <div className="flex items-start gap-4">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                n.is_read ? "bg-white/5" : "bg-blue-600/20 text-blue-400"
              }`}
            >
              <Bell className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-sm mb-1">{n.title}</h4>
              <p className="text-xs leading-relaxed">{n.message}</p>
              <p className="text-[10px] mt-2 opacity-50">
                {format(new Date(n.created_at), "d MMM yyyy · HH:mm", { locale: ar })}
              </p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/* ───────────── Bookings ───────────── */

function BookingsList({ bookings }: { bookings: BookingRow[] }) {
  if (bookings.length === 0) {
    return <EmptyCard icon={<CalendarCheck />} title="لا توجد حجوزات بعد" />;
  }
  return (
    <div className="space-y-3">
      {bookings.map((b) => (
        <div
          key={b.id}
          className="bg-white/5 border border-white/10 rounded-[24px] p-5 flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <CalendarCheck className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="font-bold text-sm">{b.student_name ?? "طالب"}</p>
              <p className="text-xs text-white/40">
                {new Date(b.created_at).toLocaleDateString("ar-EG", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
          <span className="text-[11px] font-black uppercase tracking-widest text-white/40">
            {b.status ?? "جديد"}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ───────────── Shared ───────────── */

function Field({
  icon,
  label,
  value,
  onChange,
  type = "text",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-black text-white/40 uppercase tracking-widest">{label}</label>
      <div className="relative">
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30">{icon}</div>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-black/40 border border-white/10 rounded-2xl py-3.5 pr-11 pl-5 focus:border-blue-500 outline-none transition-all font-bold text-sm"
        />
      </div>
    </div>
  );
}

function EmptyCard({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-[28px] p-12 text-center">
      <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-5 text-white/30">
        {icon}
      </div>
      <h3 className="text-lg font-black mb-2">{title}</h3>
    </div>
  );
}

/* ───────────── Settings Section (Legacy Update) ───────────── */

function TeacherSettingsSection({
  isLegacy,
  onCredentialsUpdated,
}: {
  isLegacy: boolean;
  onCredentialsUpdated: () => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await updateTeacherCredentials({
        newEmail: email,
        newPassword: password,
      });

      if (res.success) {
        setSuccess(true);
        onCredentialsUpdated();
      } else {
        setError(res.error || "حدث خطأ غير معروف");
      }
    } catch (err) {
      setError("حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {isLegacy && !success && (
        <div className="bg-orange-500/10 border-2 border-orange-500/20 rounded-[28px] p-6 lg:p-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/20 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6 text-orange-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-black text-orange-400 mb-2">تحديث بيانات الدخول (هام جداً)</h3>
              <p className="text-white/60 text-sm leading-relaxed mb-6 max-w-2xl">
                بسبب التحديث الجديد للنظام، يجب عليك تعيين بريد إلكتروني حقيقي وكلمة مرور جديدة لتتمكن من تسجيل الدخول في المرات القادمة بسلاسة وتلقي الإشعارات على بريدك.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
                <div className="space-y-2">
                  <label className="text-xs font-black text-white/40 uppercase tracking-widest">البريد الإلكتروني الجديد</label>
                  <div className="relative">
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="example@gmail.com"
                      dir="ltr"
                      className="w-full bg-black/40 border border-white/10 rounded-2xl py-3.5 pr-11 pl-5 focus:border-orange-500 outline-none transition-all font-bold text-sm text-left"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-white/40 uppercase tracking-widest">كلمة المرور الجديدة</label>
                  <div className="relative">
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="6 أحرف على الأقل"
                      dir="ltr"
                      className="w-full bg-black/40 border border-white/10 rounded-2xl py-3.5 pr-11 pl-5 focus:border-orange-500 outline-none transition-all font-bold text-sm text-left"
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-xl">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading || !email || !password}
                  className="w-full bg-orange-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-orange-600 transition-all shadow-[0_4px_24px_-8px_rgba(249,115,22,0.5)] disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  تحديث البيانات
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-[28px] p-8 text-center">
          <div className="w-16 h-16 rounded-3xl bg-green-500/20 border-2 border-green-500/30 flex items-center justify-center mx-auto mb-5 drop-shadow-2xl">
            <CheckCircle2 className="w-8 h-8 text-green-400" />
          </div>
          <h3 className="text-2xl font-black text-green-400 mb-2">تم التحديث بنجاح!</h3>
          <p className="text-white/60 text-sm max-w-sm mx-auto leading-relaxed">
            يمكنك الآن استخدام بريدك الإلكتروني الجديد وكلمة المرور في المرات القادمة لتسجيل الدخول إلى حسابك بأمان.
          </p>
        </div>
      )}

      {!isLegacy && !success && (
        <div className="bg-white/5 border border-white/10 rounded-[28px] p-10 text-center">
          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-6 h-6 text-blue-400" />
          </div>
          <h3 className="text-lg font-black mb-1">حسابك مؤمن ومحدث</h3>
          <p className="text-sm text-white/40">تفضيلات الإعدادات سيتم إضافتها قريباً.</p>
        </div>
      )}
    </div>
  );
}
