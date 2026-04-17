"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Search,
  MapPin,
  Eye,
  EyeOff,
  ShieldAlert,
  ShieldCheck,
  MoreVertical,
  ArrowRight,
  Loader2,
  Mail,
  Filter,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { deleteTeacherAccount } from "@/actions/admin";
import { Trash2 } from "lucide-react";

const PAGE_SIZE = 10;

export default function AdminTeachersPage() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all"); // all, active, suspended, hidden
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('teacher_public_profiles')
        .select(`
          *,
          profiles:teacher_id (
            full_name,
            email,
            username,
            avatar_url,
            is_suspended
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTeachers(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleVisibility = async (id: string, currentHidden: boolean) => {
    try {
      const { error } = await supabase
        .from('teacher_public_profiles')
        .update({ is_hidden: !currentHidden })
        .eq('id', id);
      
      if (error) throw error;
      setTeachers(prev => prev.map(t => t.id === id ? { ...t, is_hidden: !currentHidden } : t));
    } catch (err) {
      alert("خطأ في تحديث الظهور");
    }
  };

  const toggleSuspension = async (userId: string, currentSuspended: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_suspended: !currentSuspended })
        .eq('id', userId);
      
      if (error) throw error;
      setTeachers(prev => prev.map(t => 
        t.teacher_id === userId ? { ...t, profiles: { ...t.profiles, is_suspended: !currentSuspended } } : t
      ));
    } catch (err) {
      alert("خطأ في تحديث حالة الحساب");
    }
  };

  const handleDelete = async (userId: string, name: string) => {
    if (!window.confirm(`هل أنت متأكد من حذف حساب المعلم "${name}" نهائياً؟ لا يمكن التراجع عن هذه العملية.`)) return;
    
    setLoading(true);
    const res = await deleteTeacherAccount(userId);
    if (res.success) {
      setTeachers(prev => prev.filter(t => t.teacher_id !== userId));
    } else {
      alert(res.error);
    }
    setLoading(false);
  };

  const filteredTeachers = useMemo(() => {
    return teachers.filter(t => {
      const matchesSearch = t.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            t.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase());

      if (filter === "suspended") return matchesSearch && t.profiles?.is_suspended;
      if (filter === "hidden") return matchesSearch && t.is_hidden;
      if (filter === "active") return matchesSearch && !t.profiles?.is_suspended && !t.is_hidden;

      return matchesSearch;
    });
  }, [teachers, searchTerm, filter]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filter]);

  const totalPages = Math.max(1, Math.ceil(filteredTeachers.length / PAGE_SIZE));
  const paginatedTeachers = filteredTeachers.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  return (
    <div className="min-h-screen bg-[#060607] text-white font-tajawal antialiased pt-20 p-8" dir="rtl">
      <div className="max-w-7xl mx-auto">
        
        {/* Breadcrumbs & Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <Link href="/admin" className="text-white/40 hover:text-blue-500 transition-colors flex items-center gap-2 text-sm mb-4">
              <ArrowRight className="w-4 h-4" />
              العودة للوحة التحكم
            </Link>
            <h1 className="text-4xl font-black flex items-center gap-4">
              <Users className="text-purple-500 w-10 h-10" />
              إدارة المعلمين
            </h1>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
             <div className="relative">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 w-4 h-4" />
                <input 
                  type="text"
                  placeholder="بحث بالاسم أو اسم المستخدم..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-2xl py-3 pr-12 pl-6 outline-none focus:border-purple-500/50 w-full md:w-80"
                />
             </div>
             <div className="relative">
                <Filter className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 w-4 h-4" />
                <select 
                  value={filter}
                  onChange={e => setFilter(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-2xl py-3 pr-12 pl-6 outline-none appearance-none focus:border-purple-500/50 font-bold text-sm"
                >
                  <option value="all">الكل</option>
                  <option value="active">نشطين</option>
                  <option value="suspended">موقوفين</option>
                  <option value="hidden">مخفيين</option>
                </select>
             </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="bg-white/5 border border-white/10 rounded-[32px] overflow-hidden shadow-2xl">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
              <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
              <p className="text-white/40">جاري تحميل البيانات...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.02]">
                    <th className="p-6 text-sm font-black text-white/40 uppercase">المعلم</th>
                    <th className="p-6 text-sm font-black text-white/40 uppercase">المواد</th>
                    <th className="p-6 text-sm font-black text-white/40 uppercase">التقييم</th>
                    <th className="p-6 text-sm font-black text-white/40 uppercase">الحالة</th>
                    <th className="p-6 text-sm font-black text-white/40 uppercase text-left">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <AnimatePresence mode="popLayout">
                    {paginatedTeachers.map((teacher) => (
                      <motion.tr 
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        key={teacher.id} 
                        className="hover:bg-white/[0.02] transition-colors group"
                      >
                        <td className="p-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/10 relative">
                              <Image 
                                src={teacher.profiles?.avatar_url || `https://ui-avatars.com/api/?name=${teacher.profiles?.full_name}&background=random&color=fff`} 
                                alt="" 
                                fill 
                                sizes="48px"
                                className="object-cover" 
                              />
                            </div>
                            <div>
                              <p className="font-bold">{teacher.profiles?.full_name}</p>
                              <p className="text-xs text-white/30 flex items-center gap-1">
                                <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded-lg border border-white/10">{teacher.profiles?.username || teacher.profiles?.email}</span>
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-6">
                           <div className="flex flex-wrap gap-1 max-w-[200px]">
                              {teacher.subjects?.slice(0, 2).map((s: string) => (
                                <span key={s} className="px-2 py-0.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-md text-[10px] font-bold">{s}</span>
                              ))}
                              {teacher.subjects?.length > 2 && <span className="text-[10px] text-white/20">+{teacher.subjects.length - 2}</span>}
                           </div>
                        </td>
                        <td className="p-6">
                           <p className="font-black text-sm text-yellow-500">{teacher.rating?.toFixed(1) || "5.0"}</p>
                           <p className="text-[10px] text-white/20 tracking-wider">({teacher.review_count || 0} تقييم)</p>
                        </td>
                        <td className="p-6">
                          <div className="flex flex-col gap-1">
                            {teacher.profiles?.is_suspended ? (
                              <span className="flex items-center gap-1.5 text-red-500 text-xs font-bold">
                                <ShieldAlert className="w-3 h-3" />
                                موقوف نهائياً
                              </span>
                            ) : teacher.is_hidden ? (
                              <span className="flex items-center gap-1.5 text-orange-500 text-xs font-bold">
                                <EyeOff className="w-3 h-3" />
                                مخفي من الدليل
                              </span>
                            ) : (
                              <span className="flex items-center gap-1.5 text-green-500 text-xs font-bold">
                                <ShieldCheck className="w-3 h-3" />
                                نشط ومرئي
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-6 text-left">
                          <div className="flex items-center justify-end gap-2 outline-none">
                            <button 
                              onClick={() => toggleVisibility(teacher.id, teacher.is_hidden)}
                              title={teacher.is_hidden ? "إظهار المعلم" : "إخفاء المعلم"}
                              className={`p-2 rounded-xl transition-all ${teacher.is_hidden ? "bg-green-500/10 text-green-500 hover:bg-green-500/20" : "bg-white/5 text-white/40 hover:text-white"}`}
                            >
                              {teacher.is_hidden ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                            </button>
                            
                            <button 
                              onClick={() => toggleSuspension(teacher.teacher_id, teacher.profiles?.is_suspended)}
                              title={teacher.profiles?.is_suspended ? "إلغاء التجميد" : "تجميد الحساب"}
                              className={`p-2 rounded-xl transition-all ${teacher.profiles?.is_suspended ? "bg-green-500/10 text-green-500 hover:bg-green-500/20" : "bg-red-500/10 text-red-500 hover:bg-red-500/20"}`}
                            >
                              <ShieldAlert className="w-5 h-5" />
                            </button>

                            <button 
                              onClick={() => handleDelete(teacher.teacher_id, teacher.profiles?.full_name)}
                              title="حذف الحساب نهائياً"
                              className="p-2 bg-red-600/10 text-red-600 hover:bg-red-600 hover:text-white rounded-xl transition-all"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>

                            <Link href={`/teachers/${teacher.teacher_id}`} target="_blank">
                              <button className="p-2 bg-white/5 text-white/40 hover:text-blue-500 rounded-xl transition-all">
                                <MoreVertical className="w-5 h-5" />
                              </button>
                            </Link>
                          </div>
                   </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
              
              {paginatedTeachers.length === 0 && (
                <div className="text-center py-32 space-y-4">
                   <Users className="w-12 h-12 text-white/10 mx-auto" />
                   <p className="text-white/40 font-bold">لم يتم العثور على معلمين يطابقون بحثك</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Pagination */}
        {filteredTeachers.length > PAGE_SIZE && (
          <div className="mt-6 flex items-center justify-between px-2">
            <p className="text-xs text-white/30 font-bold">
              عرض {(currentPage - 1) * PAGE_SIZE + 1} - {Math.min(currentPage * PAGE_SIZE, filteredTeachers.length)} من {filteredTeachers.length} معلم
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                title="الصفحة الأولى"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                title="الصفحة السابقة"
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
                title="الصفحة التالية"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                title="الصفحة الأخيرة"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Info Footer */}
        <div className="mt-8 flex items-center gap-3 text-white/20 text-xs px-4">
           <ShieldCheck className="w-4 h-4" />
           <p>سياسة التجميد تمنع المعلم من تسجيل الدخول فوراً. سياسة الإخفاء تمنع ظهور المعلم للطلاب فقط.</p>
        </div>

      </div>
    </div>
  );
}
