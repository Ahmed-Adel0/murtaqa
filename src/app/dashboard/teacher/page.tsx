"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, 
  DollarSign, 
  BookOpen, 
  MapPin, 
  Eye, 
  EyeOff, 
  Save, 
  Loader2,
  CheckCircle2,
  Info,
  AlertCircle,
  Plus,
  X as CloseIcon,
  Camera,
  Image as ImageIcon,
  Star,
  MessageSquare,
  Send,
  UserCircle,
  Trash2,
  Bell
} from "lucide-react";
import Image from "next/image";
import { deleteOwnAccount } from "@/actions/admin";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

export default function TeacherDashboard() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const [profile, setProfile] = useState({
    full_name: "",
    username: "",
    subjects: [] as string[],
    hourly_rate: 0,
    districts: [] as string[],
    bio: "",
    is_published: false,
    avatar_url: "",
    certificates: [] as string[]
  });
  
  const [stats, setStats] = useState({ bookings: 0, reviews: 0 });
  const [reviews, setReviews] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<'profile' | 'reviews' | 'notifications'>('profile');

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCert, setUploadingCert] = useState(false);

  const availableDistricts = ["المروج", "العليا", "القادسية", "المصيف", "الروضة", "التعاون", "النهضة", "الياسمين"];

  // Calculate completeness
  const completionStats = {
    name: !!profile.full_name,
    bio: !!profile.bio && profile.bio.length > 20,
    price: !!profile.hourly_rate && profile.hourly_rate > 0,
    subjects: profile.subjects.length > 0,
    districts: profile.districts.length > 0
  };
  
  const completedSteps = Object.values(completionStats).filter(Boolean).length;
  const progressPercent = (completedSteps / 5) * 100;
  const isProfileComplete = completedSteps === 5;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Fetch Profile
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      
      // 2. Fetch Public Profile
      const { data: pubProf } = await supabase.from('teacher_public_profiles').select('*').eq('teacher_id', user.id).single();
      
      if (prof && pubProf) {
        setProfile({
          full_name: prof.full_name || "",
          username: prof.username || prof.email?.split('@')[0] || "",
          avatar_url: prof.avatar_url || "",
          subjects: pubProf.subjects || [],
          hourly_rate: pubProf.hourly_rate || 0,
          districts: pubProf.districts || [],
          bio: pubProf.bio || "",
          is_published: pubProf.is_published || false,
          certificates: pubProf.certificates || []
        });
      }

      // 3. Fetch Stats
      const { count: bCount } = await supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('teacher_id', user.id);
      const { count: rCount, data: revs } = await supabase.from('reviews').select('*', { count: 'exact' }).eq('teacher_id', user.id);
      
      setStats({ bookings: bCount || 0, reviews: rCount || 0 });
      setReviews(revs || []);

      // 5. Fetch Notifications
      const { data: notifs } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (notifs) setNotifications(notifs);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    if (!error) {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // Update basic profile
      const { error: pErr } = await supabase.from('profiles').update({ full_name: profile.full_name }).eq('id', user.id);
      if (pErr) throw pErr;

      // Update public profile
      const { error: ppErr } = await supabase.from('teacher_public_profiles').update({
        bio: profile.bio,
        hourly_rate: profile.hourly_rate,
        subjects: profile.subjects,
        districts: profile.districts
      }).eq('teacher_id', user.id);
      if (ppErr) throw ppErr;

      setMessage({ type: 'success', text: "تم حفظ التغييرات بنجاح!" });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleReplyReview = async (reviewId: string) => {
    const reply = replyTexts[reviewId];
    if (!reply) return;

    try {
      const { error } = await supabase.from('reviews').update({
        teacher_reply: reply,
        reply_date: new Date()
      }).eq('id', reviewId);

      if (error) throw error;
      setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, teacher_reply: reply } : r));
      setMessage({ type: 'success', text: "تم إرسال ردك بنجاح!" });
    } catch (err: any) {
      alert(err.message);
    }
  };

  const uploadAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploadingAvatar(true);
    try {
      const file = e.target.files[0];
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const fileName = `${user.id}/${Date.now()}`;
      const { error: uploadError } = await supabase.storage.from('teacher-assets').upload(`avatars/${fileName}`, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('teacher-assets').getPublicUrl(`avatars/${fileName}`);
      
      await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id);
      await supabase.from('teacher_public_profiles').update({ avatar_url: publicUrl }).eq('teacher_id', user.id);
      
      setProfile(p => ({ ...p, avatar_url: publicUrl }));
      setMessage({ type: 'success', text: "تم تحديث الصورة الشخصية!" });
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const uploadCertificate = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploadingCert(true);
    try {
      const file = e.target.files[0];
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const fileName = `${user.id}/cert-${Date.now()}`;
      const { error } = await supabase.storage.from('teacher-assets').upload(`certificates/${fileName}`, file);
      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage.from('teacher-assets').getPublicUrl(`certificates/${fileName}`);
      const newCerts = [...profile.certificates, publicUrl];
      
      await supabase.from('teacher_public_profiles').update({ certificates: newCerts }).eq('teacher_id', user.id);
      setProfile(p => ({ ...p, certificates: newCerts }));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUploadingCert(false);
    }
  };

  const togglePublish = async () => {
    if (!isProfileComplete && !profile.is_published) {
      alert("يرجى إكمال جميع بيانات البروفايل أولاً");
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    const newStatus = !profile.is_published;
    await supabase.from('teacher_public_profiles').update({ is_published: newStatus }).eq('teacher_id', user?.id);
    setProfile(p => ({ ...p, is_published: newStatus }));
  };

  const handleDeleteOwnAccount = async () => {
    if (!window.confirm("هل أنت متأكد من حذف حسابك نهائياً؟ سيتم مسح كافة بياناتك وتقييماتك ولا يمكن التراجع عن هذا الإجراء.")) return;
    if (!window.confirm("تأكيد أخير: سيتم حذف الحساب الآن.")) return;

    setSaving(true);
    const res = await deleteOwnAccount();
    if (res.success) {
      await supabase.auth.signOut();
      window.location.href = "/";
    } else {
      alert(res.error);
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#060607] flex items-center justify-center"><Loader2 className="w-10 h-10 text-blue-500 animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-[#060607] text-white font-tajawal p-6 md:p-12 mb-20" dir="rtl">
      <div className="max-w-5xl mx-auto space-y-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-white/5 border border-white/10 p-10 rounded-[40px] relative overflow-hidden backdrop-blur-3xl shadow-2xl">
          <div className="flex items-center gap-8 relative z-10">
            <div className="relative group/avatar">
              <div className="w-24 h-24 bg-blue-500/10 rounded-3xl flex items-center justify-center overflow-hidden border-2 border-white/10 relative shadow-2xl">
                {profile.avatar_url ? (
                  <Image src={profile.avatar_url} alt="Profile" fill className="object-cover" />
                ) : (
                  <UserCircle className="w-12 h-12 text-blue-500" />
                )}
                {uploadingAvatar && <div className="absolute inset-0 bg-black/60 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-white" /></div>}
              </div>
              <label className="absolute -bottom-2 -right-2 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 active:scale-90 transition-all border-4 border-[#060607]">
                <Camera className="w-5 h-5 text-white" />
                <input type="file" accept="image/*" onChange={uploadAvatar} className="hidden" />
              </label>
            </div>
            <div>
              <h1 className="text-3xl font-black mb-1">{profile.full_name || "معلم جديد"}</h1>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-lg border border-blue-500/20 font-mono">@{profile.username}</span>
              </div>
              <div className="flex items-center gap-4 text-white/40 text-sm font-bold">
                 <span className="flex items-center gap-1.5"><Star className="w-4 h-4 text-yellow-500 fill-yellow-500" /> 5.0</span>
                 <span className="w-1 h-1 bg-white/20 rounded-full" />
                 <span>{stats.bookings} حجز</span>
                 <span className="w-1 h-1 bg-white/20 rounded-full" />
                 <span>{stats.reviews} تقييم</span>
              </div>
            </div>
          </div>

          <button 
            onClick={togglePublish}
            disabled={!isProfileComplete && !profile.is_published}
            className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black transition-all border-2 ${
              profile.is_published 
              ? 'bg-green-500/10 border-green-500/20 text-green-500 shadow-xl shadow-green-500/10' 
              : isProfileComplete 
                ? 'bg-blue-600 border-blue-500 text-white shadow-xl shadow-blue-500/20'
                : 'bg-white/5 border-white/5 text-white/20 cursor-not-allowed'
            }`}
          >
            {profile.is_published ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
            {profile.is_published ? "ظاهر للطلاب" : "نشر الملف الشخصي"}
          </button>
          
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 blur-[100px] -z-0" />
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-4 p-2 bg-white/5 border border-white/10 rounded-2xl w-fit">
           <button onClick={() => setActiveTab('profile')} className={`px-8 py-2.5 rounded-xl font-bold transition-all ${activeTab === 'profile' ? 'bg-white text-black shadow-lg' : 'hover:bg-white/5 opacity-60'}`}>الملف الشخصي</button>
           <button onClick={() => setActiveTab('reviews')} className={`px-8 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 ${activeTab === 'reviews' ? 'bg-white text-black shadow-lg' : 'hover:bg-white/5 opacity-60'}`}>
             إدارة التقييمات
             {stats.reviews > 0 && <span className="w-5 h-5 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">{stats.reviews}</span>}
           </button>
           <button onClick={() => setActiveTab('notifications')} className={`px-8 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 relative ${activeTab === 'notifications' ? 'bg-white text-black shadow-lg' : 'hover:bg-white/5 opacity-60'}`}>
             الإشعارات
             {unreadCount > 0 && (
               <span className="w-5 h-5 bg-blue-600 text-white text-[10px] rounded-full flex items-center justify-center animate-pulse">
                 {unreadCount}
               </span>
             )}
           </button>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'profile' && (
            <form onSubmit={handleUpdate} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-white/5 border border-white/10 p-10 rounded-[40px] space-y-8">
                  <div className="space-y-3">
                    <label className="text-xs font-black text-white/40 uppercase px-1">الاسم الكامل الظاهر للطلاب</label>
                    <div className="relative">
                      <User className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                      <input 
                        type="text"
                        value={profile.full_name}
                        onChange={e => setProfile(p => ({ ...p, full_name: e.target.value }))}
                        className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pr-14 pl-6 focus:border-blue-500 outline-none transition-all font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-xs font-black text-white/40 uppercase px-1">سعر الساعة التدريسية (ريال)</label>
                      <div className="relative">
                        <DollarSign className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                        <input 
                          type="number"
                          value={profile.hourly_rate}
                          onChange={e => setProfile(p => ({ ...p, hourly_rate: parseInt(e.target.value) }))}
                          className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pr-14 pl-6 focus:border-blue-500 outline-none transition-all font-bold"
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                       <label className="text-xs font-black text-white/40 uppercase px-1">التخصص أو المادة الرئيسية</label>
                       <div className="relative">
                        <BookOpen className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                        <input 
                          type="text"
                          value={profile.subjects[0] || ""}
                          onChange={e => setProfile(p => ({ ...p, subjects: [e.target.value] }))}
                          className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pr-14 pl-6 focus:border-blue-500 outline-none transition-all font-bold"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-black text-white/40 uppercase px-1">النبذة التعريفية (أكثر من 50 حرفاً)</label>
                    <textarea 
                      rows={5}
                      value={profile.bio}
                      onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl p-6 focus:border-blue-500 outline-none transition-all resize-none text-white/60 leading-relaxed"
                    />
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 p-10 rounded-[40px] space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold flex items-center gap-3"><ImageIcon className="w-5 h-5 text-blue-500" /> معرض الشهادات والخبرات</h3>
                    <label className="cursor-pointer bg-white text-black px-5 py-2 rounded-xl text-xs font-black hover:bg-blue-500 hover:text-white transition-all">
                      {uploadingCert ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>رفع شهادة +</span>}
                      <input type="file" className="hidden" onChange={uploadCertificate} disabled={uploadingCert} />
                    </label>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                     {profile.certificates.map((url, i) => (
                       <div key={i} className="relative aspect-video rounded-2xl overflow-hidden border border-white/5 bg-black">
                         <Image src={url} alt="" fill className="object-cover" />
                       </div>
                     ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-[#0f0f11] border border-white/10 p-8 rounded-[40px] shadow-xl">
                  <h3 className="font-bold mb-6 flex items-center gap-3"><MapPin className="w-5 h-5 text-red-500" /> أحياء التغطية في تبوك</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {availableDistricts.map(d => (
                      <button 
                        key={d}
                        type="button"
                        onClick={() => setProfile(prev => ({ ...prev, districts: prev.districts.includes(d) ? prev.districts.filter(x => x !== d) : [...prev.districts, d] }))}
                        className={`py-3.5 rounded-2xl text-[11px] font-bold border transition-all ${profile.districts.includes(d) ? 'bg-blue-600 border-blue-500 shadow-lg shadow-blue-500/20' : 'bg-white/5 border-white/5 text-white/40'}`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={saving}
                  className="w-full bg-white text-black py-5 rounded-[28px] font-black flex items-center justify-center gap-4 hover:bg-blue-600 hover:text-white transition-all shadow-2xl disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                  حفظ كافة التعديلات
                </button>
              </div>

              <div className="md:col-span-3 mt-12 pt-12 border-t border-white/5">
                <div className="bg-red-500/5 border border-red-500/10 p-8 rounded-[40px] flex flex-col md:flex-row items-center justify-between gap-6">
                  <div>
                    <h3 className="text-red-500 font-bold mb-1">منطقة الخطر</h3>
                    <p className="text-white/40 text-xs">حذف الحساب سيقوم بمسح كافة بياناتك من المنصة نهائياً ولن تستطيع استرجاعها.</p>
                  </div>
                  <button 
                    type="button"
                    onClick={handleDeleteOwnAccount}
                    className="flex items-center gap-2 px-6 py-3 bg-red-600/10 text-red-600 hover:bg-red-600 hover:text-white rounded-2xl text-sm font-bold transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                    حذف الحساب نهائياً
                  </button>
                </div>
              </div>
            </form>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-6 max-w-4xl">
              <div className="bg-amber-500/10 border border-amber-500/20 p-6 rounded-3xl flex items-center gap-4">
                <Info className="w-6 h-6 text-amber-500" />
                <p className="text-sm font-medium text-amber-500/80">الرد على التقييمات يعزز ثقة أولياء الأمور ويزيد من فرص حجز الطلبة لك.</p>
              </div>
              
              <div className="space-y-4">
                {reviews.map(rev => (
                  <div key={rev.id} className="bg-white/5 border border-white/10 p-8 rounded-[32px] space-y-6">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center font-black text-white/40">{rev.student_name[0]}</div>
                        <div>
                          <h4 className="font-bold">{rev.student_name}</h4>
                          <div className="flex gap-1 mt-1">
                            {[...Array(5)].map((_, i) => <Star key={i} className={`w-3 h-3 ${i < rev.rating ? 'text-yellow-500 fill-yellow-500' : 'text-white/10'}`} />)}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] text-white/20 font-bold">{new Date(rev.created_at).toLocaleDateString('ar-EG')}</span>
                    </div>
                    <p className="text-white/60 font-medium leading-relaxed">{rev.comment}</p>
                    {rev.teacher_reply ? (
                      <div className="bg-blue-600/5 border-r-4 border-blue-500 p-6 rounded-2xl space-y-2">
                        <div className="flex items-center gap-2 text-[10px] font-black text-blue-500 uppercase">ردك على التقييم</div>
                        <p className="text-sm text-white/80 leading-relaxed">{rev.teacher_reply}</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <textarea 
                          placeholder="اكتب ردك هنا..."
                          value={replyTexts[rev.id] || ""}
                          onChange={e => setReplyTexts(p => ({ ...p, [rev.id]: e.target.value }))}
                          className="w-full bg-black/40 border border-white/10 rounded-2xl p-5 focus:border-blue-500 outline-none transition-all text-sm resize-none"
                          rows={2}
                        />
                        <button 
                          onClick={() => handleReplyReview(rev.id)}
                          className="bg-white text-black px-6 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 hover:bg-blue-500 hover:text-white transition-all shadow-lg"
                        >
                          <Send className="w-3.5 h-3.5" /> إرسال الرد
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                
                {reviews.length === 0 && (
                  <div className="text-center py-24 bg-white/5 border-2 border-dashed border-white/10 rounded-[40px]">
                    <MessageSquare className="w-12 h-12 text-white/10 mx-auto mb-4" />
                    <p className="text-white/20 font-black">لا توجد تقييمات للرد عليها بعد</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6 max-w-4xl">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black">سجل الإشعارات</h2>
                {unreadCount > 0 && (
                  <button 
                    onClick={async () => {
                      const { data: { user } } = await supabase.auth.getUser();
                      await supabase.from('notifications').update({ is_read: true }).eq('user_id', user?.id);
                      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
                    }}
                    className="text-xs text-blue-500 hover:underline"
                  >
                    تحديد الكل كمقروء
                  </button>
                )}
              </div>

              {notifications.length === 0 ? (
                <div className="bg-white/5 border border-white/5 rounded-[40px] py-20 text-center">
                  <Bell className="w-12 h-12 text-white/5 mx-auto mb-4" />
                  <p className="text-white/40 font-bold">لا توجد إشعارات حالياً</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {notifications.map((n) => (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={n.id} 
                      className={`p-6 rounded-[32px] border transition-all ${n.is_read ? 'bg-white/[0.02] border-white/5 text-white/40' : 'bg-blue-500/5 border-blue-500/20 text-white shadow-xl shadow-blue-500/5'}`}
                    >
                      <div className="flex items-start justify-between gap-4 text-right">
                        <div className="flex gap-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${n.is_read ? 'bg-white/5' : 'bg-blue-600/20 text-blue-500'}`}>
                            <Bell className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className="font-bold mb-1">{n.title}</h4>
                            <p className="text-sm leading-relaxed">{n.message}</p>
                            <p className="text-[10px] mt-4 opacity-40">
                              {format(new Date(n.created_at), 'eeee, d MMMM yyyy - HH:mm', { locale: ar })}
                            </p>
                          </div>
                        </div>
                        {!n.is_read && (
                          <button 
                            onClick={() => markAsRead(n.id)}
                            className="px-3 py-1 bg-blue-600 text-white text-[10px] font-bold rounded-lg shrink-0"
                          >
                            تحديد كمقروء
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

