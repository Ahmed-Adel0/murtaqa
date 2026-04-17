"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  CheckCircle,
  XCircle,
  FileText,
  Loader2,
  Lock,
  Unlock,
  Trash2,
  X,
  ZoomIn,
  Phone,
  Mail,
  MapPin,
  BookOpen,
  Award,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { WhatsAppButton } from "@/components/ui/WhatsAppButton";
import { handleApplicationApproval, toggleTeacherPublish, deleteTeacherAccount } from "@/actions/admin";

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [certPreview, setCertPreview] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 8;

  useEffect(() => {
    fetchApplications();

    // --- Real-time Subscription (Phase 4) ---
    const channel = supabase
      .channel('admin-updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'teacher_applications' },
        () => fetchApplications()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('teacher_applications')
        .select(`
          *,
          profiles:user_id (
            full_name,
            email,
            avatar_url,
            phone,
            city,
            teacher_public_profiles (
              is_published
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (err) {
      console.error("Error fetching applications:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredApps = useMemo(
    () => applications.filter(app => app.status === activeTab),
    [applications, activeTab]
  );

  // Reset page when tab changes
  useEffect(() => { setCurrentPage(1); }, [activeTab]);

  const totalPages = Math.max(1, Math.ceil(filteredApps.length / PAGE_SIZE));
  const paginatedApps = filteredApps.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handleAction = async (id: string, status: 'approved' | 'rejected' | 'pending') => {
    setProcessingId(id);
    // userId is no longer passed — the server action fetches it
    // from the DB using applicationId to prevent IDOR attacks.
    const res = await handleApplicationApproval(id, status);
    
    if (res.success) {
      await fetchApplications();
    } else {
      alert("حدث خطأ: " + res.error);
    }
    setProcessingId(null);
  };

  const togglePublish = async (userId: string, currentStatus: boolean) => {
    const res = await toggleTeacherPublish(userId, !currentStatus);
    if (res.success) {
      await fetchApplications();
    } else {
      alert("خطأ في تغيير حالة النشر: " + res.error);
    }
  };

  const deleteProfile = async (userId: string) => {
    if (!confirm("هل أنت متأكد من حذف الملف العام لهذا المعلم؟ (سيتم سحب اعتماده أيضاً)")) return;
    
    const res = await deleteTeacherAccount(userId);
    if (res.success) {
      await fetchApplications();
      if (activeTab === 'approved') setActiveTab('rejected');
    } else {
      alert("خطأ أثناء الحذف: " + res.error);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#060607] flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#060607] text-white font-tajawal antialiased pt-8 p-8" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center gap-2 text-sm text-white/40">
           <Link href="/admin" className="hover:text-blue-500 transition-colors">لوحة التحكم</Link>
           <span>/</span>
           <span className="text-white/60">إدارة المعلمين</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black mb-2 flex items-center gap-3">
              <Users className="text-blue-500" />
              إدارة المعلمين
            </h1>
            <p className="text-white/40">مراجعة والتحكم في طلبات الانضمام والملفات العامة.</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 p-1.5 bg-white/5 border border-white/10 rounded-2xl mb-8 w-fit">
          <button 
            onClick={() => setActiveTab('pending')}
            className={`px-8 py-2.5 rounded-xl font-bold transition-all ${activeTab === 'pending' ? 'bg-blue-600 text-white shadow-lg' : 'text-white/40 hover:text-white'}`}
          >
            الطلبات ({applications.filter(a => a.status === 'pending').length})
          </button>
          <button 
            onClick={() => setActiveTab('approved')}
            className={`px-8 py-2.5 rounded-xl font-bold transition-all ${activeTab === 'approved' ? 'bg-green-600 text-white shadow-lg' : 'text-white/40 hover:text-white'}`}
          >
            المعتمدون ({applications.filter(a => a.status === 'approved').length})
          </button>
          <button 
            onClick={() => setActiveTab('rejected')}
            className={`px-8 py-2.5 rounded-xl font-bold transition-all ${activeTab === 'rejected' ? 'bg-red-600/20 text-red-500 border border-red-500/20' : 'text-white/40 hover:text-white'}`}
          >
            المرفوضون
          </button>
        </div>

        {/* Applications List */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {paginatedApps.map((app) => (
              <motion.div
                key={app.id}
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="group bg-white/5 border border-white/10 hover:border-white/20 rounded-[28px] p-6 md:p-8 space-y-5"
              >
                {/* Row 1: Avatar + Name + Contact + Actions */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden border border-white/10 bg-white/5 shrink-0">
                      {app.profiles?.avatar_url ? (
                        <img src={app.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/30 font-black text-lg">
                          {(app.profiles?.full_name ?? "?")[0]}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-black">{app.profiles?.full_name}</h3>
                      <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                        <span className="text-xs text-white/40 flex items-center gap-1">
                          <Mail className="w-3 h-3" /> {app.profiles?.email}
                        </span>
                        {app.profiles?.phone && (
                          <span className="text-xs text-white/40 flex items-center gap-1" dir="ltr">
                            <Phone className="w-3 h-3" /> {app.profiles.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Contact buttons */}
                  <div className="flex items-center gap-2 shrink-0">
                    {app.profiles?.phone && (
                      <WhatsAppButton
                        phone={app.profiles.phone}
                        message={`مرحباً ${app.profiles.full_name}، نتواصل معك بخصوص طلب انضمامك لمنصة مرتقى أكاديمي.`}
                      />
                    )}
                    {app.profiles?.phone && (
                      <a href={`tel:${app.profiles.phone}`} className="p-2 bg-white/5 text-white/40 hover:text-blue-400 rounded-xl transition-all">
                        <Phone className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Row 2: Details Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-black/30 rounded-2xl p-3.5">
                    <div className="flex items-center gap-1.5 mb-1">
                      <BookOpen className="w-3 h-3 text-blue-400" />
                      <span className="text-[10px] text-white/30 font-bold">المادة</span>
                    </div>
                    <p className="text-sm font-bold text-blue-300">{app.subject || "—"}</p>
                  </div>
                  <div className="bg-black/30 rounded-2xl p-3.5">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Award className="w-3 h-3 text-yellow-400" />
                      <span className="text-[10px] text-white/30 font-bold">الخبرة</span>
                    </div>
                    <p className="text-sm font-bold">{app.years_of_experience} سنة</p>
                  </div>
                  <div className="bg-black/30 rounded-2xl p-3.5">
                    <div className="flex items-center gap-1.5 mb-1">
                      <MapPin className="w-3 h-3 text-red-400" />
                      <span className="text-[10px] text-white/30 font-bold">المدينة</span>
                    </div>
                    <p className="text-sm font-bold">{app.profiles?.city || "—"}</p>
                  </div>
                  <div className="bg-black/30 rounded-2xl p-3.5">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Calendar className="w-3 h-3 text-green-400" />
                      <span className="text-[10px] text-white/30 font-bold">تاريخ التقديم</span>
                    </div>
                    <p className="text-sm font-bold">
                      {new Date(app.created_at).toLocaleDateString("ar-EG", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                </div>

                {/* Row 3: Districts */}
                {app.districts && app.districts.length > 0 && (
                  <div>
                    <span className="text-[10px] text-white/30 font-bold flex items-center gap-1 mb-2">
                      <MapPin className="w-3 h-3" /> أحياء التدريس
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {app.districts.map((d: string) => (
                        <span key={d} className="text-[11px] font-bold bg-white/5 text-white/50 border border-white/10 px-2.5 py-1 rounded-full">
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Row 4: Bio */}
                {app.bio && (
                  <div className="bg-black/20 border border-white/5 rounded-2xl p-4">
                    <span className="text-[10px] text-white/30 font-bold block mb-1.5">النبذة التعريفية</span>
                    <p className="text-sm text-white/60 leading-relaxed">{app.bio}</p>
                  </div>
                )}

                {/* Row 5: Actions */}
                <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-white/5">
                  {app.certificates_url && (
                    <button
                      type="button"
                      onClick={() => {
                        const url = app.certificates_url.startsWith("http")
                          ? app.certificates_url
                          : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/teacher-assets/${app.certificates_url}`;
                        setCertPreview(url);
                      }}
                      className="px-4 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 transition-all text-white/60 flex items-center gap-2 text-xs font-bold"
                    >
                      <ZoomIn className="w-4 h-4" />
                      عرض الشهادة
                    </button>
                  )}

                  <div className="flex-1" />

                  {activeTab === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAction(app.id, 'approved')}
                        disabled={processingId === app.id}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl text-sm font-bold disabled:opacity-50 flex items-center gap-2 transition-all"
                      >
                        {processingId === app.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                        اعتماد
                      </button>
                      <button
                        onClick={() => handleAction(app.id, 'rejected')}
                        disabled={processingId === app.id}
                        className="bg-white/5 hover:bg-white/10 text-white/60 px-6 py-2.5 rounded-xl text-sm font-bold border border-white/10 flex items-center gap-2 transition-all"
                      >
                        <XCircle className="w-4 h-4" />
                        رفض
                      </button>
                    </div>
                  )}

                  {activeTab === 'approved' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => togglePublish(app.user_id, app.profiles?.teacher_public_profiles?.[0]?.is_published)}
                        className={`px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${
                          app.profiles?.teacher_public_profiles?.[0]?.is_published
                            ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500/20'
                            : 'bg-green-500/10 text-green-500 border border-green-500/20 hover:bg-green-500/20'
                        }`}
                      >
                        {app.profiles?.teacher_public_profiles?.[0]?.is_published ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                        {app.profiles?.teacher_public_profiles?.[0]?.is_published ? 'تجميد' : 'تنشيط'}
                      </button>
                      <button
                        onClick={() => deleteProfile(app.user_id)}
                        className="px-5 py-2.5 rounded-xl text-sm font-bold bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 transition-all flex items-center gap-2"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        حذف
                      </button>
                    </div>
                  )}

                  {activeTab === 'rejected' && (
                    <button
                      onClick={() => handleAction(app.id, 'pending')}
                      className="text-blue-400 hover:text-blue-300 text-xs font-bold transition-all underline"
                    >
                      إعادة للمراجعة
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredApps.length === 0 && (
            <div className="text-center py-20 bg-white/5 rounded-[32px] border border-white/10 border-dashed">
              <p className="text-white/40">لا توجد طلبات في هذا القسم.</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {filteredApps.length > PAGE_SIZE && (
          <div className="mt-6 flex items-center justify-between px-2">
            <p className="text-xs text-white/30 font-bold">
              عرض {(currentPage - 1) * PAGE_SIZE + 1} - {Math.min(currentPage * PAGE_SIZE, filteredApps.length)} من {filteredApps.length} طلب
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                  if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("...");
                  acc.push(p);
                  return acc;
                }, [])
                .map((item, idx) =>
                  item === "..." ? (
                    <span key={`dots-${idx}`} className="px-2 text-white/20 text-sm">...</span>
                  ) : (
                    <button
                      key={item}
                      onClick={() => setCurrentPage(item as number)}
                      className={`min-w-[36px] h-9 rounded-xl text-sm font-bold transition-all ${
                        currentPage === item
                          ? "bg-blue-600 text-white border border-blue-500"
                          : "bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      {item}
                    </button>
                  )
                )}

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Certificate Preview Modal */}
        <AnimatePresence>
          {certPreview && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
              onClick={() => setCertPreview(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative max-w-3xl w-full max-h-[85vh] bg-[#111114] border border-white/10 rounded-[28px] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/5">
                  <h3 className="font-bold text-sm flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-400" />
                    معاينة الشهادة
                  </h3>
                  <div className="flex items-center gap-2">
                    <a
                      href={certPreview}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-400 hover:text-blue-300 font-bold px-3 py-1.5 bg-blue-500/10 rounded-lg"
                    >
                      فتح في تبويب جديد
                    </a>
                    <button
                      type="button"
                      onClick={() => setCertPreview(null)}
                      className="p-2 rounded-xl hover:bg-white/10 text-white/40 hover:text-white transition-all"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                {/* Image */}
                <div className="overflow-auto max-h-[75vh] p-4 flex items-center justify-center">
                  {certPreview.endsWith(".pdf") ? (
                    <iframe
                      src={certPreview}
                      className="w-full h-[70vh] rounded-xl"
                      title="Certificate PDF"
                    />
                  ) : (
                    <Image
                      src={certPreview}
                      alt="الشهادة"
                      width={800}
                      height={600}
                      className="max-w-full h-auto rounded-xl object-contain"
                      unoptimized
                    />
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
