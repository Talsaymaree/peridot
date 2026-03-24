import { redirect } from 'next/navigation'
import { ProfileChooser } from '@/components/profile-chooser'
import { isSupabaseConfigured } from '@/lib/supabase/config'

export default function ProfilesPage() {
  if (isSupabaseConfigured()) {
    redirect('/dashboard')
  }

  return <ProfileChooser />
}
