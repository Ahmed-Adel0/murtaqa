import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'

dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl!, serviceRoleKey!, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function generateReport() {
  console.log('Generating complete teachers report...')
  const tempPassword = 'Murtaqa2024'
  let allUsers: any[] = []
  let page = 1

  // 1. Fetch ALL users with pagination
  while (true) {
    const { data: { users }, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: 1000 // get as many as possible per request
    })
    
    if (error || !users || users.length === 0) break
    allUsers = [...allUsers, ...users]
    page++
    if (users.length < 1000) break
  }

  console.log(`Total auth users found: ${allUsers.length}`)

  // 2. Get all profiles for name matching
  const { data: profiles, error: profError } = await supabase.from('profiles').select('id, full_name, role')
  if (profError) return console.error(profError)

  const legacyTeachers = allUsers.filter(u => u.email?.endsWith('@murtaqa.com'))
  console.log(`Legacy filters matched: ${legacyTeachers.length}`)
  
  let report = '# القائمة الكاملة لبيانات دخول المعلمين\n\n'
  report += '| م | الاسم | البريد الإلكتروني المؤقت | كلمة المرور المؤقتة |\n'
  report += '| :--- | :--- | :--- | :--- |\n'

  let counter = 1
  for (const user of legacyTeachers) {
    const profile = profiles.find(p => p.id === user.id)
    if (profile && profile.role !== 'teacher' && !user.email.includes('teacher')) {
        // Skip if we know for sure it's not a teacher based on profile role
        // but often legacy accounts have role 'teacher'
    }
    const name = profile?.full_name || 'بدون اسم'
    report += `| ${counter} | ${name} | ${user.email} | \`${tempPassword}\` |\n`
    counter++
  }

  fs.writeFileSync(path.resolve(__dirname, '../teachers_login_data.md'), report)
  console.log(`Report updated with ${counter - 1} entries: teachers_login_data.md`)
}

generateReport()
