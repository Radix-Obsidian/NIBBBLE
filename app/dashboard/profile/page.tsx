'use client'

import { ProfileManagement } from '@/app/components/profile/profile-management'
import { Button } from '@/app/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
  const { signOut } = useAuth()
  const router = useRouter()
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Profile</h2>
        <Button variant="outline" size="sm" onClick={async () => { await signOut(); router.replace('/signin') }}>Sign out</Button>
      </div>
      <ProfileManagement />
    </div>
  )
}
