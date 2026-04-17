import { wrapInLayout, actionButton } from "./base-layout";

export function meetingScheduledTemplate(data: {
  userName: string;
  otherName: string;
  scheduledAt: string;
  duration: number;
  role: "teacher" | "student";
}) {
  const roleText = data.role === "teacher" ? "الطالب" : "المعلم";
  return {
    subject: `تم جدولة حصة دراسية جديدة`,
    title: "حصة دراسية جديدة",
    plainText: `مرحباً ${data.userName}، تم جدولة حصة دراسية مع ${roleText} ${data.otherName} في ${data.scheduledAt}.`,
    link: "/dashboard",
    html: wrapInLayout(`
      <h2 style="margin:0 0 16px;font-size:20px;font-weight:800;color:#3b82f6;">حصة دراسية جديدة</h2>
      <p style="margin:0 0 8px;font-size:15px;color:rgba(255,255,255,0.7);line-height:1.7;">
        مرحباً ${data.userName}،
      </p>
      <p style="margin:0 0 16px;font-size:15px;color:rgba(255,255,255,0.7);line-height:1.7;">
        تم جدولة حصة دراسية جديدة مع ${roleText} <strong style="color:#fff;">${data.otherName}</strong>.
      </p>
      <div style="background:rgba(255,255,255,0.05);border-radius:16px;padding:20px;margin:16px 0;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:8px 0;color:rgba(255,255,255,0.5);font-size:13px;">الموعد</td>
            <td style="padding:8px 0;color:#fff;font-weight:700;font-size:14px;text-align:left;">${data.scheduledAt}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:rgba(255,255,255,0.5);font-size:13px;">المدة</td>
            <td style="padding:8px 0;color:#fff;font-weight:700;font-size:14px;text-align:left;">${data.duration} دقيقة</td>
          </tr>
        </table>
      </div>
      <div style="text-align:center;">
        ${actionButton("/dashboard", "عرض التفاصيل")}
      </div>
    `),
  };
}
