import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// Load env from the project root
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey || serviceRoleKey === 'PASTE_SERVICE_ROLE_KEY_HERE') {
  console.error('Error: Please provide actual SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function migrateTeachers() {
  console.log('Starting teacher password migration...')
  const newPassword = 'Murtaqa2024'

  // 1. Get all users from auth.users (via admin API)
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()
  
  if (listError) {
    console.error('Error listing users:', listError)
    return
  }

  const legacyTeachers = users.filter(u => u.email?.endsWith('@murtaqa.com'))
  console.log(`Found ${legacyTeachers.length} legacy teachers to update.`)

  for (const teacher of legacyTeachers) {
    console.log(`Updating password for: ${teacher.email}...`)
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      teacher.id,
      { password: newPassword }
    )

    if (updateError) {
      console.error(`Failed to update ${teacher.email}:`, updateError.message)
    } else {
      console.log(`Successfully updated ${teacher.email}`)
    }
  }

  console.log('Migration completed!')
}

migrateTeachers()
