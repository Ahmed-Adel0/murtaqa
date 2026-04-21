# Murtaqa — Changes

Summary of the work delivered in this session. Grouped by feature, with file paths and the reasoning behind each decision.

---

## 1. Fix — `teacher_availability` table missing

**Symptom:** `Could not find the table 'public.teacher_availability' in the schema cache`.

**Root cause:** The migration [supabase/migrations/002_availability_payments_meetings.sql](supabase/migrations/002_availability_payments_meetings.sql) was never executed against the Supabase DB. The code in [src/components/dashboard/teacher/AvailabilityManager.tsx](src/components/dashboard/teacher/AvailabilityManager.tsx) and [src/actions/availability.ts](src/actions/availability.ts) referenced the table correctly.

**Fix:** Run the migration. The SQL is already in the file — no code change was needed. See the **Deployment** section at the bottom.

---

## 2. Feature — Admin notification on new registration

When a new student or teacher signs up (email or OAuth), every admin receives an in-app notification.

### Files

| File | Change |
|---|---|
| [src/lib/notifications.ts](src/lib/notifications.ts) | Added `new_student_register` and `new_teacher_register` notification types + `notifyAdminsOfNewRegistration(userId, role)` server action |
| [src/app/register/page.tsx](src/app/register/page.tsx) | Calls `notifyAdminsOfNewRegistration` after `signUp` succeeds |
| [src/app/auth/callback/route.ts](src/app/auth/callback/route.ts) | Reads `intended_role` cookie. Cookie is set only by the register page, so its presence distinguishes OAuth signups from OAuth logins. Fires the action and clears the cookie. |

### Safety

`notifyAdminsOfNewRegistration` has an abuse guard: it only fires if the profile's `created_at` is within 10 minutes. This prevents an attacker from replaying the action with an arbitrary `userId`.

### Notification content

- **Student:** `طالب جديد سجّل في المنصة` → `قام {name} بإنشاء حساب جديد...` → links to `/admin/students`.
- **Teacher:** `معلم جديد سجّل في المنصة` → `قام {name} بإنشاء حساب جديد...` → links to `/admin/applications`.

---

## 3. Sort admin students list by `created_at`

