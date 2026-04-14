"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { 
  BookOpen, 
  Award, 
  FileText, 
  Upload, 
  CheckCircle2, 
  Loader2, 
  Camera,
  ChevronLeft,
  MapPin
} from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    subject: "",
    experience: "",
    bio: "",
    certificates_url: "",
    avatar_url: "",
    hourly_rate: "",
    teaching_type: "online",
    districts: [] as string[],
  });

  const availableDistricts = ["المروج", "العليا", "القادسية", "المصيف", "الروضة", "التعاون", "النهضة", "الياسمين"];

  const [files, setFiles] = useState<{
    certificate: File | null;
    avatar: File | null;
  }>({
    certificate: null,
    avatar: null,
  });

  useEffect(() => {
    const checkUserAndApp = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/register");
        return;
      }
      setUser(user);

      // Check for existing application
      const { data: app } = await supabase
        .from('teacher_applications')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      // If an application already exists, the /dashboard page owns its
      // status display (pending/rejected/approved). Send the user there.
      if (app) {
        router.replace("/dashboard");
        return;
      }

      setLoading(false);
      
      if (user.user_metadata?.avatar_url) {
        setFormData(prev => ({ ...prev, avatar_url: user.user_metadata.avatar_url }));
      }
    };
    checkUserAndApp();
  }, [router]);

  const compressImage = (file: File): Promise<Blob | File> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else resolve(file);
          }, 'image/jpeg', 0.8);
        };
      };
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'certificate' | 'avatar') => {
    if (e.target.files && e.target.files[0]) {
      setFiles(prev => ({ ...prev, [type]: e.target.files![0] }));
    }
  };

  const uploadFile = async (file: File | Blob, bucket: string, originalName?: string) => {
    const fileExt = originalName ? originalName.split('.').pop() : 'jpg';
    const fileName = `${user.id}/${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (uploadError) throw uploadError;
    
    if (bucket === 'teacher-images') {
      const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(filePath);
      return publicUrl;
    }
    return filePath;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);

    try {
      let certUrl = "";
      let avUrl = formData.avatar_url;

      if (files.certificate) {
        certUrl = await uploadFile(files.certificate, 'certificates', files.certificate.name);
      }

      if (files.avatar) {
        const compressed = await compressImage(files.avatar);
        avUrl = await uploadFile(compressed, 'teacher-images', 'avatar.jpg');
      }

      const { error: appError } = await supabase
        .from('teacher_applications')
        .insert({
          user_id: user.id,
          subject: formData.subject,
          years_of_experience: parseInt(formData.experience),
          bio: formData.bio,
          certificates_url: certUrl,
          districts: formData.districts,
          status: 'pending'
        });

      if (appError) throw appError;

      await supabase.from('profiles').update({
        avatar_url: avUrl,
      }).eq('id', user.id);

      router.replace("/dashboard");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "حدث خطأ أثناء حفظ البيانات";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleDistrict = (district: string) => {
    setFormData(prev => ({
      ...prev,
      districts: prev.districts.includes(district)
        ? prev.districts.filter(d => d !== district)
        : [...prev.districts, district]
    }));
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white font-tajawal antialiased p-6 flex items-center justify-center">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[20%] left-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        layout
        className="w-full max-w-2xl bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[32px] p-8 md:p-12 shadow-2xl relative z-10"
      >
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
              dir="rtl"
            >
              <div className="text-right">
                <h1 className="text-3xl font-black mb-2">أهلاً بك يا {user.user_metadata?.full_name?.split(' ')[0] || 'أستاذنا'}!</h1>
                <p className="text-white/40">لنستكمل معاً بياناتك المهنية لتبدأ مسيرتك التعليمية.</p>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-white/60 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-blue-400" />
                      المادة العلمية
                    </label>
                    <input 
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                      placeholder="لغة عربية، رياضيات..."
                      className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-3.5 px-6 outline-none focus:border-blue-500/50 transition-all text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-white/60 flex items-center gap-2">
                      <Award className="w-4 h-4 text-blue-400" />
                      سنوات الخبرة
                    </label>
                    <input 
                      type="number"
                      value={formData.experience}
                      onChange={(e) => setFormData({...formData, experience: e.target.value})}
                      placeholder="عدد السنوات"
                      className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-3.5 px-6 outline-none focus:border-blue-500/50 transition-all text-sm"
                    />
                  </div>
                </div>

                {/* Districts Selection */}
                <div className="space-y-3">
                  <label className="text-sm font-bold text-white/60 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-red-400" />
                    أحياء التدريس في تبوك
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {availableDistricts.map(d => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => toggleDistrict(d)}
                        className={`px-3 py-2 rounded-xl text-[10px] font-bold border transition-all ${
                          formData.districts.includes(d) 
                          ? 'bg-blue-600 border-blue-500 text-white' 
                          : 'bg-white/5 border-white/10 text-white/40'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-white/60 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-400" />
                    نبذة عنك (Bio)
                  </label>
                  <textarea 
                    rows={3}
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    placeholder="تحدث قليلاً عن أسلوبك في التدريس وإنجازاتك..."
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 px-6 outline-none focus:border-blue-500/50 transition-all text-sm resize-none"
                  />
                </div>
              </div>

              <button 
                onClick={() => setStep(2)}
                disabled={!formData.subject || !formData.experience || formData.districts.length === 0}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:hover:bg-blue-600 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 group"
              >
                التالي
                <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
              dir="rtl"
            >
              <div className="text-right">
                <h1 className="text-3xl font-black mb-2">الشهادات والصورة</h1>
                <p className="text-white/40">هذه الخطوة ضرورية لتوثيق الحساب وبناء الثقة.</p>
              </div>

              <div className="space-y-8">
                <div className="flex flex-col items-center gap-4">
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-dashed border-white/20 group-hover:border-blue-500/50 transition-colors">
                      {files.avatar ? (
                        <img src={URL.createObjectURL(files.avatar)} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-white/5">
                          <Camera className="w-8 h-8 text-white/20" />
                        </div>
                      )}
                    </div>
                    <label className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full cursor-pointer hover:bg-blue-500 transition-colors shadow-lg">
                      <Upload className="w-4 h-4 text-white" />
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'avatar')} />
                    </label>
                  </div>
                  <p className="text-xs text-white/40">صورة البروفايل الشخصية (سيتم ضغطها تلقائياً)</p>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-bold text-white/60">رفع الشهادة العلمية (PDF أو صورة)</label>
                  <label className={`
                    w-full border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all
                    ${files.certificate ? 'border-green-500/50 bg-green-500/5' : 'border-white/10 hover:border-blue-500/30 hover:bg-white/[0.02]'}
                  `}>
                    <div className={`p-4 rounded-2xl ${files.certificate ? 'bg-green-500/20' : 'bg-white/5'}`}>
                      {files.certificate ? <CheckCircle2 className="text-green-400" /> : <Upload className="text-white/20" />}
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium">{files.certificate ? files.certificate.name : 'اسحب الملف هنا أو انقر للإختيار'}</p>
                    </div>
                    <input type="file" className="hidden" accept=".pdf,image/*" onChange={(e) => handleFileChange(e, 'certificate')} />
                  </label>
                </div>
              </div>

              {error && <p className="text-red-400 text-sm text-center">{error}</p>}

              <div className="flex gap-4">
                <button 
                  onClick={() => setStep(1)}
                  className="w-1/3 border border-white/10 hover:bg-white/5 text-white font-bold py-4 rounded-2xl transition-all"
                >
                  السابق
                </button>
                <button 
                  onClick={handleSubmit}
                  disabled={submitting || !files.certificate}
                  className="w-2/3 bg-white text-black font-bold py-4 rounded-2xl hover:bg-white/90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "إرسال الطلب"}
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </motion.div>
    </div>
  );
}
