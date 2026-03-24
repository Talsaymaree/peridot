import { redirect } from 'next/navigation'
import { getRememberedLocalProfile } from '@/lib/local-profiles-server'
import { isSupabaseConfigured } from '@/lib/supabase/config'

export default async function Home() {
  if (isSupabaseConfigured()) {
    redirect('/dashboard')
  }

  const rememberedProfile = await getRememberedLocalProfile()
  redirect(rememberedProfile ? '/dashboard' : '/profiles')
}