**File:** [src/app/admin/students/page.tsx](src/app/admin/students/page.tsx#L91-L101)

Changed the primary query and the `42703` fallback from `.order("updated_at", ...)` to `.order("created_at", ...)`. Newest students now appear first.

---

## 4. Feature — Full student-to-admin booking workflow

This is the largest change in the session. It covers:

- Extended student intake with all the fields required for triage.
- New admin queue page with status tabs, admin notes, match-teacher modal, WhatsApp notifications.
- Expanded payments flow with Zoom-link delivery via WhatsApp.
- 24-hour SLA enforcement via a visible overdue badge and banner.

### 4.1 Database migration

**File:** [supabase/migrations/003_booking_workflow.sql](supabase/migrations/003_booking_workflow.sql) (new)

| Change | Why |
|---|---|
| `bookings.status` check constraint replaced | Now accepts `new / pending / in_progress / accepted / confirmed / completed / cancelled`. Old values are retained so the existing `assignTrialLesson` / `requestEvaluation` / `activateSubscription` flow keeps working. |
| Added columns: `current_level`, `preferred_days text[]`, `preferred_times`, `notes`, `admin_notes` | Captures everything the student submits + gives the admin a place to log their coordination steps. |
| `teacher_id` made nullable | A student submits the request before a teacher is matched; `teacher_id` is populated later by the admin when they click "ربط بمعلم". |
| Partial index on `status = 'new'` | Keeps the admin queue query fast as volume grows. |
| New RLS policies | Students can insert their own booking (`auth.uid() = student_id`) and read their own bookings. |

### 4.2 Status meanings

| Status | Meaning | Student-facing stage |
|---|---|---|
| `new` | Submitted, not yet opened by admin | Waiting |
| `in_progress` | Admin has opened the request and started coordinating | Waiting |
| `accepted` | Teacher matched, awaiting payment | Payment |
| `confirmed` | Payment verified + scheduled | (terminal for the request) |
| `cancelled` | Admin canceled or no teacher available | Waiting (fall-through) |
| `pending` | (legacy) Trial lesson assigned by admin | Trial |
| `completed` | (legacy) Active subscription | Active |

`determineStage` in [src/components/dashboard/StudentDashboard.tsx](src/components/dashboard/StudentDashboard.tsx) was updated to handle all seven states.

### 4.3 Server actions

**File:** [src/actions/bookings.ts](src/actions/bookings.ts)

- `createStudentBookingRequest(payload)` — creates a `bookings` row with `status='new'`, then fires an admin notification linking to `/admin/bookings`.
- `updateBookingStatus({ bookingId, status, adminNotes?, teacherId? })` — admin-only. Performs the role check, updates the booking, optionally sets `teacher_id`, and:
  - Writes a row to `student_teacher_matches` when transitioning to `accepted`, so the match history stays in sync with the booking.
  - Sends a student-facing notification on `in_progress`, `accepted`, `confirmed`, `cancelled`.

### 4.4 Student intake form

**File:** [src/components/dashboard/StudentDashboard.tsx](src/components/dashboard/StudentDashboard.tsx)

Step 3 of `IntakeForm` was extended with the fields required by the spec:

| Field | Control |
|---|---|
| WhatsApp phone | Required `tel` input |
| Current level | Chips: `ممتاز / جيد جداً / متوسط / يحتاج متابعة` |
| Preferred days | Multi-select chips: `الأحد ... السبت` |
| Preferred times | Chips: `صباحاً / بعد الظهر / مساءً / ليلاً` |

On submit:
1. Updates the student profile (`city`, `phone`, `grade_level`).
2. Calls `createStudentBookingRequest` to persist the request.
3. Opens WhatsApp with a pre-filled summary message — **manual send**, as requested.

### 4.5 Admin bookings queue

**File:** [src/app/admin/bookings/page.tsx](src/app/admin/bookings/page.tsx) (new)

| Capability | Where |
|---|---|
| Status tabs with counts | Top of page: `جديد / قيد المراجعة / مقبول — بانتظار الدفع / مؤكد / ملغى` |
| Search by name / subject / phone / email / teacher | Search bar |
| Overdue SLA banner | Shown when any `new`/`in_progress` request is older than 24h |
| Per-row "فتح للمراجعة" | Sets status to `in_progress` |
| Per-row "ربط بمعلم" | Opens modal with teacher search; on confirm sets status to `accepted` + creates `student_teacher_matches` row |
| Per-row "تأكيد الحجز" | Shown after `accepted` — sets status to `confirmed` |
| Per-row "إلغاء" | Sets status to `cancelled` |
| Admin notes | Expandable textarea saved via `updateBookingStatus` (no status change) |
| WhatsApp button | Pre-filled "تمت الموافقة وتم توفير المعلم..." message on `accepted` rows, generic greeting otherwise |
| 24h overdue chip | Pulsing red "متأخر — تجاوز 24 ساعة" chip on each overdue card |

Admin navigation is wired in both entry points:
- [src/components/dashboard/AdminDashboard.tsx](src/components/dashboard/AdminDashboard.tsx) — new KPI mini-card "طلبات جديدة" + sidebar entry with badge.
- [src/components/dashboard/shared/AdminShell.tsx](src/components/dashboard/shared/AdminShell.tsx) — sidebar entry + active-path detection.

### 4.6 Analytics

**File:** [src/actions/analytics.ts](src/actions/analytics.ts)

Added `counts.requests = { new, in_progress, accepted }` so the dashboard KPI and sidebar badge can read counts without a separate query.

### 4.7 Admin payments — Zoom link via WhatsApp

**File:** [src/app/admin/payments/page.tsx](src/app/admin/payments/page.tsx)

After a payment is marked `verified`, the admin gets:
- An input for the Zoom URL (per-payment, kept in React state; not persisted to the DB).
- A green "إرسال عبر واتساب" button that opens WhatsApp with:
  ```
  السلام عليكم {studentName}،
  تم استلام وتأكيد مبلغ التحويل (X ريال).
  شكراً لثقتك بمرتقى أكاديمي.

  رابط الحصة:
  {zoomLink}

  الرجاء الدخول في الموعد المحدد.
  ```

The button is disabled until a URL is pasted. If the student has no phone on file, a small notice is shown instead of the button.

---

## 5. Data flow end-to-end

```
Student signs up
    └─ /register → supabase.auth.signUp → profile row auto-created
       └─ notifyAdminsOfNewRegistration → every admin sees "new student" notification

Student opens /dashboard
    └─ IntakeForm (step 1 grade → step 2 subject → step 3 details+phone)
       └─ createStudentBookingRequest → bookings row with status='new'
          └─ sendAdminNotifications → every admin sees "new request" notification
       └─ WhatsApp opened with pre-filled message (manual send)

Admin opens /admin/bookings
    └─ Tab: جديد → sees the new request
       └─ "فتح للمراجعة" → updateBookingStatus(status='in_progress')
          └─ Student gets notification "طلبك قيد المراجعة"
       └─ Admin logs coordination notes in the admin-notes textarea
       └─ "ربط بمعلم" → updateBookingStatus(status='accepted', teacherId)
          └─ student_teacher_matches row inserted (status='accepted')
          └─ Student gets "تم قبول طلبك" notification
          └─ Admin clicks "إبلاغ الطالب (واتساب)" → manual WhatsApp send

Student pays (via bank transfer)
    └─ /dashboard shows payment state → submits proof via submitPaymentProof
       └─ payments row (status='pending')
       └─ Admin notification

Admin opens /admin/payments
    └─ verifyPayment → payments.status='verified', verified_by=admin.id
    └─ Pastes Zoom URL → "إرسال عبر واتساب" button
       └─ WhatsApp message with confirmation + Zoom link sent manually

Admin on /admin/bookings
    └─ "تأكيد الحجز" → updateBookingStatus(status='confirmed')
       └─ Student gets "تم تأكيد حجزك" notification
```

---

## 6. Deployment

### Step 1 — run the migrations

If migration 002 and 003 have not been applied, run them both in the Supabase SQL editor in order.

1. Open https://app.supabase.com → your project → **SQL Editor** → **New query**.
2. Paste contents of [supabase/migrations/002_availability_payments_meetings.sql](supabase/migrations/002_availability_payments_meetings.sql) → **Run**.
3. Paste contents of [supabase/migrations/003_booking_workflow.sql](supabase/migrations/003_booking_workflow.sql) → **Run**.

If using the Supabase CLI: `supabase db push`.

### Step 2 — deploy the app

No environment variable changes, no new dependencies. A normal build/deploy of the Next.js app picks up all the code changes above.

### Step 3 — smoke test

- [ ] Create a student account → complete the intake form → confirm the booking appears in `/admin/bookings` under "جديد".
- [ ] As admin, click "فتح للمراجعة" → confirm the student sees a "طلبك قيد المراجعة" notification.
- [ ] As admin, click "ربط بمعلم" → confirm:
  - [ ] Status becomes `accepted`.
  - [ ] Row exists in `student_teacher_matches` with `status='accepted'`.
  - [ ] "إبلاغ الطالب (واتساب)" button opens WhatsApp with the approval message.
- [ ] Submit a payment → verify in `/admin/payments` → paste Zoom URL → confirm WhatsApp opens with the Zoom link and payment confirmation.
- [ ] Leave a `new` booking untouched for > 24h (or temporarily edit `SLA_HOURS` to test) → confirm the red "متأخر" chip + banner appear.

---

## 7. Gaps / known limitations

- The Zoom URL is **not persisted**. Admin must paste it per send. If you want it saved for later reference, add a `meetings.meeting_link` write when the admin hits the WhatsApp button, or add a column to `payments`.
- `student_teacher_matches` is used for accept-history only. The existing "suggest" algorithm in [src/lib/queries/matches.ts](src/lib/queries/matches.ts) is not integrated into the admin booking queue — admin picks teachers manually.
- 24-hour SLA is enforced visually only. There is no scheduled job that pages someone when a request goes overdue.
