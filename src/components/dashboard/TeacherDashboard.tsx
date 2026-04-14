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
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { deleteOwnAccount } from "@/actions/admin";
import type { Profile } from "@/lib/types";
import { DashboardLayout } from "./shared/DashboardLayout";
import type { SidebarItem } from "./shared/Sidebar";

type Section = "profile" | "reviews" | "notifications" | "bookings";

type ProfileState = {
  full_name: string;
  username: string;
  subjects: string[];
  hourly_rate: number;
  districts: string[];
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

const DISTRICTS = [
  "المروج",
  "العليا",
  "القادسية",
  "المصيف",
  "الروضة",
  "التعاون",
  "النهضة",
  "الياسمين",
];

export default function TeacherDashboard({ profile: baseProfile }: { profile?: Profile } = {}) {
  const [section, setSection] = useState<Section>("profile");
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileState>({
    full_name: "",
    username: "",
    subjects: [],
    hourly_rate: 0,
    districts: [],
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
          bio: pubProf?.bio ?? "",
          is_published: pubProf?.is_published ?? false,
          certificates: pubProf?.certificates ?? [],
        });
      }

      setStats({ bookings: bCount ?? 0, reviews: rev.count ?? 0 });
      setBookings((bRows as BookingRow[]) ?? []);
      setReviews((rev.data as ReviewRow[]) ?? []);
      setNotifs((notif.data as NotifRow[]) ?? []);
      setLoading(false);
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
        id: "bookings",
        label: "الحجوزات",
        icon: <CalendarCheck className="w-5 h-5" />,
        onSelect: () => setSection("bookings"),
        badge: stats.bookings || undefined,
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
    ],
    [stats.bookings, stats.reviews, unread]
  );

  const meta: Record<Section, { title: string; subtitle: string }> = {
    profile: { title: "ملفي الشخصي", subtitle: "حافظ على بياناتك كاملة لجذب المزيد من الطلاب." },
    bookings: { title: "الحجوزات", subtitle: "طلبات التواصل والحجوزات الواردة إليك." },
    reviews: { title: "التقييمات", subtitle: "رد على طلابك لبناء ثقة أكبر." },
    notifications: { title: "الإشعارات", subtitle: "آخر أحداث حسابك على المنصة." },
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

      {section === "profile" && (
        <ProfileSection
          profile={profile}
          setProfile={setProfile}
          isProfileComplete={isProfileComplete}
          togglePublish={togglePublish}
          notify={(m) => {
            setMessage(m);
            setTimeout(() => setMessage(null), 3000);
          }}
        />
      )}
      {section === "bookings" && <BookingsList bookings={bookings} />}
      {section === "reviews" && <ReviewsList reviews={reviews} setReviews={setReviews} notify={setMessage} />}
      {section === "notifications" && <NotificationsList notifs={notifs} setNotifs={setNotifs} />}
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
}: {
  profile: ProfileState;
  setProfile: React.Dispatch<React.SetStateAction<ProfileState>>;
  isProfileComplete: boolean;
  togglePublish: () => void;
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
          <Field
            icon={<BookOpen className="w-4 h-4" />}
            label="التخصص"
            value={profile.subjects[0] ?? ""}
            onChange={(v) => setProfile((p) => ({ ...p, subjects: v ? [v] : [] }))}
          />
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

      {/* Districts */}
      <div className="bg-white/5 border border-white/10 rounded-[28px] p-6 md:p-8">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-red-500" /> أحياء التغطية في تبوك
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {DISTRICTS.map((d) => (
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
