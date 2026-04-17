import { wrapInLayout, actionButton } from "./base-layout";

export function bookingRequestTemplate(data: { teacherName: string; studentName: string }) {
  return {
    subject: `طلب حجز جديد من ${data.studentName}`,
    title: "طلب حجز جديد",
    plainText: `قام الطالب ${data.studentName} بإرسال طلب تواصل معك.`,
    link: "/dashboard",
    html: wrapInLayout(`
      <h2 style="margin:0 0 16px;font-size:20px;font-weight:800;color:#fff;">طلب حجز جديد</h2>
      <p style="margin:0 0 8px;font-size:15px;color:rgba(255,255,255,0.7);line-height:1.7;">
        مرحباً ${data.teacherName}،
      </p>
      <p style="margin:0 0 16px;font-size:15px;color:rgba(255,255,255,0.7);line-height:1.7;">
        قام الطا��ب <strong style="color:#fff;">${data.studentName}</strong> بإرسال طلب تواصل معك على من��ة مرتقى.
      </p>
      <p style="margin:0 0 24px;font-size:14px;color:rgba(255,255,255,0.5);">
        يرجى الدخول إلى لوحة التحكم لمراجعة الطلب والرد عليه.
      </p>
      <div style="text-align:center;">
        ${actionButton("/dashboard", "عرض التفاصيل")}
      </div>
    `),
  };
}
