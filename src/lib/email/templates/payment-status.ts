import { wrapInLayout, actionButton } from "./base-layout";

export function paymentVerifiedTemplate(data: { studentName: string; amount: string }) {
  return {
    subject: "تم تأكيد الدفع بنجاح",
    title: "تأكيد الدفع",
    plainText: `مرحباً ${data.studentName}، تم تأكيد عملية الدفع بمبلغ ${data.amount} ريال بنجاح.`,
    link: "/dashboard",
    html: wrapInLayout(`
      <div style="text-align:center;margin-bottom:24px;">
        <div style="display:inline-block;width:64px;height:64px;background:rgba(34,197,94,0.15);border-radius:50%;line-height:64px;font-size:28px;">&#10003;</div>
      </div>
      <h2 style="margin:0 0 16px;font-size:20px;font-weight:800;color:#22c55e;text-align:center;">تم تأكيد الدفع</h2>
      <p style="margin:0 0 8px;font-size:15px;color:rgba(255,255,255,0.7);line-height:1.7;">
        مرحباً ${data.studentName}،
      </p>
      <p style="margin:0 0 16px;font-size:15px;color:rgba(255,255,255,0.7);line-height:1.7;">
        تم تأكيد عملية الدفع بمبلغ <strong style="color:#fff;">${data.amount} ريال</strong> بنجاح. سيتم ترتيب الحصة الدراسية قريباً.
      </p>
      <div style="text-align:center;">
        ${actionButton("/dashboard", "عرض التفاصيل")}
      </div>
    `),
  };
}

export function paymentRejectedTemplate(data: { studentName: string; reason?: string }) {
  return {
    subject: "تحديث حالة الدفع",
    title: "لم يتم قبول الدفع",
    plainText: `مرحباً ${data.studentName}، لم يتم قبول عملية الدفع. ${data.reason || "يرجى التواصل مع الإدارة."}`,
    link: "/dashboard",
    html: wrapInLayout(`
      <h2 style="margin:0 0 16px;font-size:20px;font-weight:800;color:#ef4444;">لم يتم قبول الدفع</h2>
      <p style="margin:0 0 8px;font-size:15px;color:rgba(255,255,255,0.7);line-height:1.7;">
        مرحباً ${data.studentName}،
      </p>
      <p style="margin:0 0 16px;font-size:15px;color:rgba(255,255,255,0.7);line-height:1.7;">
        لم يتم قبول عملية الدفع.${data.reason ? ` السبب: <strong style="color:#fff;">${data.reason}</strong>` : ""} يرجى المحاولة مرة أخرى أو التواصل مع الإدارة.
      </p>
      <div style="text-align:center;">
        ${actionButton("/payment", "إعادة المحاولة")}
      </div>
    `),
  };
}
