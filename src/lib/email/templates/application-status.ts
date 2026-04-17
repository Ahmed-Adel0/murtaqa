import { wrapInLayout, actionButton } from "./base-layout";

export function applicationApprovedTemplate(data: { teacherName: string }) {
  return {
    subject: "تم قبول طلبك في منصة مرتقى!",
    title: "تم قبول طلبك",
    plainText: `مبروك ${data.teacherName}! تم قبول طلبك كمعلم في منصة مرتقى أكاديمي.`,
    link: "/dashboard",
    html: wrapInLayout(`
      <div style="text-align:center;margin-bottom:24px;">
        <div style="display:inline-block;width:64px;height:64px;background:rgba(34,197,94,0.15);border-radius:50%;line-height:64px;font-size:28px;">&#10003;</div>
      </div>
      <h2 style="margin:0 0 16px;font-size:20px;font-weight:800;color:#22c55e;text-align:center;">تم قبول طلبك!</h2>
      <p style="margin:0 0 8px;font-size:15px;color:rgba(255,255,255,0.7);line-height:1.7;">
        مبروك ${data.teacherName}،
      </p>
      <p style="margin:0 0 16px;font-size:15px;color:rgba(255,255,255,0.7);line-height:1.7;">
        تم قبول طلبك كمعلم في منصة مرتقى أكاديمي. يمكنك الآن إكمال ملفك الشخصي وبدء استقبال الطلاب.
      </p>
      <div style="text-align:center;">
        ${actionButton("/dashboard", "الذهاب إلى لوحة التحكم")}
      </div>
    `),
  };
}

export function applicationRejectedTemplate(data: { teacherName: string }) {
  return {
    subject: "تحديث حالة ��لبك في منصة مرتقى",
    title: "تحديث حالة الطلب",
    plainText: `عزيزي ${data.teacherName}، نأسف لإبلاغك بأن طلبك لم يتم قبوله حالياً. يمكنك إعادة التقديم لاحقاً.`,
    link: "/dashboard",
    html: wrapInLayout(`
      <h2 style="margin:0 0 16px;font-size:20px;font-weight:800;color:#ef4444;">تحديث حالة الطلب</h2>
      <p style="margin:0 0 8px;font-size:15px;color:rgba(255,255,255,0.7);line-height:1.7;">
        عزيزي ${data.teacherName}،
      </p>
      <p style="margin:0 0 16px;font-size:15px;color:rgba(255,255,255,0.7);line-height:1.7;">
        نأسف لإبلاغك بأن طلبك لم يتم قبوله في الوقت الحالي. يمكنك مر��جعة بياناتك وإعادة التقديم لاحقاً.
      </p>
      <div style="text-align:center;">
        ${actionButton("/dashboard", "مراجع�� الطلب")}
      </div>
    `),
  };
}
