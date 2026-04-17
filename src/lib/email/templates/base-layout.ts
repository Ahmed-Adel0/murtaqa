const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://murtaqa.com";

export function wrapInLayout(content: string): string {
  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap" rel="stylesheet" />
</head>
<body style="margin:0;padding:0;background:#0a0a0b;font-family:'Tajawal',Arial,sans-serif;direction:rtl;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0b;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#111114;border-radius:24px;border:1px solid rgba(255,255,255,0.08);overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="padding:32px 32px 0;text-align:center;">
              <h1 style="margin:0;font-size:24px;font-weight:800;color:#fff;">مُرتقى أكاديمي</h1>
              <div style="width:40px;height:3px;background:linear-gradient(90deg,#3b82f6,#8b5cf6);margin:12px auto 0;border-radius:2px;"></div>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding:32px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px 32px;border-top:1px solid rgba(255,255,255,0.05);text-align:center;">
              <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.3);">
                هذه الرسالة مُرسلة تلقائياً من منصة مُرتقى أكاديمي
              </p>
              <p style="margin:8px 0 0;font-size:12px;">
                <a href="${BASE_URL}" style="color:#3b82f6;text-decoration:none;">زيارة المنصة</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function actionButton(href: string, text: string): string {
  return `<a href="${BASE_URL}${href}" style="display:inline-block;background:#3b82f6;color:#fff;font-weight:700;font-size:14px;padding:14px 32px;border-radius:14px;text-decoration:none;margin-top:16px;">${text}</a>`;
}

export { BASE_URL };
