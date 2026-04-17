import { wrapInLayout, actionButton } from "./base-layout";

export function matchSuggestionTemplate(data: { studentName: string; teacherName: string }) {
  return {
    subject: "تم ترشيح معلم جديد لك!",
    title: "ترشيح معلم جديد",
    plainText: `مرحباً ${data.studentName}، تم ترشيح المعلم ${data.teacherName} لك على منصة مرتقى.`,
    link: "/dashboard",
    html: wrapInLayout(`
      <h2 style="margin:0 0 16px;font-size:20px;font-weight:800;color:#3b82f6;">ترشيح معلم جديد لك</h2>
      <p style="margin:0 0 8px;font-size:15px;color:rgba(255,255,255,0.7);line-height:1.7;">
        مرحباً ${data.studentName}،
      </p>
      <p style="margin:0 0 16px;font-size:15px;color:rgba(255,255,255,0.7);line-height:1.7;">
        تم ترشيح المعلم <strong style="color:#fff;">${data.teacherName}</strong> لك بناءً على معاييرك. يمكنك الاطلاع على ملفه الشخصي وقبول أو رفض الترشيح.
      </p>
      <div style="text-align:center;">
        ${actionButton("/dashboard", "عرض الترشيح")}
      </div>
    `),
  };
}
